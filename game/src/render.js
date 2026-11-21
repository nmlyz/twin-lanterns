// Everything drawn on the canvas: the two panels, the HUD, the remaining
// counter, found-difference chips, markers, effects and the title, pause,
// clear, over and win screens. The logical frame is 1280x800; the canvas
// element is scaled by CSS to fill the window.
import { PANEL_H, PANEL_W, SCENES, paintPanel } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

const W = 1280;
const H = 800;
const PANEL_A = { x: 40, y: 88 };
const PANEL_B = { x: 680, y: 88 };

export function panelAt(index) {
  return index === 0 ? PANEL_A : PANEL_B;
}

// Convert a logical click point to panel coordinates, or null when outside
// both panels. Returns { side, x, y } with x/y in panel space.
export function clickToPanel(px, py) {
  for (let i = 0; i < 2; i += 1) {
    const panel = panelAt(i);
    const x = px - panel.x;
    const y = py - panel.y;
    if (x >= 0 && x < PANEL_W && y >= 0 && y < PANEL_H) {
      return { side: i === 0 ? 'A' : 'B', x, y };
    }
  }
  return null;
}

export function createRenderer(canvas) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  function text(str, x, y, size, color, align, weight, font) {
    ctx.fillStyle = color;
    ctx.font = `${weight || 600} ${size}px ${font || 'system-ui, "Hiragino Sans", sans-serif'}`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  }

  function panelFrame(panel) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#0d0f1a';
    ctx.fillRect(panel.x - 4, panel.y - 4, PANEL_W + 8, PANEL_H + 8);
    ctx.restore();
    ctx.strokeStyle = '#f7c948';
    ctx.lineWidth = 2;
    ctx.strokeRect(panel.x - 4, panel.y - 4, PANEL_W + 8, PANEL_H + 8);
  }

  function drawPanels(scene) {
    for (let i = 0; i < 2; i += 1) {
      const panel = panelAt(i);
      panelFrame(panel);
      ctx.save();
      ctx.beginPath();
      ctx.rect(panel.x, panel.y, PANEL_W, PANEL_H);
      ctx.clip();
      ctx.translate(panel.x, panel.y);
      paintPanel(ctx, scene, i === 0 ? 'A' : 'B');
      ctx.restore();
    }
    text('A', PANEL_A.x + 14, PANEL_A.y + 20, 18, '#ffffff', 'left', 800);
    text('B', PANEL_B.x + 14, PANEL_B.y + 20, 18, '#ffffff', 'left', 800);
  }

  function drawFoundRing(panel, diff, now) {
    const pulse = 1 + Math.sin(now / 260) * 0.08;
    const cx = panel.x + diff.x;
    const cy = panel.y + diff.y;
    const r = (diff.r + 7) * pulse;
    ctx.save();
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ffb400';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
    ctx.stroke();
    // Check mark.
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy);
    ctx.lineTo(cx - 2, cy + 7);
    ctx.lineTo(cx + 10, cy - 7);
    ctx.stroke();
    ctx.restore();
  }

  function drawHintPulse(panel, diff, left) {
    const phase = (2.5 - left) / 2.5;
    const r = diff.r + 10 + phase * 26;
    const alpha = 0.9 - phase * 0.6;
    ctx.save();
    ctx.globalAlpha = Math.max(0.15, alpha);
    ctx.strokeStyle = '#7ee0ff';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(panel.x + diff.x, panel.y + diff.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawEffect(effect, now) {
    const age = (now - effect.born) / 1000;
    if (effect.kind === 'miss') {
      if (age > 0.7) return;
      const alpha = 1 - age / 0.7;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ff5a4e';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const s = 10;
      ctx.beginPath();
      ctx.moveTo(effect.x - s, effect.y - s);
      ctx.lineTo(effect.x + s, effect.y + s);
      ctx.moveTo(effect.x + s, effect.y - s);
      ctx.lineTo(effect.x - s, effect.y + s);
      ctx.stroke();
      ctx.restore();
    } else if (effect.kind === 'found') {
      if (age > 0.9) return;
      const r = 12 + age * 46;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - age / 0.9);
      ctx.strokeStyle = '#ffd76a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawHud(hunt, now) {
    const state = hunt.state;
    const scene = hunt.scene();
    ctx.fillStyle = '#14162a';
    ctx.fillRect(0, 0, W, 76);
    ctx.fillStyle = '#f7c948';
    ctx.fillRect(0, 76, W, 3);
    text('Twin Lanterns', 40, 30, 26, '#f7c948', 'left', 800);
    text('ふたつの絵のちがいさがし', 40, 58, 14, '#b8bdd6', 'left', 400);
    text(`シーン ${state.sceneIndex + 1}/3`, 330, 30, 20, '#ffffff', 'left', 700);
    text(`${scene.name} · ${scene.sub}`, 330, 58, 14, '#b8bdd6', 'left', 400);
    const low = state.timeLeft <= 30 && !state.over;
    const timeColor = low ? (Math.sin(now / 180) > 0 ? '#ff5a4e' : '#ffffff') : '#ffffff';
    const mm = Math.floor(state.timeLeft / 60);
    const ss = Math.floor(state.timeLeft % 60);
    text(`${mm}:${String(ss).padStart(2, '0')}`, 640, 38, 34, timeColor, 'center', 800, 'monospace');
    text('のこり時間', 640, 64, 12, '#b8bdd6', 'center', 400);
    text(`スコア ${state.score}`, 900, 30, 20, '#ffffff', 'left', 700);
    text(`ヒント ${state.hintsLeft}回  [H]`, 900, 58, 14, '#7ee0ff', 'left', 400);
    text(`コンボ ×${state.combo}`, 1220, 38, 20, state.combo >= 3 ? '#ffd76a' : '#b8bdd6', 'right', 800);
  }

  function drawStrip(hunt) {
    const state = hunt.state;
    const scene = hunt.scene();
    const left = hunt.remaining();
    const total = scene.differences.length;
    ctx.fillStyle = '#1a1d33';
    ctx.fillRect(0, 504, W, 64);
    text('あと', 60, 536, 22, '#b8bdd6', 'left', 600);
    text(String(left), 120, 536, 40, left === 0 ? '#7ee0a8' : '#ffd76a', 'left', 800);
    text(` / ${total} こ`, 170, 540, 22, '#ffffff', 'left', 600);
    // Progress dots: one per difference, gold when found.
    const dotGap = 34;
    const dotsW = total * dotGap;
    let dx = (W - dotsW) / 2 + dotGap / 2;
    for (const diff of scene.differences) {
      const found = state.found.has(diff.id);
      ctx.fillStyle = found ? '#ffd76a' : '#3a3f5e';
      ctx.beginPath();
      ctx.arc(dx, 536, found ? 11 : 9, 0, Math.PI * 2);
      ctx.fill();
      if (found) {
        ctx.strokeStyle = '#fff3c4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dx, 536, 11, 0, Math.PI * 2);
        ctx.stroke();
      }
      dx += dotGap;
    }
    text(`見つけた ${state.totalFound} / ${SCENES.reduce((s, sc) => s + sc.differences.length, 0)}`, 1220, 536, 18, '#b8bdd6', 'right', 600);
  }

  function drawChips(hunt) {
    const state = hunt.state;
    text('見つけた違い', 60, 592, 15, '#8a90ad', 'left', 600);
    let x = 200;
    for (const id of state.foundOrder) {
      const diff = hunt.scene().differences.find((d) => d.id === id);
      if (!diff) continue;
      const label = `✓ ${diff.label}`;
      ctx.font = '600 15px system-ui, "Hiragino Sans", sans-serif';
      const w = ctx.measureText(label).width + 22;
      ctx.fillStyle = '#2a2e4a';
      ctx.beginPath();
      ctx.roundRect(x, 578, w, 28, 14);
      ctx.fill();
      ctx.fillStyle = '#ffd76a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + 11, 593);
      x += w + 8;
      if (x > 1220) break;
    }
    if (state.foundOrder.length === 0) {
      text('まだありません — 左右の絵をよく見くらべて、違うところをクリック！', 200, 592, 15, '#8a90ad', 'left', 400);
    }
  }

  function drawTracker(hunt) {
    const state = hunt.state;
    text('シーン', 60, 668, 15, '#8a90ad', 'left', 600);
    let x = 140;
    for (let i = 0; i < SCENES.length; i += 1) {
      const done = i < state.sceneIndex || (state.won && i === SCENES.length - 1);
      const current = i === state.sceneIndex && !state.over;
      ctx.fillStyle = current ? '#f7c948' : done ? '#2e7d54' : '#2a2e4a';
      ctx.beginPath();
      ctx.roundRect(x, 648, 180, 40, 10);
      ctx.fill();
      ctx.fillStyle = current ? '#14162a' : '#ffffff';
      ctx.font = '700 16px system-ui, "Hiragino Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${done ? '✓ ' : ''}${i + 1}. ${SCENES[i].name}`, x + 90, 669);
      x += 192;
    }
    text('クリック: 違いを指す   H: ヒント   P: 一時停止   M: 音のオン/オフ', 1220, 668, 15, '#b8bdd6', 'right', 400);
    text('まちがえると残り時間が 3秒へるよ。コンボをつなげてボーナス！', 1220, 696, 14, '#8a90ad', 'right', 400);
  }

  function overlay(alpha) {
    ctx.fillStyle = `rgba(8,9,18,${alpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  function card(cx, cy, w, h) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#1a1d33';
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 18);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#f7c948';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 18);
    ctx.stroke();
  }

  function drawTitle(hunt, best) {
    drawPanels(hunt.scene());
    overlay(0.72);
    card(640, 400, 760, 520);
    text('Twin Lanterns', 640, 210, 56, '#f7c948', 'center', 800);
    text('ふたつの絵のちがいさがし', 640, 262, 24, '#ffffff', 'center', 600);
    text('左右の絵はそっくりだけど、ちがうところがかくれている。', 640, 322, 18, '#d6daea', 'center', 400);
    text('ちがいをクリックして、全部見つけよう。3つのシーンをめぐる旅だよ。', 640, 350, 18, '#d6daea', 'center', 400);
    text('1  提灯夜市 — 8このちがい · 150秒', 640, 408, 18, '#ffffff', 'center', 600);
    text('2  夕焼けの港 — 10このちがい · 180秒', 640, 438, 18, '#ffffff', 'center', 600);
    text('3  森の小屋 — 12このちがい · 210秒', 640, 468, 18, '#ffffff', 'center', 600);
    text('クリック または スペースキー ではじめる', 640, 528, 20, '#7ee0ff', 'center', 700);
    if (best > 0) text(`ベストスコア ${best}`, 640, 566, 16, '#ffd76a', 'center', 600);
    text('H: ヒント (1シーン3回まで) · まちがえると -3秒', 640, 600, 15, '#8a90ad', 'center', 400);
  }

  function drawFooter() {
    ctx.fillStyle = '#10122a';
    ctx.fillRect(0, 724, W, 76);
    ctx.fillStyle = '#f7c948';
    ctx.fillRect(0, 724, W, 2);
    // A row of tiny lanterns along the band.
    for (let i = 0; i < 9; i += 1) {
      if (i === 4) continue; // Leave the centre clear for the title.
      const x = 70 + i * 145;
      const color = i % 3 === 0 ? '#e74c3c' : i % 3 === 1 ? '#f7c948' : '#2ec4b6';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, 756, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7c948';
      ctx.fillRect(x - 2, 763, 4, 5);
    }
    text('Twin Lanterns', 640, 752, 20, '#f7c948', 'center', 800);
    text('ふたつの絵のちがいさがし — よく見くらべて、ちがいを全部見つけよう', 640, 778, 13, '#8a90ad', 'center', 400);
  }

  function drawPaused() {
    overlay(0.6);
    card(640, 400, 520, 220);
    text('一時停止中', 640, 360, 36, '#ffffff', 'center', 800);
    text('P または クリックでつづける', 640, 420, 18, '#7ee0ff', 'center', 600);
  }

  function drawClear(hunt) {
    const state = hunt.state;
    const cleared = SCENES[state.sceneIndex - 1] || SCENES[0];
    overlay(0.55);
    card(640, 400, 640, 340);
    text('シーンクリア！', 640, 300, 44, '#ffd76a', 'center', 800);
    text(`${cleared.name} のちがいを全部見つけた！`, 640, 356, 20, '#ffffff', 'center', 600);
    text(`スコア ${state.score}   ·   コンボ最大 ×${state.bestCombo}`, 640, 404, 18, '#d6daea', 'center', 600);
    text('クリック または Nキー でつぎのシーンへ', 640, 460, 18, '#7ee0ff', 'center', 700);
  }

  function drawOver(hunt, best) {
    const state = hunt.state;
    overlay(0.62);
    card(640, 400, 640, 360);
    text('時間切れ…', 640, 300, 44, '#ff8a7a', 'center', 800);
    text(`${hunt.scene().name} — あと ${hunt.remaining()} このちがいがのこっていた`, 640, 356, 18, '#ffffff', 'center', 600);
    text(`スコア ${state.score}   ·   ベスト ${Math.max(best, state.score)}`, 640, 404, 18, '#d6daea', 'center', 600);
    text('クリック または スペースキー でもう一度', 640, 462, 18, '#7ee0ff', 'center', 700);
  }

  function drawWin(hunt, best) {
    const state = hunt.state;
    overlay(0.55);
    card(640, 400, 720, 420);
    text('全シーンクリア！', 640, 262, 48, '#ffd76a', 'center', 800);
    text('30このちがい、ぜんぶ見つけたよ。おつかれさま！', 640, 322, 20, '#ffffff', 'center', 600);
    text(`最終スコア ${state.score}`, 640, 376, 26, '#ffffff', 'center', 800);
    text(`ミス ${state.misses}回   ·   ヒント ${state.hintsUsed}回   ·   コンボ最大 ×${state.bestCombo}`, 640, 420, 18, '#d6daea', 'center', 600);
    if (state.score >= best && state.score > 0) text('新記録！', 640, 458, 20, '#7ee0a8', 'center', 800);
    text('クリック または スペースキー でもう一度あそぶ', 640, 512, 18, '#7ee0ff', 'center', 700);
  }

  return {
    draw(hunt, screen, effects, now, best) {
      ctx.fillStyle = '#0d0f1a';
      ctx.fillRect(0, 0, W, H);
      const state = hunt.state;
      const scene = hunt.scene();
      if (screen === SCREEN_TITLE) {
        drawTitle(hunt, best);
        return;
      }
      drawHud(hunt, now);
      drawPanels(scene);
      // Found markers on both panels.
      for (const diff of scene.differences) {
        if (!state.found.has(diff.id)) continue;
        drawFoundRing(PANEL_A, diff, now);
        drawFoundRing(PANEL_B, diff, now);
      }
      // Hint pulse on both panels.
      if (state.hintPulse) {
        drawHintPulse(PANEL_A, state.hintPulse.diff, state.hintPulse.left);
        drawHintPulse(PANEL_B, state.hintPulse.diff, state.hintPulse.left);
      }
      for (const effect of effects) drawEffect(effect, now);
      drawStrip(hunt);
      drawChips(hunt);
      drawTracker(hunt);
      drawFooter();
      if (screen === SCREEN_PAUSED) drawPaused();
      else if (screen === SCREEN_CLEAR) drawClear(hunt);
      else if (screen === SCREEN_OVER) drawOver(hunt, best);
      else if (screen === SCREEN_WIN) drawWin(hunt, best);
    },
  };
}
