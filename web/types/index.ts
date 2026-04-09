export interface QuizAnswers {
  mood: "comedy" | "emotional" | "thrill" | "relax" | "think";
  company: "solo" | "partner" | "family" | "friends";
  duration: "short" | "medium" | "long" | "any";
  weight: "light" | "balanced" | "heavy";
  era: "classic" | "modern" | "recent" | "any";
  quality: "hit" | "gem" | "guilty" | "random";
  setting: "cinema" | "tv" | "small";
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
  /** Material Symbols icon name */
  icon: string;
  /** Short subtitle / description */
  sub?: string;
  /** Tailwind classes for card size/aspect ratio */
  cardClass?: string;
  /** 2-3 local background images for cinematic card overlay — one is picked randomly on mount */
  bgImages?: string[];
  /** Legacy emoji — kept for profile summary labels */
  emoji?: string;
}

export interface QuizQuestion {
  id: keyof QuizAnswers;
  /** HTML string — may contain <span> for styling */
  question: string;
  /** Plain-text label used in profile summary */
  label: string;
  options: QuizOption[];
  multiSelect?: boolean;
  /** Tailwind grid classes for this question's option layout */
  gridClass?: string;
  /** Cinematic quote shown on the right of the header */
  quote?: string;
}
