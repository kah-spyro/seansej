import { QuizAnswers } from "@/types";

const MOOD_DESC: Record<QuizAnswers["mood"], string> = {
  comedy: "user chce się pośmiać, potrzebuje humoru i lekkości",
  emotional: "user chce emocjonalnego, poruszającego przeżycia",
  thrill: "user chce thrillera/napięcia, czegoś wciągającego",
  relax: "user chce się zrelaksować, nic ciężkiego, komfortowe oglądanie",
  think: "user chce czegoś intelektualnie stymulującego, do myślenia",
};

const COMPANY_DESC: Record<QuizAnswers["company"], string> = {
  solo: "ogląda sam/sama",
  partner: "ogląda z partnerem/partnerką, wieczór we dwoje",
  family: "ogląda z rodziną (w tym dzieci), musi być uniwersalne",
  friends: "ogląda ze znajomymi, musi być dobre do wspólnego oglądania",
};

const DURATION_DESC: Record<QuizAnswers["duration"], string> = {
  short: "film krótki, poniżej 90 minut",
  medium: "film standardowy, 90–120 minut",
  long: "film długi, powyżej 2 godzin — ma czas",
  any: "czas nie ma znaczenia",
};

const WEIGHT_DESC: Record<QuizAnswers["weight"], string> = {
  light: "lekkie i bezpretensjonalne, nic ciężkiego",
  balanced: "wyważone — ani za lekkie, ani za głębokie",
  heavy: "głębokie i wymagające, nie boi się trudnych tematów",
};

const ERA_DESC: Record<QuizAnswers["era"], string> = {
  classic: "filmy klasyczne sprzed 2000 roku",
  modern: "filmy z lat 2000–2015",
  recent: "filmy najnowsze, z 2016 roku lub późniejsze",
  any: "era nie ma znaczenia",
};

const QUALITY_DESC: Record<QuizAnswers["quality"], string> = {
  hit: "głośny hit, uznany przez krytyków i widzów",
  gem: "mało znany klejnot, coś do odkrycia",
  guilty: "guilty pleasure — niekoniecznie high-brow, ale sprawia radość",
  random: "cokolwiek — zaskocz mnie",
};

const SETTING_DESC: Record<QuizAnswers["setting"], string> = {
  cinema: "ogląda w kinie — ekran, dźwięk, pełne doznanie",
  tv: "duży telewizor w domu",
  small: "laptop lub telefon, leżąc w łóżku",
};

const PLATFORM_DESC: Record<QuizAnswers["platform"], string> = {
  netflix: "Netflix",
  prime: "Amazon Prime Video",
  disney: "Disney+",
  hbo: "HBO Max",
  apple: "Apple TV+",
  any: "dowolna platforma, brak preferencji",
};

const EXCLUSION_LABELS: Record<
  QuizAnswers["exclusions"][number],
  string
> = {
  horror: "horror",
  romance: "romans",
  animation: "animacja",
  documentary: "dokumentalny",
  scifi: "sci-fi",
  musical: "musical",
};

export function buildPrompt(answers: QuizAnswers): string {
  const lines = ["Oto mój profil filmowy:\n"];

  lines.push(`- **Nastrój:** ${MOOD_DESC[answers.mood]}`);
  lines.push(`- **Z kim oglądam:** ${COMPANY_DESC[answers.company]}`);
  lines.push(`- **Czas / długość:** ${DURATION_DESC[answers.duration]}`);
  lines.push(`- **Ciężar:** ${WEIGHT_DESC[answers.weight]}`);
  lines.push(`- **Era:** ${ERA_DESC[answers.era]}`);
  lines.push(`- **Jakość/reputacja:** ${QUALITY_DESC[answers.quality]}`);
  lines.push(`- **Gdzie oglądam:** ${SETTING_DESC[answers.setting]}`);
  lines.push(`- **Platforma:** ${PLATFORM_DESC[answers.platform]}`);

  if (answers.exclusions.length > 0) {
    const exList = answers.exclusions
      .map((e) => EXCLUSION_LABELS[e])
      .join(", ");
    lines.push(`- **Unikam gatunków:** ${exList}`);
  } else {
    lines.push("- **Unikam gatunków:** brak wykluczeń");
  }

  lines.push(
    "\nZnajdź mi dokładnie 3 propozycje. Pamiętaj — używaj search_movies, uzasadnienia mają być osobiste i odnosić się do mojego profilu."
  );

  return lines.join("\n");
}
