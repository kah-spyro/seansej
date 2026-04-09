# Movie Match — Application Requirements

## Overview

Movie Match is an interactive quiz-based application that collects user preferences through a series of 9 questions and generates a personalized movie profile. The goal is to recommend films tailored to the user's current mood, context, and taste.

---

## Quiz Flow

The application guides the user through 8 sequential steps. Each step presents a single question with predefined answer options. After completing all steps, the app displays a summary of the user's choices.

---

## Questions & Answer Options

### Q1 — Mood

**"What are you in the mood for?"**

The user selects the emotional experience they're looking for.

| Option            | Internal Value |
|-------------------|----------------|
| Laugh out loud    | comedy         |
| Get emotional     | emotional      |
| Feel the thrill   | thrill         |
| Relax & unwind    | relax          |
| Think deeply      | think          |

Selection type: **single choice**

---

### Q2 — Company

**"Who's watching with you?"**

The viewing context influences content appropriateness and genre fit.

| Option            | Internal Value |
|-------------------|----------------|
| Just me           | solo           |
| Date night        | partner        |
| Family with kids  | family         |
| Friends           | friends        |

Selection type: **single choice**

---

### Q3 — Duration

**"How much time do you have?"**

Determines acceptable film length.

| Option          | Internal Value |
|-----------------|----------------|
| Under 90 min    | short          |
| 90 – 120 min    | medium         |
| Over 2 hours    | long           |
| Doesn't matter  | any            |

Selection type: **single choice**

---

### Q4 — Weight

**"How heavy should it be?"**

Defines the complexity and emotional depth of the film.

| Option                 | Internal Value |
|------------------------|----------------|
| Light & breezy         | light          |
| Somewhere in between   | balanced       |
| Deep & demanding       | heavy          |

Selection type: **single choice**

---

### Q5 — Era

**"Old or new?"**

Filters films by release period.

| Option              | Internal Value |
|---------------------|----------------|
| Classic (pre-2000)  | classic        |
| Modern (2000–2015)  | modern         |
| Recent (2016+)      | recent         |
| Don't care          | any            |

Selection type: **single choice**

---

### Q6 — Quality / Reputation

**"What kind of pick?"**

Sets the expectation for how well-known or critically acclaimed the recommendation should be.

| Option           | Internal Value |
|------------------|----------------|
| Acclaimed hit    | hit            |
| Hidden gem       | gem            |
| Guilty pleasure  | guilty         |
| Surprise me      | random         |

Selection type: **single choice**

---

### Q7 — Viewing Setting

**"Where are you watching?"**

Influences whether to recommend visually cinematic films or more casual picks.

| Option                  | Internal Value |
|-------------------------|----------------|
| Cinema                  | cinema         |
| Big TV at home          | tv             |
| Laptop / phone in bed   | small          |

Selection type: **single choice**

---

### Q8 — Streaming Platform

**"Where will you stream it?"**

Narrows recommendations to films available on the user's platform. The user may select multiple services or skip if they have no preference.

| Option          | Internal Value |
|-----------------|----------------|
| Netflix         | netflix        |
| Amazon Prime    | prime          |
| Disney+         | disney         |
| HBO Max         | hbo            |
| Apple TV+       | apple          |
| No preference   | any            |

Selection type: **single choice** (selecting "No preference" skips the filter)

---

### Q9 — Genre Exclusions

**"Anything you want to avoid?"**

Allows the user to exclude unwanted genres. This is the only multi-select question and can be skipped entirely.

| Option        | Internal Value |
|---------------|----------------|
| Horror        | horror         |
| Romance       | romance        |
| Animation     | animation      |
| Documentary   | documentary    |
| Sci-Fi        | scifi          |
| Musical       | musical        |

Selection type: **multi-select** (0 or more)

---

## UI & Interaction Requirements

- The quiz presents one question at a time in a step-by-step flow.
- Single-choice questions advance automatically after selection.
- The multi-select question (Q9) requires a manual confirm button; a skip option is also available.
- A progress bar shows the user's position within the quiz.
- A "Go back" option is available on every step except the first.
- Transitions between steps are animated (fade + slide).
- Selected options are visually highlighted.

---

## Summary Screen

After the final question, the app displays a **Movie Profile** summary containing:

- All 9 answered categories with the selected option(s) displayed.
- A "Start Over" button to restart the quiz from the beginning.

---

## Future Considerations

- **Recommendation engine** — use the collected profile to suggest specific movies (via API or local database).
- **Save / share profile** — allow users to copy or share their movie profile.
- **History** — remember past profiles and recommendations.
