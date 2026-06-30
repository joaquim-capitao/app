import React from "react";
import { Article } from "../types";
import { ExternalLink, Bookmark, BookmarkCheck, Newspaper, Award, Clock } from "lucide-react";
import { motion } from "motion/react";

interface NewsGridProps {
  articles: Article[];
  bookmarkedUrls: string[];
  onToggleBookmark: (article: Article) => void;
  language: string;
}

export default function NewsGrid({
  articles,
  bookmarkedUrls,
  onToggleBookmark,
  language
}: NewsGridProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-white/15 bg-white/5 backdrop-blur-md rounded-3xl p-8">
        <Newspaper className="w-14 h-14 mx-auto text-slate-500 mb-4 animate-pulse" />
        <h3 className="font-sans text-xl font-bold mb-2 text-white">
          {language === "pt" ? "Nenhuma notícia encontrada" : language === "es" ? "No se encontraron noticias" : "No news found"}
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          {language === "pt"
            ? "Ajuste as suas preferências e clique em 'Pesquisar e Agrupar Notícias' para iniciar uma nova busca em tempo real via IA."
            : language === "es"
            ? "Ajuste sus preferencias y haga clic en 'Pesquisar e Agrupar Notícias' para iniciar una nueva búsqueda vía IA."
            : "Adjust your preferences and click the search button to initiate a real-time AI news search."}
        </p>
      </div>
    );
  }

  // Find the top/highlight article (first HIGH importance or just the first article)
  const highImportanceArticles = articles.filter(a => a.importance === "HIGH");
  const featuredArticle = highImportanceArticles.length > 0 ? highImportanceArticles[0] : articles[0];
  const otherArticles = articles.filter(a => a !== featuredArticle);

  // Group other articles by theme
  const groupedArticlesByTheme: { [theme: string]: Article[] } = {};
  otherArticles.forEach((article) => {
    const theme = article.theme || "Geral";
    if (!groupedArticlesByTheme[theme]) {
      groupedArticlesByTheme[theme] = [];
    }
    groupedArticlesByTheme[theme].push(article);
  });

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "HIGH":
        return "bg-red-500/10 text-red-300 border border-red-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-300 border border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-300 border border-blue-500/20";
    }
  };

  return (
    <div className="space-y-10" id="news-grid-container">
      {/* 1. Featured Article (Frosted Glass Panel) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12"
        id={`featured-article-${featuredArticle.title.slice(0, 10).replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="p-6 md:p-8 md:col-span-8 flex flex-col justify-between">
          <div>
            {/* Tag / Meta */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                {featuredArticle.theme || "Destaque"}
              </span>
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${getImportanceBadge(featuredArticle.importance)}`}>
                ★ {language === "pt" ? "Destaque" : language === "es" ? "Destacado" : "Featured"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" /> {featuredArticle.date}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-sans text-2xl md:text-3.5xl font-extrabold leading-tight text-white hover:text-blue-300 transition-colors mb-4">
              <a href={featuredArticle.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-start gap-1">
                {featuredArticle.title}
                <ExternalLink className="w-5 h-5 mt-1 flex-shrink-0 text-slate-500" />
              </a>
            </h1>

            {/* Summary */}
            <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-6 whitespace-pre-line font-serif italic border-l-4 border-purple-500 pl-4">
              {featuredArticle.summary}
            </p>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
              Fonte: <strong className="text-white">{featuredArticle.source}</strong>
            </span>

            <div className="flex gap-2.5">
              <button
                onClick={() => onToggleBookmark(featuredArticle)}
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-all active:scale-95"
                title={language === "pt" ? "Salvar notícia" : "Guardar noticia"}
              >
                {bookmarkedUrls.includes(featuredArticle.url) ? (
                  <BookmarkCheck className="w-4.5 h-4.5 text-green-400" />
                ) : (
                  <Bookmark className="w-4.5 h-4.5 text-slate-300" />
                )}
              </button>
              <a
                href={featuredArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-tr from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
              >
                {language === "pt" ? "Ler Artigo Real" : language === "es" ? "Leer Artículo" : "Read Article"}
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic visual representation or colored accent block */}
        <div className="bg-gradient-to-br from-slate-900/60 to-purple-950/40 p-8 md:col-span-4 flex flex-col justify-center items-center text-center text-white border-t md:border-t-0 md:border-l border-white/10 min-h-[220px]">
          <Award className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
          <h4 className="font-sans font-extrabold text-lg mb-1 px-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
            {language === "pt" ? "Fato Principal" : language === "es" ? "Noticia Clave" : "Key Story"}
          </h4>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            {language === "pt" ? "Curadoria Inteligente" : "Smart Curated"}
          </span>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mt-4 rounded-full"></div>
        </div>
      </motion.div>

      {/* 2. List of Grouped News by Theme */}
      {Object.entries(groupedArticlesByTheme).map(([themeName, themeArticles], groupIdx) => (
        <div key={themeName} className="space-y-4" id={`theme-group-${themeName.replace(/\s+/g, '-').toLowerCase()}`}>
          
          {/* Theme Section Header */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-2">
            <span className="w-3.5 h-3.5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg shadow-md shadow-blue-500/20"></span>
            <h2 className="font-sans text-lg font-black tracking-wide uppercase text-white">
              {themeName}
            </h2>
            <span className="text-[11px] bg-white/10 text-slate-300 font-semibold border border-white/10 rounded-full px-2.5 py-0.5 font-mono">
              {themeArticles.length} {themeArticles.length === 1 ? (language === "pt" ? "notícia" : "noticia") : "notícias"}
            </span>
          </div>

          {/* Theme Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themeArticles.map((article, idx) => {
              const isBookmarked = bookmarkedUrls.includes(article.url);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (groupIdx * 0.1) + (idx * 0.05) }}
                  key={article.title}
                  id={`article-${idx}-${themeName.replace(/\s+/g, '-').toLowerCase()}`}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all p-5 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-400">
                        {article.source}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getImportanceBadge(article.importance)}`}>
                          {article.importance}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {article.date}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-sans text-base font-bold text-white leading-snug hover:text-blue-300 transition-colors mb-2.5">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-start gap-1">
                        {article.title}
                        <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" />
                      </a>
                    </h3>

                    {/* Summary */}
                    <div className="text-sm text-slate-300 leading-relaxed mb-4 whitespace-pre-line font-sans">
                      {article.summary}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline transition-colors"
                    >
                      {language === "pt" ? "Ver fonte original" : "Ver fuente original"} →
                    </a>

                    <button
                      onClick={() => onToggleBookmark(article)}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors"
                      title={language === "pt" ? "Salvar" : "Guardar"}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-green-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
