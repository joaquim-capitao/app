import React, { useState, useEffect } from "react";
import { Article, UserPreferences } from "./types";
import PreferencesPanel from "./components/PreferencesPanel";
import NewsGrid from "./components/NewsGrid";
import SavedArticles from "./components/SavedArticles";
import { Newspaper, Search, RefreshCw, BookmarkCheck, Calendar, Sparkles, AlertTriangle, Globe, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const DEFAULT_PREFS: UserPreferences = {
  topics: ["Tecnologia & IA", "Economia & Finanças", "Ciência & Espaço"],
  language: "pt",
  region: "Global",
  tone: "summary"
};

export default function App() {
  // States
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem("news_curator_preferences");
    return saved ? JSON.parse(saved) : DEFAULT_PREFS;
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [globalBrief, setGlobalBrief] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [customSearchQuery, setCustomSearchQuery] = useState<string>("");

  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem("bookmarked_news_articles");
    return saved ? JSON.parse(saved) : [];
  });

  // Save preferences to local storage on change
  useEffect(() => {
    localStorage.setItem("news_curator_preferences", JSON.stringify(preferences));
  }, [preferences]);

  // Initial fetch of news
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (specificQuery?: string) => {
    setLoading(true);
    setError(null);

    // Dynamic loading status messages for user delight
    const steps = [
      preferences.language === "pt" ? "Consultando o Google Search para as notícias do dia..." : "Consultando Google Search...",
      preferences.language === "pt" ? "Extraindo artigos das fontes confiáveis..." : "Extraendo fuentes de noticias...",
      preferences.language === "pt" ? "Analisando relevância com o Gemini 3.5..." : "Analizando relevancia...",
      preferences.language === "pt" ? "Agrupando notícias em temas personalizados..." : "Agrupando noticias...",
      preferences.language === "pt" ? "Redigindo resumos editoriais inteligentes..." : "Redactando resúmenes..."
    ];

    let stepIndex = 0;
    setLoadingStep(steps[0]);

    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStep(steps[stepIndex]);
    }, 2000);

    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: preferences.topics,
          language: preferences.language,
          region: preferences.region,
          tone: preferences.tone,
          customQuery: specificQuery || customSearchQuery || undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Falha ao processar as notícias.");
      }

      const data = await response.json();
      setArticles(data.articles || []);
      setGlobalBrief(data.globalBrief || "");
    } catch (err: any) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSearchQuery.trim()) {
      fetchNews(customSearchQuery);
    }
  };

  const handleClearCustomSearch = () => {
    setCustomSearchQuery("");
    fetchNews("");
  };

  const handleToggleBookmark = (article: Article) => {
    const isBookmarked = bookmarkedArticles.some((a) => a.url === article.url);
    let updated: Article[];

    if (isBookmarked) {
      updated = bookmarkedArticles.filter((a) => a.url !== article.url);
    } else {
      updated = [...bookmarkedArticles, article];
    }

    setBookmarkedArticles(updated);
    localStorage.setItem("bookmarked_news_articles", JSON.stringify(updated));
  };

  const handleClearBookmarks = () => {
    setBookmarkedArticles([]);
    localStorage.removeItem("bookmarked_news_articles");
  };

  // Date Formatter Helper based on selected language
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    const locale = preferences.language === "pt" ? "pt-PT" : preferences.language === "es" ? "es-ES" : "en-US";
    return new Date().toLocaleDateString(locale, options);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans antialiased relative overflow-x-hidden selection:bg-purple-600 selection:text-white" id="main-container">
      
      {/* Mesh Gradient Background Glow Elements */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top Status Bar (Frosted Glass Panel style) */}
      <div className="relative z-20 bg-white/5 backdrop-blur-md border-b border-white/10 py-2.5 px-6 text-xs font-mono flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-widest">Edição Digital</span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-slate-400" /> Curadoria Regional: <strong className="text-white">{preferences.region}</strong>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Gemini 3.5 Grounding Ativo
          </span>
          <span className="text-white/20">|</span>
          <span className="text-slate-200 font-semibold">William of Baskerville</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Header Block (Frosted Glass Frame) */}
        <header className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl text-center space-y-4" id="newspaper-header">
          <div className="inline-flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h1 className="font-sans text-3xl md:text-5xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 select-none">
              O Diário Cognitivo
            </h1>
          </div>
          <p className="font-sans text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A verdade do dia organizada sob medida: as principais notícias do mundo, pesquisadas em tempo real e estruturadas em temas com base nos seus interesses.
          </p>

          <div className="pt-4 border-t border-white/5 flex flex-wrap justify-between items-center text-xs font-mono text-slate-400">
            <span>Volume I • Edição Digital AI</span>
            <span className="capitalize flex items-center gap-1.5 justify-center text-purple-300 font-semibold">
              <Calendar className="w-4 h-4 text-purple-400" /> {getFormattedDate()}
            </span>
            <span>Acesso Livre</span>
          </div>
        </header>

        {/* Global Summary Panel */}
        {globalBrief && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-2xl flex items-start gap-4 shadow-xl"
            id="global-brief-banner"
          >
            <div className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white rounded-xl p-2.5 flex-shrink-0 shadow-md">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-sans text-xs font-black uppercase tracking-wider text-blue-400 mb-1">
                {preferences.language === "pt" ? "Resumo Editorial Global" : preferences.language === "es" ? "Resumen Editorial" : "Global Editorial Brief"}
              </span>
              <p className="font-sans text-sm leading-relaxed text-slate-200">
                {globalBrief}
              </p>
            </div>
          </motion.div>
        )}

        {/* Two Column Layout (Main content & Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Sidebar Preferences & Saved articles (Width 4/12) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-4" id="sidebar-curator">
            <PreferencesPanel
              preferences={preferences}
              onChange={setPreferences}
              onRefresh={() => fetchNews()}
              loading={loading}
            />

            <SavedArticles
              savedArticles={bookmarkedArticles}
              onRemove={handleToggleBookmark}
              onClearAll={handleClearBookmarks}
              language={preferences.language}
            />

            {/* AI Assistant Info Block */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-xs text-slate-300 leading-relaxed shadow-lg">
              <h5 className="font-bold mb-2 text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" /> Como funciona esta busca?
              </h5>
              <p>
                Esta aplicação não utiliza feeds RSS estáticos. Ao clicar em buscar, nosso servidor dispara uma pesquisa em tempo real no Google Search usando a API do Gemini com Grounding. A inteligência artificial analisa os resultados indexados nas últimas horas, sintetiza os fatos, extrai links reais de portais jornalísticos e monta este jornal exclusivo para você.
              </p>
            </div>
          </aside>

          {/* RIGHT COLUMN: Custom Search and News Output Grid (Width 8/12) */}
          <main className="lg:col-span-8 space-y-6" id="news-main-feed">
            
            {/* Custom Search bar */}
            <form onSubmit={handleCustomSearchSubmit} className="flex gap-3" id="search-bar-form">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={customSearchQuery}
                  onChange={(e) => setCustomSearchQuery(e.target.value)}
                  placeholder={
                    preferences.language === "pt"
                      ? "Fazer busca extra (ex: Copa do Mundo, fusão nuclear, Apple Keynote...)"
                      : "Buscar tema extra..."
                  }
                  className="w-full pl-11 pr-10 py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md transition-all shadow-inner"
                  id="search-input"
                />
                {customSearchQuery && (
                  <button
                    type="button"
                    onClick={handleClearCustomSearch}
                    className="absolute right-4 top-3 py-1 px-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    X
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !customSearchQuery.trim()}
                className="px-6 py-3 bg-gradient-to-tr from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
                id="search-submit-btn"
              >
                {preferences.language === "pt" ? "Buscar" : "Buscar"}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="p-5 bg-red-950/40 border border-red-500/30 text-red-200 rounded-2xl flex gap-3 items-start backdrop-blur-md shadow-lg">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-sans font-black text-base text-red-300">Falha na Curadoria das Notícias</h4>
                  <p className="text-sm mt-1 mb-3">{error}</p>
                  <button
                    onClick={() => fetchNews()}
                    className="px-4 py-1.5 bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow hover:bg-red-700 transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}

            {/* News Output Grid Area */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {loading ? (
                  /* Editorial Loading Screen */
                  <motion.div
                    key="loading-editorial"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-24 text-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 shadow-2xl"
                    id="loading-spinner-container"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Newspaper className="w-10 h-10 text-white animate-pulse" />
                      </div>
                      <RefreshCw className="w-6 h-6 text-purple-300 absolute -bottom-1 -right-1 animate-spin" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-sans text-xl font-bold tracking-tight text-white">
                        Sintetizando Edição Diária...
                      </h3>
                      <p className="text-sm font-mono text-slate-400 max-w-sm animate-pulse">
                        ✨ {loadingStep}
                      </p>
                    </div>

                    <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-[loadingBar_2s_infinite]"></div>
                    </div>
                  </motion.div>
                ) : (
                  /* Standard News Feed */
                  <motion.div
                    key="news-grid-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <NewsGrid
                      articles={articles}
                      bookmarkedUrls={bookmarkedArticles.map((b) => b.url)}
                      onToggleBookmark={handleToggleBookmark}
                      language={preferences.language}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Footer editorial signature */}
      <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md py-10 mt-16 px-4 text-center text-xs text-slate-400 font-sans space-y-2 select-none">
        <p className="font-bold uppercase tracking-widest text-white">
          O Diário Cognitivo • Curador de Notícias Inteligente
        </p>
        <p className="italic">
          Tecnologias: React, Tailwind CSS, Google Gemini 3.5 com Google Search Grounding.
        </p>
        <p className="text-[10px] text-slate-500 font-mono">
          Nenhum direito reservado. Feito com amor por William of Baskerville.
        </p>
      </footer>
    </div>
  );
}
