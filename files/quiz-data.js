// ══════════════════════════════════════════════════════════════════════
// Quiz data — 9 questions with per-question grid layouts
// Each question declares its own grid template + card sizes,
// preserving the "editorial" feel from Stitch mockups.
// ══════════════════════════════════════════════════════════════════════

const QUIZ = [
  // ─── Q1: MOOD ───────────────────────────────────────────────────────
  {
    id: "mood",
    question: 'What are you in the <span class="text-primary italic">mood</span> for?',
    type: "single",
    // 5 options — asymmetric grid: 2+3 with one wide "Relax" card
    gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    options: [
      {
        value: "comedy",
        title: "Laugh out loud",
        sub: "Comedy, satire, and lighthearted fun.",
        icon: "sentiment_very_satisfied",
        cardClass: "aspect-[4/3]",
      },
      {
        value: "emotional",
        title: "Get emotional",
        sub: "Touching dramas and heart-wrenching stories.",
        icon: "heart_broken",
        cardClass: "aspect-[4/3]",
      },
      {
        value: "thrill",
        title: "Feel the thrill",
        sub: "Suspense, action, and heart-pounding mystery.",
        icon: "bolt",
        cardClass: "aspect-[4/3] md:col-span-2 lg:col-span-1",
      },
      {
        value: "relax",
        title: "Relax & unwind",
        sub: "Feel-good movies and cozy visual journeys.",
        icon: "spa",
        cardClass: "aspect-[16/9] md:col-span-2",
      },
      {
        value: "think",
        title: "Think deeply",
        sub: "Thought-provoking docs and complex indies.",
        icon: "psychology",
        cardClass: "aspect-[1/1]",
      },
    ],
  },

  // ─── Q2: COMPANY ────────────────────────────────────────────────────
  {
    id: "company",
    question: 'Who\'s <span class="text-primary italic">watching</span> with you?',
    type: "single",
    gridClass: "grid-cols-1 md:grid-cols-2",
    options: [
      { value: "solo", title: "Just me", sub: "A personal cinematic retreat.", icon: "person", cardClass: "aspect-[16/9]" },
      { value: "partner", title: "Date night", sub: "Something for the two of you.", icon: "favorite", cardClass: "aspect-[16/9]" },
      { value: "family", title: "Family with kids", sub: "Universal, multi-generational picks.", icon: "family_restroom", cardClass: "aspect-[16/9]" },
      { value: "friends", title: "Friends", sub: "Group watching, energetic vibe.", icon: "groups", cardClass: "aspect-[16/9]" },
    ],
  },

  // ─── Q3: DURATION ───────────────────────────────────────────────────
  {
    id: "duration",
    question: 'How much <span class="text-primary italic">time</span> do you have?',
    type: "single",
    gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    options: [
      { value: "short", title: "Under 90 min", sub: "Quick and punchy.", icon: "timer", cardClass: "aspect-[3/4]" },
      { value: "medium", title: "90 – 120 min", sub: "The classic runtime.", icon: "schedule", cardClass: "aspect-[3/4]" },
      { value: "long", title: "Over 2 hours", sub: "Epic journeys welcome.", icon: "hourglass_top", cardClass: "aspect-[3/4]" },
      { value: "any", title: "Doesn't matter", sub: "Surprise me with length.", icon: "all_inclusive", cardClass: "aspect-[3/4]" },
    ],
  },

  // ─── Q4: WEIGHT ─────────────────────────────────────────────────────
  {
    id: "weight",
    question: 'How <span class="text-primary italic">heavy</span> should it be?',
    type: "single",
    gridClass: "grid-cols-1 md:grid-cols-3",
    options: [
      { value: "light", title: "Light & breezy", sub: "Easy to watch, uplifting.", icon: "air", cardClass: "aspect-[4/5]" },
      { value: "balanced", title: "Somewhere in between", sub: "A thoughtful middle ground.", icon: "balance", cardClass: "aspect-[4/5]" },
      { value: "heavy", title: "Deep & demanding", sub: "Complex, emotionally dense.", icon: "waves", cardClass: "aspect-[4/5]" },
    ],
  },

  // ─── Q5: ERA ────────────────────────────────────────────────────────
  {
    id: "era",
    question: '<span class="text-primary italic">Old</span> or new?',
    type: "single",
    gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    options: [
      { value: "classic", title: "Classic", sub: "Pre-2000 masterpieces.", icon: "history_edu", cardClass: "aspect-[3/4]" },
      { value: "modern", title: "Modern", sub: "2000 – 2015 era.", icon: "movie", cardClass: "aspect-[3/4]" },
      { value: "recent", title: "Recent", sub: "2016 and newer.", icon: "auto_awesome", cardClass: "aspect-[3/4]" },
      { value: "any", title: "Don't care", sub: "Any era works.", icon: "all_inclusive", cardClass: "aspect-[3/4]" },
    ],
  },

  // ─── Q6: QUALITY ────────────────────────────────────────────────────
  {
    id: "quality",
    question: 'What kind of <span class="text-primary italic">pick</span>?',
    type: "single",
    gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    options: [
      { value: "hit", title: "Acclaimed hit", sub: "Critically loved, well-known.", icon: "star", cardClass: "aspect-[4/5]" },
      { value: "gem", title: "Hidden gem", sub: "Under-the-radar brilliance.", icon: "diamond", cardClass: "aspect-[4/5]" },
      { value: "guilty", title: "Guilty pleasure", sub: "Fun over prestige.", icon: "local_fire_department", cardClass: "aspect-[4/5]" },
      { value: "random", title: "Surprise me", sub: "The Curator chooses.", icon: "shuffle", cardClass: "aspect-[4/5]" },
    ],
  },

  // ─── Q7: SETTING ────────────────────────────────────────────────────
  {
    id: "setting",
    question: '<span class="text-primary italic">Where</span> are you watching?',
    type: "single",
    gridClass: "grid-cols-1 md:grid-cols-3",
    options: [
      { value: "cinema", title: "Cinema", sub: "Big screen experience.", icon: "theaters", cardClass: "aspect-[4/5]" },
      { value: "tv", title: "Big TV at home", sub: "Couch and surround sound.", icon: "tv", cardClass: "aspect-[4/5]" },
      { value: "small", title: "Laptop / phone in bed", sub: "Intimate, close viewing.", icon: "smartphone", cardClass: "aspect-[4/5]" },
    ],
  },

  // ─── Q8: STREAMING PLATFORM ─────────────────────────────────────────
  {
    id: "platforms",
    question: '<span class="text-primary italic">Where</span> will you stream it?',
    type: "single", // PRD says single, "No preference" skips the filter
    gridClass: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    options: [
      { value: "netflix", title: "Netflix", sub: "", icon: "play_circle", cardClass: "aspect-square" },
      { value: "prime", title: "Amazon Prime", sub: "", icon: "play_circle", cardClass: "aspect-square" },
      { value: "disney", title: "Disney+", sub: "", icon: "play_circle", cardClass: "aspect-square" },
      { value: "hbo", title: "HBO Max", sub: "", icon: "play_circle", cardClass: "aspect-square" },
      { value: "apple", title: "Apple TV+", sub: "", icon: "play_circle", cardClass: "aspect-square" },
      { value: "any", title: "No preference", sub: "", icon: "all_inclusive", cardClass: "aspect-square" },
    ],
  },

  // ─── Q9: GENRE EXCLUSIONS ───────────────────────────────────────────
  {
    id: "exclusions",
    question: 'Anything you want to <span class="text-primary italic">avoid</span>?',
    type: "multi", // multi-select, skippable
    gridClass: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    options: [
      { value: "horror", title: "Horror", sub: "", icon: "dark_mode", cardClass: "aspect-square" },
      { value: "romance", title: "Romance", sub: "", icon: "favorite", cardClass: "aspect-square" },
      { value: "animation", title: "Animation", sub: "", icon: "animation", cardClass: "aspect-square" },
      { value: "documentary", title: "Documentary", sub: "", icon: "videocam", cardClass: "aspect-square" },
      { value: "scifi", title: "Sci-Fi", sub: "", icon: "rocket_launch", cardClass: "aspect-square" },
      { value: "musical", title: "Musical", sub: "", icon: "music_note", cardClass: "aspect-square" },
    ],
  },
];
