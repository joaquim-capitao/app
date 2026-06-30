export interface Article {
  title: string;
  summary: string;
  source: string;
  url: string;
  theme: string;
  date: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
}

export interface NewsResponse {
  globalBrief: string;
  articles: Article[];
}

export interface UserPreferences {
  topics: string[];
  language: string; // "pt" | "en" | "es"
  region: string; // e.g., "Brasil", "Portugal", "Global", "EUA", "Angola"
  tone: "highlights" | "summary" | "deep";
}
