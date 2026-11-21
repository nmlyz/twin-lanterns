// The staged scenes behind ?shot=start|play|level2|win. Each one sets the
// hunt to a state a real play session can reach, with a fixed seed, so the
// same URL always paints the same frame for a screenshot.
import { SCENES } from './scenes.js';
import { SCREEN_CLEAR, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

/**
 * Stage the named shot on a fresh hunt and return the screen to draw.
 * Unknown names stage the title screen.
 */
export function stageShot(name, hunt) {
  hunt.reset();
  if (name === 'play') {
    hunt.stageScene(0, ['smoke', 'lantern-color', 'cat', 'window-light'], 550, 98);
    hunt.state.hintsLeft = 2;
    hunt.state.combo = 4;
    hunt.state.bestCombo = 4;
    return { screen: SCREEN_PLAY, best: 550 };
  }
  if (name === 'level2') {
    hunt.stageScene(1, ['beam', 'buoy'], 775, 132);
    hunt.state.combo = 2;
    hunt.state.bestCombo = 4;
    return { screen: SCREEN_PLAY, best: 775 };
  }
  if (name === 'win') {
    const ids = SCENES[2].differences.map((d) => d.id);
    hunt.stageScene(2, ids, 3420, 64);
    hunt.state.totalFound = SCENES.reduce((sum, s) => sum + s.differences.length, 0);
    hunt.state.bestCombo = 8;
    hunt.state.misses = 2;
    hunt.state.hintsUsed = 1;
    hunt.state.won = true;
    hunt.state.over = true;
    return { screen: SCREEN_WIN, best: 3420 };
  }
  if (name === 'clear') {
    hunt.stageScene(0, SCENES[0].differences.map((d) => d.id), 1150, 41);
    hunt.state.sceneIndex = 1;
    hunt.state.timeLeft = SCENES[1].seconds;
    return { screen: SCREEN_CLEAR, best: 1150 };
  }
  if (name === 'over') {
    hunt.stageScene(0, ['smoke', 'cat'], 225, 0);
    hunt.state.over = true;
    return { screen: SCREEN_OVER, best: 225 };
  }
  return { screen: SCREEN_TITLE, best: 0 };
}
