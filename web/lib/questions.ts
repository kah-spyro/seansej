import { QuizQuestion } from "@/types";

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "mood",
    question: "What are you in the mood for?",
    options: [
      { label: "Laugh out loud", value: "comedy", emoji: "😂" },
      { label: "Get emotional", value: "emotional", emoji: "😢" },
      { label: "Feel the thrill", value: "thrill", emoji: "😱" },
      { label: "Relax & unwind", value: "relax", emoji: "😌" },
      { label: "Think deeply", value: "think", emoji: "🧠" },
    ],
  },
  {
    id: "company",
    question: "Who's watching with you?",
    options: [
      { label: "Just me", value: "solo", emoji: "🧑" },
      { label: "Date night", value: "partner", emoji: "💕" },
      { label: "Family with kids", value: "family", emoji: "👨‍👩‍👧" },
      { label: "Friends", value: "friends", emoji: "🍻" },
    ],
  },
  {
    id: "duration",
    question: "How much time do you have?",
    options: [
      { label: "Under 90 min", value: "short", emoji: "⚡" },
      { label: "90 – 120 min", value: "medium", emoji: "🎬" },
      { label: "Over 2 hours", value: "long", emoji: "🍿" },
      { label: "Doesn't matter", value: "any", emoji: "🤷" },
    ],
  },
  {
    id: "weight",
    question: "How heavy should it be?",
    options: [
      { label: "Light & breezy", value: "light", emoji: "🌤" },
      { label: "Somewhere in between", value: "balanced", emoji: "⚖️" },
      { label: "Deep & demanding", value: "heavy", emoji: "🌑" },
    ],
  },
  {
    id: "era",
    question: "Old or new?",
    options: [
      { label: "Classic (pre-2000)", value: "classic", emoji: "📽" },
      { label: "Modern (2000–2015)", value: "modern", emoji: "📺" },
      { label: "Recent (2016+)", value: "recent", emoji: "✨" },
      { label: "Don't care", value: "any", emoji: "🤷" },
    ],
  },
  {
    id: "quality",
    question: "What kind of pick?",
    options: [
      { label: "Acclaimed hit", value: "hit", emoji: "🏆" },
      { label: "Hidden gem", value: "gem", emoji: "💎" },
      { label: "Guilty pleasure", value: "guilty", emoji: "🙈" },
      { label: "Surprise me", value: "random", emoji: "🎲" },
    ],
  },
  {
    id: "setting",
    question: "Where are you watching?",
    options: [
      { label: "Cinema", value: "cinema", emoji: "🎭" },
      { label: "Big TV at home", value: "tv", emoji: "📺" },
      { label: "Laptop / phone in bed", value: "small", emoji: "🛋" },
    ],
  },
  {
    id: "platform",
    question: "Where will you stream it?",
    options: [
      { label: "Netflix", value: "netflix", emoji: "🔴" },
      { label: "Amazon Prime", value: "prime", emoji: "🔵" },
      { label: "Disney+", value: "disney", emoji: "✨" },
      { label: "HBO Max", value: "hbo", emoji: "🟣" },
      { label: "Apple TV+", value: "apple", emoji: "⬛" },
      { label: "No preference", value: "any", emoji: "🤷" },
    ],
  },
  {
    id: "exclusions",
    question: "Anything you want to avoid?",
    multiSelect: true,
    options: [
      { label: "Horror", value: "horror", emoji: "👻" },
      { label: "Romance", value: "romance", emoji: "💝" },
      { label: "Animation", value: "animation", emoji: "🎨" },
      { label: "Documentary", value: "documentary", emoji: "🎙" },
      { label: "Sci-Fi", value: "scifi", emoji: "🚀" },
      { label: "Musical", value: "musical", emoji: "🎵" },
    ],
  },
];
