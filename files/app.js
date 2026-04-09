// ══════════════════════════════════════════════════════════════════════
// Movie Match — main application logic
// State machine: welcome → quiz (9 steps) → loading → results
// ══════════════════════════════════════════════════════════════════════

const API_URL = "http://localhost:8000/recommend";

// ─── State ─────────────────────────────────────────────────────────────

const state = {
  currentStep: 0,                 // 0-based index into QUIZ
  answers: {},                    // { mood: "relax", exclusions: ["horror"], ... }
  screen: "welcome",              // welcome | quiz | loading | results | error
};

// ─── Screen switching ──────────────────────────────────────────────────

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(`screen-${name}`).classList.add("active");
  state.screen = name;
  // Show "Start Over" in top bar only after welcome
  const restartBtn = document.getElementById("restart-btn");
  restartBtn.classList.toggle("hidden", name === "welcome");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── Quiz rendering ────────────────────────────────────────────────────

function renderQuestion() {
  const q = QUIZ[state.currentStep];
  const totalSteps = QUIZ.length;
  const stepNum = state.currentStep + 1;

  // Header
  document.getElementById("quiz-counter").textContent = `Question ${stepNum} of ${totalSteps}`;
  document.getElementById("quiz-question").innerHTML = q.question;
  document.getElementById("quiz-progress").style.width = `${(stepNum / totalSteps) * 100}%`;

  // Grid
  const grid = document.getElementById("quiz-grid");
  grid.className = `grid gap-6 mb-16 ${q.gridClass}`;
  grid.innerHTML = "";

  const currentAnswer = state.answers[q.id];

  q.options.forEach((opt) => {
    const isSelected =
      q.type === "multi"
        ? Array.isArray(currentAnswer) && currentAnswer.includes(opt.value)
        : currentAnswer === opt.value;

    const card = document.createElement("button");
    card.className = `option-card group relative ${opt.cardClass} rounded-lg overflow-hidden glass-card border border-outline-variant/15 hover:border-primary/40 transition-all duration-500 text-left glow-hover flex flex-col p-8 ${
      isSelected ? "selected" : ""
    }`;
    card.dataset.value = opt.value;
    card.innerHTML = `
      <div class="relative z-10 flex flex-col h-full ${q.options.length <= 4 ? "justify-center" : ""}">
        <div class="w-12 h-12 bg-primary-container/30 rounded-full flex items-center justify-center mb-6 border border-primary/20">
          <span class="material-symbols-outlined text-primary text-2xl">${opt.icon}</span>
        </div>
        <h3 class="option-title text-2xl font-headline font-bold text-on-surface transition-colors">${opt.title}</h3>
        ${opt.sub ? `<p class="text-on-surface-variant text-sm mt-2 opacity-70">${opt.sub}</p>` : ""}
        ${
          isSelected
            ? '<div class="absolute top-4 right-4 w-8 h-8 rounded-full persona-gradient flex items-center justify-center"><span class="material-symbols-outlined text-on-primary text-lg" style="font-variation-settings: \'FILL\' 1;">check</span></div>'
            : ""
        }
      </div>
    `;

    card.addEventListener("click", () => handleOptionClick(q, opt));
    grid.appendChild(card);
  });

  // Footer controls
  const backBtn = document.getElementById("quiz-back-btn");
  const nextBtn = document.getElementById("quiz-next-btn");
  const skipBtn = document.getElementById("quiz-skip-btn");
  const hint = document.getElementById("quiz-hint");

  backBtn.style.visibility = state.currentStep === 0 ? "hidden" : "visible";

  if (q.type === "multi") {
    // Multi-select: show Next (always enabled) + Skip
    nextBtn.classList.remove("hidden");
    nextBtn.classList.remove("opacity-50", "cursor-not-allowed");
    nextBtn.textContent = "Confirm";
    skipBtn.classList.remove("hidden");
    hint.textContent = "Select any that apply, or skip";
  } else {
    // Single-select: auto-advance, no Next button needed
    nextBtn.classList.add("hidden");
    skipBtn.classList.add("hidden");
    hint.textContent = "Pick one to continue";
  }
}

function handleOptionClick(q, opt) {
  if (q.type === "multi") {
    // Toggle in array
    const current = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];
    const idx = current.indexOf(opt.value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(opt.value);
    }
    state.answers[q.id] = current;
    renderQuestion(); // re-render to show selected state
  } else {
    // Single-select: record and auto-advance
    state.answers[q.id] = opt.value;
    // Short delay for visual feedback
    renderQuestion();
    setTimeout(() => advance(), 350);
  }
}

function advance() {
  if (state.currentStep < QUIZ.length - 1) {
    state.currentStep += 1;
    renderQuestion();
  } else {
    submitQuiz();
  }
}

function goBack() {
  if (state.currentStep > 0) {
    state.currentStep -= 1;
    renderQuestion();
  }
}

function skipCurrent() {
  // For multi-select skippable (Q9): clear answer and advance
  const q = QUIZ[state.currentStep];
  state.answers[q.id] = [];
  advance();
}

// ─── Backend call ──────────────────────────────────────────────────────

async function submitQuiz() {
  showScreen("loading");

  // Cycle loading status messages
  const statuses = [
    "The Curator is reviewing thousands of films to find your perfect match...",
    "Analyzing your mood and preferences...",
    "Cross-referencing with critic reviews and audience ratings...",
    "Curating your personalized selection...",
  ];
  let statusIdx = 0;
  const statusEl = document.getElementById("loading-status");
  const statusInterval = setInterval(() => {
    statusIdx = (statusIdx + 1) % statuses.length;
    statusEl.textContent = statuses[statusIdx];
  }, 2500);

  // Normalize payload for backend
  const payload = {
    mood: state.answers.mood,
    company: state.answers.company,
    duration: state.answers.duration,
    weight: state.answers.weight,
    era: state.answers.era,
    quality: state.answers.quality,
    setting: state.answers.setting,
    platforms: state.answers.platforms === "any" ? [] : [state.answers.platforms].filter(Boolean),
    exclusions: state.answers.exclusions || [],
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    clearInterval(statusInterval);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    const data = await res.json();
    renderResults(data);
  } catch (err) {
    clearInterval(statusInterval);
    console.error(err);
    document.getElementById("error-message").textContent = err.message || "Unknown error";
    showScreen("error");
  }
}

// ─── Results rendering ─────────────────────────────────────────────────

function renderResults(data) {
  const grid = document.getElementById("results-grid");
  grid.innerHTML = "";

  document.getElementById("results-closing").textContent = data.closing || "";

  data.recommendations.forEach((rec, idx) => {
    const card = document.createElement("div");
    card.className =
      "relative bg-surface-container rounded-lg overflow-hidden border border-outline-variant/15 hover:border-primary/30 transition-all duration-500 group";
    card.style.animationDelay = `${idx * 120}ms`;

    const posterHTML = rec.poster_url
      ? `<img src="${rec.poster_url}" alt="${escapeHtml(rec.title)}" class="w-full aspect-[2/3] object-cover" loading="lazy"/>`
      : `<div class="w-full aspect-[2/3] bg-surface-container-high flex items-center justify-center"><span class="material-symbols-outlined text-on-surface-variant text-6xl">movie</span></div>`;

    const providersHTML = rec.providers && rec.providers.length
      ? `<div class="flex flex-wrap gap-2 mt-4">
          ${rec.providers
            .slice(0, 4)
            .map(
              (p) =>
                `<span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-wider">${escapeHtml(
                  p
                )}</span>`
            )
            .join("")}
        </div>`
      : "";

    const genresHTML = rec.genres && rec.genres.length
      ? `<p class="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-3">${rec.genres
          .slice(0, 3)
          .map(escapeHtml)
          .join(" · ")}</p>`
      : "";

    const runtimeText = rec.runtime ? `${rec.runtime} min` : "";
    const yearRuntime = [rec.year, runtimeText].filter(Boolean).join(" · ");

    card.innerHTML = `
      <!-- Poster with gradient overlay -->
      <div class="relative">
        ${posterHTML}
        <div class="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
        <!-- Match gauge -->
        <div class="absolute top-4 right-4">
          <div class="relative w-16 h-16">
            <svg class="match-ring w-full h-full">
              <circle class="text-surface-container-highest" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-width="4"></circle>
              <circle class="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor"
                stroke-dasharray="${2 * Math.PI * 28}"
                stroke-dashoffset="${2 * Math.PI * 28 * (1 - rec.match_score / 100)}"
                stroke-width="4"
                stroke-linecap="round"></circle>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="font-headline text-sm font-black text-on-surface">${rec.match_score}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="p-8">
        ${genresHTML}
        <h3 class="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2 leading-tight">${escapeHtml(
          rec.title
        )}</h3>
        <div class="flex items-center gap-3 mb-6 text-on-surface-variant text-sm">
          <span>${escapeHtml(yearRuntime)}</span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-tertiary text-base" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="font-bold text-on-surface">${rec.rating.toFixed(1)}</span>
          </span>
        </div>

        <!-- Why card -->
        <div class="bg-surface-container-high rounded-lg p-5 mb-4">
          <p class="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2">Why this pick</p>
          <p class="text-on-surface text-sm leading-relaxed">${escapeHtml(rec.why)}</p>
        </div>

        ${providersHTML}
      </div>
    `;
    grid.appendChild(card);
  });

  showScreen("results");
}

// ─── Utilities ─────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function resetQuiz() {
  state.currentStep = 0;
  state.answers = {};
  showScreen("welcome");
}

// ─── Event bindings ────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("start-quiz-btn").addEventListener("click", () => {
    state.currentStep = 0;
    state.answers = {};
    renderQuestion();
    showScreen("quiz");
  });

  document.getElementById("quiz-back-btn").addEventListener("click", goBack);
  document.getElementById("quiz-next-btn").addEventListener("click", advance);
  document.getElementById("quiz-skip-btn").addEventListener("click", skipCurrent);

  document.getElementById("restart-btn").addEventListener("click", resetQuiz);
  document.getElementById("results-restart-btn").addEventListener("click", resetQuiz);
  document.getElementById("error-retry-btn").addEventListener("click", () => {
    // Retry submit with current answers
    submitQuiz();
  });

  // Keyboard navigation: ESC goes back
  document.addEventListener("keydown", (e) => {
    if (state.screen === "quiz" && e.key === "Escape") goBack();
  });
});
