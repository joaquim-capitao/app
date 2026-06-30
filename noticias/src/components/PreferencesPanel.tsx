import React, { useState } from "react";
import { UserPreferences } from "../types";
import { Sliders, Plus, X, Globe, MessageSquare, Tag, Check } from "lucide-react";

interface PreferencesPanelProps {
  preferences: UserPreferences;
  onChange: (newPrefs: UserPreferences) => void;
  onRefresh: () => void;
  loading: boolean;
}

const PRESET_TOPICS = [
  "Tecnologia & IA",
  "Economia & Finanças",
  "Desporto & Esportes",
  "Ciência & Espaço",
  "Saúde & Bem-estar",
  "Política Global",
  "Cultura & Entretenimento",
  "Ambiente & Clima",
  "Geopolítica"
];

const REGIONS = [
  { value: "Global", label: "Global 🌍" },
  { value: "Portugal", label: "Portugal 🇵🇹" },
  { value: "Brasil", label: "Brasil 🇧🇷" },
  { value: "EUA", label: "Estados Unidos 🇺🇸" },
  { value: "Europa", label: "Europa 🇪🇺" }
];

const LANGUAGES = [
  { value: "pt", label: "Português 🇵🇹🇧🇷" },
  { value: "en", label: "English 🇬🇧🇺🇸" },
  { value: "es", label: "Español 🇪🇸" }
];

const TONES = [
  { value: "highlights", label: "Tópicos rápidos", desc: "Bullet points concisos para ler em segundos" },
  { value: "summary", label: "Resumo equilibrado", desc: "1-2 parágrafos fluidos e objetivos por notícia" },
  { value: "deep", label: "Aprofundado", desc: "Fatos detalhados e análise de contexto" }
];

export default function PreferencesPanel({
  preferences,
  onChange,
  onRefresh,
  loading
}: PreferencesPanelProps) {
  const [customTopic, setCustomTopic] = useState("");

  const toggleTopic = (topic: string) => {
    let updatedTopics: string[];
    if (preferences.topics.includes(topic)) {
      // Keep at least one topic
      if (preferences.topics.length === 1) return;
      updatedTopics = preferences.topics.filter((t) => t !== topic);
    } else {
      updatedTopics = [...preferences.topics, topic];
    }
    onChange({ ...preferences, topics: updatedTopics });
  };

  const handleAddCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTopic = customTopic.trim();
    if (cleanTopic && !preferences.topics.includes(cleanTopic)) {
      onChange({
        ...preferences,
        topics: [...preferences.topics, cleanTopic]
      });
      setCustomTopic("");
    }
  };

  const removeTopic = (topic: string) => {
    if (preferences.topics.length === 1) return;
    onChange({
      ...preferences,
      topics: preferences.topics.filter((t) => t !== topic)
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 text-white shadow-xl" id="preferences-panel">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-white/10">
        <Sliders className="w-5 h-5 text-blue-400" />
        <h2 className="font-sans text-lg font-bold tracking-tight">Preferências de Curadoria</h2>
      </div>

      {/* Preset Topics Selection */}
      <div className="mb-6">
        <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-blue-400" /> Temas de Interesse (Selecione vários)
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_TOPICS.map((topic) => {
            const isSelected = preferences.topics.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                id={`preset-topic-${topic.replace(/\s+/g, '-').toLowerCase()}`}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  isSelected
                    ? "bg-blue-500/20 text-blue-100 border-blue-400/30 shadow-md shadow-blue-500/5"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-1">
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-300" />}
                  {topic}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Topic Form */}
      <form onSubmit={handleAddCustomTopic} className="mb-6" id="custom-topic-form">
        <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Adicionar Tema Personalizado
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Ex: Fórmula 1, Exploração de Marte, Criptomoedas..."
            maxLength={40}
            className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md transition-all"
            id="custom-topic-input"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-tr from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold border-0 rounded-xl shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
            id="add-custom-topic-btn"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Selected custom or non-preset tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {preferences.topics.map((topic) => {
            if (PRESET_TOPICS.includes(topic)) return null;
            return (
              <span
                key={topic}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white/10 text-white border border-white/15 rounded-lg"
              >
                {topic}
                <button
                  type="button"
                  onClick={() => removeTopic(topic)}
                  className="p-0.5 hover:text-red-400 transition-colors"
                  title="Remover tema"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      </form>

      {/* Region and Language Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" /> Região / Foco
          </label>
          <select
            value={preferences.region}
            onChange={(e) => onChange({ ...preferences, region: e.target.value })}
            className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            id="region-select"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value} className="bg-slate-950">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
            Idioma de Leitura
          </label>
          <select
            value={preferences.language}
            onChange={(e) => onChange({ ...preferences, language: e.target.value })}
            className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            id="language-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value} className="bg-slate-950">
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tone selection */}
      <div className="mb-6">
        <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Formato do Resumo AI
        </label>
        <div className="space-y-2">
          {TONES.map((t) => {
            const isSelected = preferences.tone === t.value;
            return (
              <label
                key={t.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-white/10 border-blue-400/30 shadow-lg"
                    : "bg-white/5 border-white/10 hover:border-white/25 text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="summary-tone"
                  value={t.value}
                  checked={isSelected}
                  onChange={() => onChange({ ...preferences, tone: t.value as any })}
                  className="mt-1 accent-blue-400"
                />
                <div>
                  <div className="text-sm font-bold text-white">{t.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Main Action Button */}
      <button
        onClick={onRefresh}
        disabled={loading}
        className="w-full py-4 px-4 font-sans text-base font-bold text-white bg-gradient-to-tr from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        id="fetch-news-btn"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Curando Notícias...
          </span>
        ) : (
          "Pesquisar e Agrupar Notícias"
        )}
      </button>
    </div>
  );
}
