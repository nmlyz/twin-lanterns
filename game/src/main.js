// Boot and the one loop: input is read every frame, the hunt advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between title, play, paused, clear, over and win screens.
//
// ?shot=start|play|level2|win|clear|over stages that scene instead of running
// the loop, paints it twice and sets window.__shotReady for a screenshot.
import { createAudio } from './audio.js';
import { createHunt, EVENT_CLEAR, EVENT_FOUND, EVENT_MISS, EVENT_TIMEOUT, EVENT_WIN } from './differences.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_NEXT, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, clickToPanel, panelAt } from './render.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.25;
const BEST_KEY = 'twin-lanterns-best';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const hunt = createHunt();
const audio = createAudio();
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, hunt);
  let painted = 0;
  function paint() {
    renderer.draw(hunt, scene.screen, [], performance.now(), scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, 1280, 800);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let effects = [];
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    hunt.reset();
    effects = [];
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Find all the differences before time runs out.');
  }

  function endGame(won) {
    screen = won ? SCREEN_WIN : SCREEN_OVER;
    if (hunt.state.score > best) {
      best = hunt.state.score;
      saveBest(best);
    }
    announce(won ? `All scenes cleared. Score ${hunt.state.score}.` : `Time up. Score ${hunt.state.score}.`);
  }

  function markFound(side, diff) {
    const now = performance.now();
    for (let i = 0; i < 2; i += 1) {
      const origin = panelAt(i);
      effects.push({ kind: 'found', x: origin.x + diff.x, y: origin.y + diff.y, born: now });
    }
    void side;
  }

  function handlePlayClick(click) {
    // The hint readout in the HUD is a button too.
    if (click.y < 76 && click.x > 900) {
      useHint();
      return;
    }
    const panel = clickToPanel(click.x, click.y);
    if (!panel) return;
    const sceneBefore = hunt.scene();
    const events = hunt.click(panel.x, panel.y);
    if (events & EVENT_FOUND) {
      audio.find(hunt.state.combo);
      const foundDiff = sceneBefore.differences.find((d) => d.id === hunt.state.lastFoundId);
      if (foundDiff) markFound(panel.side, foundDiff);
      announce(`Found. ${hunt.remaining()} left.`);
    } else if (events & EVENT_MISS) {
      audio.miss();
      effects.push({ kind: 'miss', x: click.x, y: click.y, born: performance.now() });
      announce('Not a difference. 3 seconds lost.');
    }
    if (events & EVENT_WIN) {
      audio.win();
      endGame(true);
    } else if (events & EVENT_CLEAR) {
      audio.clear();
      screen = SCREEN_CLEAR;
      announce('Scene cleared.');
    } else if (events & EVENT_TIMEOUT) {
      audio.over();
      endGame(false);
    }
  }

  function useHint() {
    const diff = hunt.useHint();
    if (!diff) return;
    audio.hint();
    announce(`Hint: look near ${diff.label}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN) {
      if (actions & ACTION_CONFIRM) {
        audio.unlock();
        audio.click();
        startGame();
      }
      return;
    }
    if (screen === SCREEN_CLEAR) {
      if (actions & (ACTION_CONFIRM | ACTION_NEXT)) {
        audio.click();
        screen = SCREEN_PLAY;
        announce(`Scene ${hunt.state.sceneIndex + 1}. Find ${hunt.remaining()} differences.`);
      }
      return;
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return;
    }
    if (screen === SCREEN_PLAY && actions & ACTION_HINT) useHint();
  }

  function handleClicks() {
    for (const click of input.takeClicks()) {
      audio.unlock();
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN) {
        audio.click();
        startGame();
      } else if (screen === SCREEN_CLEAR) {
        audio.click();
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_PLAY) {
        handlePlayClick(click);
      }
    }
  }

  function step() {
    if (screen !== SCREEN_PLAY) return;
    const events = hunt.tick(STEP);
    if (events & EVENT_TIMEOUT) {
      audio.over();
      endGame(false);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleClicks();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    const cutoff = now - 1000;
    effects = effects.filter((e) => e.born > cutoff);
    renderer.draw(hunt, screen, effects, now, best);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Lanterns. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
