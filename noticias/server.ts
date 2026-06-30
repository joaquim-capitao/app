import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint to search and group news
app.post("/api/news", async (req, res) => {
  try {
    const { topics, language = "pt", region = "Global", customQuery, tone = "summary" } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: "O parâmetro 'topics' (lista de temas) é obrigatório." });
    }

    // Capture current date/time to assist grounding queries
    const today = new Date().toLocaleDateString("pt-PT", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Formulate a robust prompt to search news on Google
    let searchInstructions = `Hoje é ${today}. Pesquise no Google as principais notícias e acontecimentos mais recentes do dia`;
    if (region && region !== "Global") {
      searchInstructions += ` na região ou país: ${region}`;
    }
    searchInstructions += `.
Concentre-se em encontrar notícias atuais e relevantes relacionadas aos seguintes temas do interesse do usuário: ${topics.join(", ")}.`;

    if (customQuery && customQuery.trim().length > 0) {
      searchInstructions += `\nAdicionalmente, pesquise de forma prioritária sobre esta busca específica do usuário: "${customQuery}".`;
    }

    searchInstructions += `\n\nDiretrizes de Resposta:
1. Retorne as principais notícias encontradas agrupadas por temas. Mapeie cada notícia para um dos temas preferidos do usuário (${topics.join(", ")}) ou crie um novo tema relevante se a notícia for de extrema importância e não se encaixar em nenhum.
2. Forneça resumos no tom "${tone}":
   - "highlights": Resumo curto em tópicos/bullet points rápidos.
   - "summary": Um resumo conciso, elegante e de fácil leitura de 1 a 2 parágrafos.
   - "deep": Detalhes mais aprofundados dos pontos principais da notícia.
3. Para cada artigo retornado, certifique-se de preencher a URL real e legítima da fonte encontrada na pesquisa. Não invente caminhos genéricos fictícios.
4. Escreva toda a resposta estritamente no idioma selecionado: "${language === "pt" ? "Português" : language === "es" ? "Espanhol" : "Inglês"}".`;

    // Define strict JSON schema for structured output
    const newsResponseSchema = {
      type: Type.OBJECT,
      properties: {
        globalBrief: {
          type: Type.STRING,
          description: "Um resumo geral de 1 ou 2 frases elegantes descrevendo as principais tendências e o clima das notícias do dia.",
        },
        articles: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "O título ou manchete da notícia." },
              summary: { type: Type.STRING, description: "O resumo conciso da notícia, estruturado de acordo com o tom solicitado." },
              source: { type: Type.STRING, description: "O nome do portal de notícias de origem (ex: G1, Público, BBC, El País, CNN)." },
              url: { type: Type.STRING, description: "A URL completa e legítima do artigo de origem obtido da pesquisa." },
              theme: { type: Type.STRING, description: "O tema ao qual a notícia foi associada (preferencialmente um dos temas do usuário ou tema geral relevante)." },
              date: { type: Type.STRING, description: "Tempo decorrido ou data aproximada (ex: 'Há 1 hora', 'Hoje', '30 de Junho')." },
              importance: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"], description: "Grau de relevância editorial da notícia." }
            },
            required: ["title", "summary", "source", "url", "theme", "date", "importance"]
          }
        }
      },
      required: ["globalBrief", "articles"]
    };

    // Query Gemini with search grounding enabled
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: searchInstructions,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: newsResponseSchema,
        temperature: 0.2, // low temperature for precise factual extraction
        systemInstruction: "Você é um jornalista digital sênior e curador de notícias inteligentes. Use o Google Search para encontrar fatos reais e recentes. Organize as informações de forma concisa, transparente e neutra."
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("O modelo Gemini retornou uma resposta vazia.");
    }

    // Parse the structured JSON news data
    const newsData = JSON.parse(resultText);

    // Try to inject source URLs from grounding metadata chunks as fallback if any URL is missing or placeholder
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && Array.isArray(groundingChunks) && newsData.articles) {
      const webLinks = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri);

      if (webLinks.length > 0) {
        newsData.articles = newsData.articles.map((article: any, index: number) => {
          // If URL looks suspicious, blank, or generic, fallback to one of the real retrieved web URIs
          if (!article.url || article.url.includes("example.com") || article.url === "" || article.url.length < 10) {
            const fallbackLink = webLinks[index % webLinks.length];
            article.url = fallbackLink.uri;
            if (article.source === "Fonte" || !article.source) {
              article.source = fallbackLink.title || "Pesquisa Google";
            }
          }
          return article;
        });
      }
    }

    return res.json(newsData);
  } catch (error: any) {
    console.error("Erro ao buscar notícias:", error);
    res.status(500).json({
      error: "Falha ao recuperar e organizar as notícias do dia.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Rodando em http://localhost:${PORT}`);
  });
}

startServer();
