import React from "react";
import { Article } from "../types";
import { Trash2, ExternalLink, BookmarkCheck, Heart } from "lucide-react";

interface SavedArticlesProps {
  savedArticles: Article[];
  onRemove: (article: Article) => void;
  onClearAll: () => void;
  language: string;
}

export default function SavedArticles({
  savedArticles,
  onRemove,
  onClearAll,
  language
}: SavedArticlesProps) {
  if (savedArticles.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 text-center shadow-xl" id="saved-articles-empty">
        <Heart className="w-8 h-8 mx-auto text-slate-500 mb-3 animate-pulse" />
        <h4 className="font-sans font-bold text-sm text-white">
          {language === "pt" ? "Nenhuma notícia salva" : "Sin noticias guardadas"}
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          {language === "pt"
            ? "Clique no ícone de marcador nas notícias para salvá-las e lê-las depois nesta lista."
            : "Haga clic en el marcador de las noticias para guardarlas y leerlas después."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl text-white" id="saved-articles-panel">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-5 h-5 text-blue-400" />
          <h3 className="font-sans font-bold text-sm">
            {language === "pt" ? "Notícias Salvas" : "Noticias Guardadas"} ({savedArticles.length})
          </h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline transition-colors"
          title={language === "pt" ? "Limpar tudo" : "Limpiar todo"}
          id="clear-all-saved-btn"
        >
          {language === "pt" ? "Limpar todas" : "Limpiar todas"}
        </button>
      </div>

      {/* List */}
      <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {savedArticles.map((article) => (
          <div
            key={article.url}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex justify-between gap-3 items-start shadow-sm"
            id={`saved-article-${article.title.slice(0, 10).replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className="flex-1">
              {/* Category / Source */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-500/20 border border-blue-500/20 px-2 py-0.5 rounded-full text-blue-300">
                  {article.theme}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {article.source}
                </span>
              </div>

              {/* Title */}
              <h5 className="font-sans text-xs font-bold text-white leading-tight hover:text-blue-300 transition-colors mb-1">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline inline-flex items-center gap-0.5"
                >
                  {article.title}
                  <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />
                </a>
              </h5>
            </div>

            {/* Remove Action Button */}
            <button
              onClick={() => onRemove(article)}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
              title={language === "pt" ? "Remover" : "Remover"}
              id={`remove-saved-${article.title.slice(0, 10).replace(/\s+/g, '-').toLowerCase()}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
