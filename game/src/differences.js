// The hunt itself: which differences are found, what a click hits, hints,
// combo and score. One instance lives for a whole game; it moves through
// the scenes in order and reports when a scene is cleared or time runs out.
import { SCENES } from './scenes.js';

export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_CLEAR = 4;
export const EVENT_TIMEOUT = 8;
export const EVENT_WIN = 16;

const POINTS_FIND = 100;
const POINTS_COMBO = 25;
const POINTS_HINT = 25;
const MISS_TIME_COST = 3;
const START_HINTS = 3;

export function createHunt() {
  const state = {
    sceneIndex: 0,
    found: new Set(),
    foundOrder: [],
    score: 0,
    combo: 0,
    bestCombo: 0,
    hintsLeft: START_HINTS,
    timeLeft: SCENES[0].seconds,
    totalFound: 0,
    misses: 0,
    hintsUsed: 0,
    over: false,
    won: false,
    hintPulse: null,
    lastFoundId: null,
  };

  function scene() {
    return SCENES[state.sceneIndex];
  }

  function remaining() {
    return scene().differences.length - state.found.size;
  }

  function advanceScene() {
    state.sceneIndex += 1;
    if (state.sceneIndex >= SCENES.length) {
      state.won = true;
      state.over = true;
      return EVENT_WIN;
    }
    state.found = new Set();
    state.foundOrder = [];
    state.hintsLeft = START_HINTS;
    state.timeLeft = scene().seconds;
    state.combo = 0;
    return EVENT_CLEAR;
  }

  return {
    state,
    scene,
    remaining,
    reset() {
      state.sceneIndex = 0;
      state.found = new Set();
      state.foundOrder = [];
      state.score = 0;
      state.combo = 0;
      state.bestCombo = 0;
      state.hintsLeft = START_HINTS;
      state.timeLeft = SCENES[0].seconds;
      state.totalFound = 0;
      state.misses = 0;
      state.hintsUsed = 0;
      state.over = false;
      state.won = false;
      state.hintPulse = null;
    },
    tick(seconds) {
      if (state.over) return 0;
      state.timeLeft -= seconds;
      if (state.hintPulse) {
        state.hintPulse.left -= seconds;
        if (state.hintPulse.left <= 0) state.hintPulse = null;
      }
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.over = true;
        return EVENT_TIMEOUT;
      }
      return 0;
    },
    // A click in panel coordinates on either panel. Returns an event mask.
    click(x, y) {
      if (state.over) return 0;
      const diffs = scene().differences;
      for (let i = 0; i < diffs.length; i += 1) {
        const diff = diffs[i];
        if (state.found.has(diff.id)) continue;
        const dx = x - diff.x;
        const dy = y - diff.y;
        if (dx * dx + dy * dy <= diff.r * diff.r) {
          state.found.add(diff.id);
          state.foundOrder.push(diff.id);
          state.lastFoundId = diff.id;
          state.totalFound += 1;
          state.combo += 1;
          state.bestCombo = Math.max(state.bestCombo, state.combo);
          state.score += POINTS_FIND + (state.combo - 1) * POINTS_COMBO;
          if (state.found.size === diffs.length) {
            state.score += Math.round(state.timeLeft) * 5;
            return EVENT_FOUND | advanceScene();
          }
          return EVENT_FOUND;
        }
      }
      state.combo = 0;
      state.misses += 1;
      state.timeLeft = Math.max(0, state.timeLeft - MISS_TIME_COST);
      if (state.timeLeft <= 0) {
        state.over = true;
        return EVENT_MISS | EVENT_TIMEOUT;
      }
      return EVENT_MISS;
    },
    useHint() {
      if (state.over || state.hintsLeft <= 0) return null;
      const unfound = scene().differences.filter((d) => !state.found.has(d.id));
      if (unfound.length === 0) return null;
      const diff = unfound[Math.floor(Math.random() * unfound.length)];
      state.hintsLeft -= 1;
      state.hintsUsed += 1;
      state.score = Math.max(0, state.score - POINTS_HINT);
      state.hintPulse = { diff, left: 2.5 };
      return diff;
    },
    // Deterministic staging for screenshots: mark these differences found.
    stageFound(ids) {
      for (const id of ids) {
        if (scene().differences.some((d) => d.id === id) && !state.found.has(id)) {
          state.found.add(id);
          state.foundOrder.push(id);
          state.totalFound += 1;
        }
      }
    },
    stageScene(index, foundIds, score, timeLeft) {
      state.sceneIndex = index;
      state.found = new Set();
      state.foundOrder = [];
      state.hintsLeft = START_HINTS;
      state.timeLeft = timeLeft;
      state.combo = 0;
      this.stageFound(foundIds);
      state.score = score;
    },
  };
}
