export interface QuizAnswers {
  mood: "comedy" | "emotional" | "thrill" | "relax" | "think";
  company: "solo" | "partner" | "family" | "friends";
  duration: "short" | "medium" | "long" | "any";
  weight: "light" | "balanced" | "heavy";
  era: "classic" | "modern" | "recent" | "any";
  quality: "hit" | "gem" | "guilty" | "random";
  setting: "cinema" | "tv" | "small";
  platform: "netflix" | "prime" | "disney" | "hbo" | "apple" | "any";
  exclusions: Array<
    "horror" | "romance" | "animation" | "documentary" | "scifi" | "musical"
  >;
}

export interface WatchProvider {
  id: number;
  name: string;
  logo: string; // path only, e.g. "/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg"
}

export interface Recommendation {
  tmdbId: number;
  mediaType: "movie" | "tv";
  why: string;
  title: string;
  year: string;
  rating: number;
  posterUrl: string | null;
  stream: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
  watchLink: string | null;
}

export interface RecommendResponse {
  recommendations: Recommendation[];
  closing: string;
  chatHistory: ClaudeMessage[];
}

export type ClaudeMessage = {
  role: "user" | "assistant";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
};

export interface QuizOption {
  label: string;
  value: string;
  emoji?: string;
}

export interface QuizQuestion {
  id: keyof QuizAnswers;
  question: string;
  options: QuizOption[];
  multiSelect?: boolean;
}
