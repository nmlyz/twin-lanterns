// The three scenes. Each scene paints one 560x400 picture twice: panel A and
// panel B are the same drawing except for the scene's differences. The base
// painter draws everything the two panels share; each difference then draws
// only its own element, in its A form on the left panel and its B form on the
// right panel, so the difference is hidden by the design of the picture.
// A difference is { id, label, x, y, r, draw(ctx, side) } in panel coordinates.
import { createRandom } from './random.js';

export const PANEL_W = 560;
export const PANEL_H = 400;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function disc(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? r : r * 0.38;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath();
}

function sky(ctx, top, mid, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
}

function stars(ctx, rng, count, top) {
  ctx.fillStyle = '#fff8d6';
  for (let i = 0; i < count; i += 1) {
    const x = rng.range(8, PANEL_W - 8);
    const y = rng.range(6, top);
    const r = rng.range(0.8, 2.1);
    disc(ctx, x, y, r);
    ctx.fill();
  }
}

function moon(ctx, x, y, r, crescent) {
  ctx.fillStyle = '#ffeebb';
  disc(ctx, x, y, r);
  ctx.fill();
  ctx.fillStyle = '#f5d98a';
  disc(ctx, x - r * 0.25, y - r * 0.2, r * 0.16);
  ctx.fill();
  disc(ctx, x + r * 0.3, y + r * 0.3, r * 0.12);
  ctx.fill();
  if (crescent) {
    ctx.fillStyle = '#1d2b45';
    disc(ctx, x + r * 0.45, y - r * 0.15, r * 0.85);
    ctx.fill();
  }
}

function paperLantern(ctx, x, y, r, color) {
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x - 2, y - r - 6, 4, 5);
  ctx.fillStyle = color;
  disc(ctx, x, y, r);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x - r * 0.55, y - r * 0.6, r * 0.4, r * 0.5);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f7c948';
  ctx.fillRect(x - 3, y + r - 1, 6, 7);
}

function bird(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 8 * s, y);
  ctx.quadraticCurveTo(x - 3 * s, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x + 3 * s, y - 6 * s, x + 8 * s, y);
  ctx.stroke();
}

function gull(ctx, x, y, s) {
  bird(ctx, x, y, s, '#20242e');
}

function smoke(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(230,230,240,0.75)';
  disc(ctx, x, y, 7 * s);
  ctx.fill();
  disc(ctx, x + 6 * s, y - 12 * s, 9 * s);
  ctx.fill();
  disc(ctx, x - 3 * s, y - 24 * s, 11 * s);
  ctx.fill();
  disc(ctx, x + 5 * s, y - 36 * s, 8 * s);
  ctx.fill();
}

function cat(ctx, x, y, s) {
  ctx.fillStyle = '#d88a3c';
  disc(ctx, x, y - 10 * s, 9 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 8 * s, y - 16 * s);
  ctx.lineTo(x - 5 * s, y - 26 * s);
  ctx.lineTo(x - 1 * s, y - 17 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 8 * s, y - 16 * s);
  ctx.lineTo(x + 5 * s, y - 26 * s);
  ctx.lineTo(x + 1 * s, y - 17 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y + 2 * s, 12 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d88a3c';
  ctx.lineWidth = 4 * s;
  ctx.beginPath();
  ctx.moveTo(x + 10 * s, y + 6 * s);
  ctx.quadraticCurveTo(x + 20 * s, y - 2 * s, x + 18 * s, y - 12 * s);
  ctx.stroke();
}

function owl(ctx, x, y, s) {
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath();
  ctx.ellipse(x, y, 11 * s, 14 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6242';
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y - 12 * s);
  ctx.lineTo(x - 6 * s, y - 20 * s);
  ctx.lineTo(x - 2 * s, y - 12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 9 * s, y - 12 * s);
  ctx.lineTo(x + 6 * s, y - 20 * s);
  ctx.lineTo(x + 2 * s, y - 12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  disc(ctx, x - 4 * s, y - 3 * s, 3.4 * s);
  ctx.fill();
  disc(ctx, x + 4 * s, y - 3 * s, 3.4 * s);
  ctx.fill();
  ctx.fillStyle = '#14100c';
  disc(ctx, x - 4 * s, y - 3 * s, 1.7 * s);
  ctx.fill();
  disc(ctx, x + 4 * s, y - 3 * s, 1.7 * s);
  ctx.fill();
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.moveTo(x - 2 * s, y + 1 * s);
  ctx.lineTo(x + 2 * s, y + 1 * s);
  ctx.lineTo(x, y + 5 * s);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Scene 1: Lantern Night Market
// ---------------------------------------------------------------------------
function paintMarket(ctx, rng) {
  sky(ctx, '#241d4e', '#6b3a63', '#c96f4a');
  stars(ctx, rng, 26, 120);
  moon(ctx, 492, 52, 24, false);

  // Distant rooftops.
  ctx.fillStyle = '#2c2350';
  ctx.beginPath();
  ctx.moveTo(0, 210);
  ctx.lineTo(70, 170);
  ctx.lineTo(150, 210);
  ctx.lineTo(220, 176);
  ctx.lineTo(300, 210);
  ctx.lineTo(380, 172);
  ctx.lineTo(460, 210);
  ctx.lineTo(560, 178);
  ctx.lineTo(560, 400);
  ctx.lineTo(0, 400);
  ctx.closePath();
  ctx.fill();

  // Street.
  ctx.fillStyle = '#4a3428';
  ctx.fillRect(0, 300, PANEL_W, 100);
  ctx.fillStyle = '#5d4433';
  ctx.fillRect(0, 300, PANEL_W, 6);
  ctx.fillStyle = 'rgba(247,201,72,0.16)';
  for (let i = 0; i < 7; i += 1) {
    const x = 30 + i * 78 + rng.range(-8, 8);
    ctx.beginPath();
    ctx.ellipse(x, 348 + rng.range(0, 34), 26, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Left house with a window (the light itself is a difference).
  ctx.fillStyle = '#33241d';
  ctx.fillRect(52, 210, 110, 92);
  ctx.fillStyle = '#241811';
  ctx.beginPath();
  ctx.moveTo(44, 214);
  ctx.lineTo(107, 178);
  ctx.lineTo(170, 214);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1c1410';
  rr(ctx, 104, 234, 34, 40, 3);
  ctx.fill();
  ctx.strokeStyle = '#1c1410';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(121, 234);
  ctx.lineTo(121, 274);
  ctx.moveTo(104, 254);
  ctx.lineTo(138, 254);
  ctx.stroke();

  // Food stall, centre-left, with a chimney and a pot.
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(196, 240, 150, 62);
  ctx.fillStyle = '#8f5a34';
  ctx.fillRect(196, 240, 150, 8);
  ctx.fillStyle = '#5d3a20';
  ctx.fillRect(330, 176, 14, 66);
  ctx.fillStyle = '#3c2a1c';
  ctx.beginPath();
  ctx.moveTo(326, 178);
  ctx.lineTo(348, 178);
  ctx.lineTo(344, 164);
  ctx.lineTo(330, 164);
  ctx.closePath();
  ctx.fill();
  // Striped awning over the stall (base has 4 stripes; the 5th is a difference).
  ctx.fillStyle = '#f3e6c8';
  ctx.beginPath();
  ctx.moveTo(188, 240);
  ctx.lineTo(196, 208);
  ctx.lineTo(354, 208);
  ctx.lineTo(362, 240);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d94f3d';
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(196 + i * 39.5, 208, 19, 32);
  }

  // Steaming pot on the counter, drawn after the awning so it stays visible.
  ctx.fillStyle = '#2b2b33';
  disc(ctx, 262, 252, 20);
  ctx.fill();
  ctx.fillStyle = '#e8b64c';
  disc(ctx, 262, 250, 14);
  ctx.fill();
  ctx.fillStyle = '#c98a2e';
  disc(ctx, 254, 247, 3);
  ctx.fill();
  disc(ctx, 269, 252, 3);
  ctx.fill();
  // Skewers and buns on the counter.
  ctx.fillStyle = '#8a6242';
  ctx.fillRect(206, 246, 4, 26);
  ctx.fillStyle = '#d94f3d';
  disc(ctx, 208, 244, 5);
  ctx.fill();
  disc(ctx, 208, 254, 5);
  ctx.fill();
  ctx.fillStyle = '#f3e6c8';
  disc(ctx, 306, 252, 8);
  ctx.fill();
  disc(ctx, 322, 252, 8);
  ctx.fill();
  ctx.fillStyle = '#e8b64c';
  disc(ctx, 314, 248, 6);
  ctx.fill();

  // Signboard on the right stall (the character on it is a difference).
  ctx.fillStyle = '#33241d';
  ctx.fillRect(404, 216, 118, 86);
  ctx.fillStyle = '#241811';
  ctx.beginPath();
  ctx.moveTo(398, 220);
  ctx.lineTo(463, 186);
  ctx.lineTo(528, 220);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f3e6c8';
  rr(ctx, 428, 122, 54, 58, 6);
  ctx.fill();
  ctx.strokeStyle = '#8a6242';
  ctx.lineWidth = 3;
  rr(ctx, 428, 122, 54, 58, 6);
  ctx.stroke();

  // Noren curtain and jars on the right stall's counter.
  ctx.fillStyle = '#3a6b8a';
  ctx.fillRect(416, 246, 26, 34);
  ctx.fillRect(446, 246, 26, 34);
  ctx.fillRect(476, 246, 26, 34);
  ctx.fillStyle = '#f3e6c8';
  ctx.fillRect(416, 246, 26, 5);
  ctx.fillRect(446, 246, 26, 5);
  ctx.fillRect(476, 246, 26, 5);
  ctx.fillStyle = '#7a9ab0';
  disc(ctx, 428, 290, 8);
  ctx.fill();
  disc(ctx, 452, 290, 8);
  ctx.fill();
  ctx.fillStyle = '#5d7a8a';
  disc(ctx, 440, 290, 8);
  ctx.fill();

  // Crates on the right (a cat sits on one of them in panel A).
  ctx.fillStyle = '#8a6242';
  ctx.fillRect(452, 322, 44, 40);
  ctx.fillRect(496, 330, 36, 32);
  ctx.strokeStyle = '#5d3a20';
  ctx.lineWidth = 2;
  ctx.strokeRect(452, 322, 44, 40);
  ctx.strokeRect(496, 330, 36, 32);
  ctx.beginPath();
  ctx.moveTo(452, 342);
  ctx.lineTo(496, 342);
  ctx.moveTo(496, 346);
  ctx.lineTo(532, 346);
  ctx.stroke();

  // Lantern strings across the top (base has 4 small lanterns; a 5th is a difference).
  ctx.strokeStyle = '#1c1410';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(280, 52, 560, 14);
  ctx.stroke();
  const stringXs = [52, 178, 304, 430];
  for (let i = 0; i < stringXs.length; i += 1) {
    const x = stringXs[i];
    const y = 30 + Math.sin((x / 560) * Math.PI) * 12;
    paperLantern(ctx, x, y + 12, 11, i % 2 === 0 ? '#e74c3c' : '#f7c948');
  }

  // Big hanging lantern (its colour is a difference).
  ctx.strokeStyle = '#1c1410';
  ctx.beginPath();
  ctx.moveTo(300, 44);
  ctx.lineTo(300, 52);
  ctx.stroke();

  // Wire with birds (base has two; a third is a difference).
  ctx.strokeStyle = '#14100c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 44);
  ctx.lineTo(240, 40);
  ctx.stroke();
  bird(ctx, 150, 44, 0.9, '#14100c');
  bird(ctx, 216, 42, 0.9, '#14100c');
}

const marketDifferences = [
  {
    id: 'smoke', label: '屋台の煙', x: 337, y: 132, r: 26,
    draw(ctx, side) { if (side === 'A') smoke(ctx, 337, 150, 1); },
  },
  {
    id: 'lantern-color', label: '提灯の色', x: 300, y: 70, r: 24,
    draw(ctx, side) { paperLantern(ctx, 300, 70, 17, side === 'A' ? '#e74c3c' : '#2ec4b6'); },
  },
  {
    id: 'sign-text', label: '看板の文字', x: 455, y: 151, r: 24,
    draw(ctx, side) {
      ctx.fillStyle = '#33241d';
      ctx.font = 'bold 34px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(side === 'A' ? '祭' : '屋', 455, 152);
    },
  },
  {
    id: 'bird', label: '電線の鳥', x: 183, y: 42, r: 20,
    draw(ctx, side) { if (side === 'B') bird(ctx, 183, 42, 0.9, '#14100c'); },
  },
  {
    id: 'awning-stripe', label: '屋根の縞', x: 300, y: 224, r: 26,
    draw(ctx, side) { if (side === 'A') { ctx.fillStyle = '#d94f3d'; ctx.fillRect(313.5, 208, 19, 32); } },
  },
  {
    id: 'cat', label: '木箱の猫', x: 474, y: 312, r: 26,
    draw(ctx, side) { if (side === 'A') cat(ctx, 474, 322, 1); },
  },
  {
    id: 'window-light', label: '窓の明かり', x: 121, y: 254, r: 22,
    draw(ctx, side) {
      ctx.fillStyle = side === 'A' ? '#ffd76a' : '#1c2b45';
      rr(ctx, 106, 236, 30, 36, 3);
      ctx.fill();
      if (side === 'A') {
        ctx.fillStyle = 'rgba(255,215,106,0.25)';
        disc(ctx, 121, 254, 30);
        ctx.fill();
      }
    },
  },
  {
    id: 'lantern-count', label: '提灯の数', x: 242, y: 44, r: 20,
    draw(ctx, side) { if (side === 'A') paperLantern(ctx, 242, 44, 11, '#f7c948'); },
  },
];

// ---------------------------------------------------------------------------
// Scene 2: Harbor at Dusk
// ---------------------------------------------------------------------------
function paintHarbor(ctx, rng) {
  sky(ctx, '#3a2a5e', '#c96f4a', '#e89b5a');
  stars(ctx, rng, 14, 80);
  // Low sun.
  ctx.fillStyle = '#ffdf8a';
  disc(ctx, 452, 150, 30);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,223,138,0.35)';
  disc(ctx, 452, 150, 46);
  ctx.fill();

  // Sea.
  ctx.fillStyle = '#274b63';
  ctx.fillRect(0, 210, PANEL_W, 190);
  ctx.fillStyle = '#2f5d78';
  ctx.fillRect(0, 210, PANEL_W, 8);
  ctx.strokeStyle = 'rgba(255,223,138,0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i += 1) {
    const y = 232 + i * 17;
    ctx.beginPath();
    ctx.moveTo(20 + rng.range(0, 40), y);
    ctx.lineTo(120 + rng.range(0, 60), y);
    ctx.moveTo(300 + rng.range(0, 40), y + 6);
    ctx.lineTo(420 + rng.range(0, 60), y + 6);
    ctx.stroke();
  }

  // Distant shore.
  ctx.fillStyle = '#1d2b45';
  ctx.beginPath();
  ctx.moveTo(0, 210);
  ctx.lineTo(90, 186);
  ctx.lineTo(200, 210);
  ctx.lineTo(320, 190);
  ctx.lineTo(430, 210);
  ctx.lineTo(560, 196);
  ctx.lineTo(560, 214);
  ctx.lineTo(0, 214);
  ctx.closePath();
  ctx.fill();

  // Lighthouse on the left (its beam is a difference).
  ctx.fillStyle = '#f3e6c8';
  ctx.beginPath();
  ctx.moveTo(58, 210);
  ctx.lineTo(70, 84);
  ctx.lineTo(96, 84);
  ctx.lineTo(108, 210);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath();
  ctx.moveTo(64, 170);
  ctx.lineTo(102, 170);
  ctx.lineTo(99, 140);
  ctx.lineTo(67, 140);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(61, 122);
  ctx.lineTo(105, 122);
  ctx.lineTo(102, 96);
  ctx.lineTo(64, 96);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b2b33';
  ctx.fillRect(66, 70, 34, 16);
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(72, 74, 22, 8);
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath();
  ctx.moveTo(62, 70);
  ctx.lineTo(104, 70);
  ctx.lineTo(83, 56);
  ctx.closePath();
  ctx.fill();

  // Warehouse on the right with a chimney and a signboard.
  ctx.fillStyle = '#4a3428';
  ctx.fillRect(408, 150, 130, 62);
  ctx.fillStyle = '#33241d';
  ctx.beginPath();
  ctx.moveTo(402, 152);
  ctx.lineTo(473, 118);
  ctx.lineTo(544, 152);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5d3a20';
  ctx.fillRect(512, 96, 12, 30);
  ctx.fillStyle = '#f3e6c8';
  rr(ctx, 448, 128, 50, 34, 4);
  ctx.fill();
  ctx.strokeStyle = '#8a6242';
  ctx.lineWidth = 2;
  rr(ctx, 448, 128, 50, 34, 4);
  ctx.stroke();
  ctx.fillStyle = '#1c1410';
  rr(ctx, 420, 172, 26, 30, 2);
  ctx.fill();
  ctx.strokeStyle = '#1c1410';
  ctx.beginPath();
  ctx.moveTo(433, 172);
  ctx.lineTo(433, 202);
  ctx.moveTo(420, 187);
  ctx.lineTo(446, 187);
  ctx.stroke();

  // Wooden dock, foreground.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(0, 330, 220, 70);
  ctx.fillStyle = '#7a5638';
  ctx.fillRect(0, 330, 220, 8);
  ctx.strokeStyle = '#4a2f1c';
  ctx.lineWidth = 2;
  for (let i = 1; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 44, 330);
    ctx.lineTo(i * 44, 400);
    ctx.stroke();
  }
  ctx.fillStyle = '#2b2b33';
  disc(ctx, 20, 340, 4);
  ctx.fill();
  disc(ctx, 200, 340, 4);
  ctx.fill();

  // Moored boat, centre (its mast flag is a difference).
  ctx.fillStyle = '#8a6242';
  ctx.beginPath();
  ctx.moveTo(222, 252);
  ctx.lineTo(298, 252);
  ctx.lineTo(282, 276);
  ctx.lineTo(238, 276);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5d3a20';
  ctx.fillRect(256, 196, 5, 58);
  ctx.fillStyle = '#f3e6c8';
  ctx.beginPath();
  ctx.moveTo(261, 200);
  ctx.lineTo(261, 248);
  ctx.lineTo(296, 248);
  ctx.closePath();
  ctx.fill();

  // Buoy (its colour is a difference).
  ctx.fillStyle = '#2b2b33';
  ctx.fillRect(196, 296, 4, 10);

  // Gulls (base has two; a third is a difference).
  gull(ctx, 150, 66, 1);
  gull(ctx, 196, 52, 0.85);
}

const harborDifferences = [
  {
    id: 'beam', label: '灯台の光', x: 130, y: 80, r: 30,
    draw(ctx, side) {
      if (side === 'A') {
        const g = ctx.createLinearGradient(96, 80, 260, 60);
        g.addColorStop(0, 'rgba(255,215,106,0.75)');
        g.addColorStop(1, 'rgba(255,215,106,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(96, 72);
        ctx.lineTo(260, 34);
        ctx.lineTo(260, 96);
        ctx.lineTo(96, 88);
        ctx.closePath();
        ctx.fill();
      }
    },
  },
  {
    id: 'boat', label: '小舟', x: 330, y: 252, r: 26,
    draw(ctx, side) {
      if (side === 'B') {
        ctx.fillStyle = '#3a5a78';
        ctx.beginPath();
        ctx.moveTo(306, 248);
        ctx.lineTo(354, 248);
        ctx.lineTo(344, 264);
        ctx.lineTo(316, 264);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#2b2b33';
        ctx.fillRect(328, 222, 4, 28);
      }
    },
  },
  {
    id: 'flag', label: '旗の色', x: 272, y: 202, r: 20,
    draw(ctx, side) {
      ctx.fillStyle = side === 'A' ? '#d94f3d' : '#2e7fc4';
      ctx.beginPath();
      ctx.moveTo(261, 198);
      ctx.lineTo(284, 204);
      ctx.lineTo(261, 210);
      ctx.closePath();
      ctx.fill();
    },
  },
  {
    id: 'gull', label: 'カモメの数', x: 236, y: 68, r: 20,
    draw(ctx, side) { if (side === 'B') gull(ctx, 236, 68, 0.85); },
  },
  {
    id: 'warehouse-window', label: '倉庫の窓', x: 433, y: 187, r: 22,
    draw(ctx, side) {
      ctx.fillStyle = side === 'A' ? '#ffd76a' : '#1c2b45';
      rr(ctx, 422, 174, 22, 26, 2);
      ctx.fill();
      if (side === 'A') {
        ctx.fillStyle = 'rgba(255,215,106,0.25)';
        disc(ctx, 433, 187, 24);
        ctx.fill();
      }
    },
  },
  {
    id: 'buoy', label: 'ブイの色', x: 198, y: 290, r: 22,
    draw(ctx, side) {
      ctx.fillStyle = side === 'A' ? '#e8703a' : '#f3e6c8';
      disc(ctx, 198, 292, 12);
      ctx.fill();
      ctx.fillStyle = side === 'A' ? '#f7c948' : '#2e7fc4';
      ctx.fillRect(194, 278, 8, 8);
    },
  },
  {
    id: 'fish', label: '跳ねる魚', x: 382, y: 318, r: 24,
    draw(ctx, side) {
      if (side === 'A') {
        ctx.fillStyle = '#9fc4d8';
        ctx.beginPath();
        ctx.ellipse(382, 312, 14, 6, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(394, 306);
        ctx.lineTo(402, 300);
        ctx.lineTo(400, 312);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(382, 326, 10, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
    },
  },
  {
    id: 'rope', label: 'ロープの輪', x: 122, y: 352, r: 24,
    draw(ctx, side) {
      if (side === 'A') {
        ctx.strokeStyle = '#d8b25a';
        ctx.lineWidth = 5;
        disc(ctx, 122, 352, 16);
        ctx.stroke();
        disc(ctx, 122, 352, 9);
        ctx.stroke();
      }
    },
  },
  {
    id: 'chimney-smoke', label: '倉庫の煙', x: 518, y: 78, r: 24,
    draw(ctx, side) { if (side === 'A') smoke(ctx, 518, 96, 0.9); },
  },
  {
    id: 'warehouse-sign', label: '倉庫の看板', x: 473, y: 145, r: 22,
    draw(ctx, side) {
      ctx.fillStyle = '#33241d';
      ctx.font = 'bold 24px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(side === 'A' ? '港' : '倉', 473, 146);
    },
  },
];

// ---------------------------------------------------------------------------
// Scene 3: Forest Cabin
// ---------------------------------------------------------------------------
function paintForest(ctx, rng) {
  sky(ctx, '#0e2418', '#1d4a2e', '#2e5d3a');
  stars(ctx, rng, 22, 110);

  // Tall trees.
  const treeXs = [40, 120, 210, 430, 510];
  for (const x of treeXs) {
    const h = rng.range(150, 210);
    ctx.fillStyle = '#123524';
    ctx.beginPath();
    ctx.moveTo(x - 34, 320);
    ctx.lineTo(x, 320 - h);
    ctx.lineTo(x + 34, 320);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0c2718';
    ctx.fillRect(x - 5, 300, 10, 30);
  }

  // Ground.
  ctx.fillStyle = '#2e4a26';
  ctx.fillRect(0, 300, PANEL_W, 100);
  ctx.fillStyle = '#3a5a2e';
  ctx.fillRect(0, 300, PANEL_W, 6);

  // Cabin, centre.
  ctx.fillStyle = '#5d3a20';
  ctx.fillRect(218, 190, 124, 112);
  ctx.fillStyle = '#4a2f1c';
  ctx.beginPath();
  ctx.moveTo(206, 194);
  ctx.lineTo(280, 138);
  ctx.lineTo(354, 194);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#33241d';
  ctx.fillRect(308, 118, 12, 26);
  ctx.fillStyle = '#1c1410';
  rr(ctx, 232, 222, 30, 36, 3);
  ctx.fill();
  ctx.strokeStyle = '#1c1410';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(247, 222);
  ctx.lineTo(247, 258);
  ctx.moveTo(232, 240);
  ctx.lineTo(262, 240);
  ctx.stroke();
  ctx.fillStyle = '#2b1c10';
  rr(ctx, 296, 238, 30, 64, 3);
  ctx.fill();
  ctx.fillStyle = '#f7c948';
  disc(ctx, 322, 270, 3);
  ctx.fill();

  // Tree hole with an owl in panel A (base draws the hole only).
  ctx.fillStyle = '#0c1f12';
  ctx.beginPath();
  ctx.ellipse(470, 116, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Well on the right (the bucket is a difference).
  ctx.fillStyle = '#6b6b72';
  ctx.beginPath();
  ctx.ellipse(520, 306, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a8a92';
  ctx.fillRect(494, 306, 52, 22);
  ctx.fillStyle = '#4a2f1c';
  ctx.fillRect(498, 272, 5, 36);
  ctx.fillRect(537, 272, 5, 36);
  ctx.fillStyle = '#5d3a20';
  ctx.beginPath();
  ctx.moveTo(492, 274);
  ctx.lineTo(520, 258);
  ctx.lineTo(548, 274);
  ctx.closePath();
  ctx.fill();

  // Fence on the left (base leaves a gap; panel A fills it with a plank).
  ctx.fillStyle = '#6b4a2f';
  for (const x of [28, 62, 96, 164, 198]) {
    ctx.fillRect(x, 288, 8, 34);
  }
  ctx.fillRect(20, 296, 190, 6);
  ctx.fillRect(20, 310, 190, 6);

  // Path stones (base has 4; a 5th is a difference).
  ctx.fillStyle = '#9a9a92';
  const stoneXs = [238, 262, 286, 310];
  for (const x of stoneXs) {
    ctx.beginPath();
    ctx.ellipse(x, 352 + (x % 3) * 4, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mushrooms (base has 2; a 3rd is a difference).
  function mushroom(x, y, s) {
    ctx.fillStyle = '#e8e0c8';
    ctx.fillRect(x - 2 * s, y - 6 * s, 4 * s, 8 * s);
    ctx.fillStyle = '#d94f3d';
    ctx.beginPath();
    ctx.arc(x, y - 6 * s, 8 * s, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    disc(ctx, x - 3 * s, y - 10 * s, 1.4 * s);
    ctx.fill();
    disc(ctx, x + 3 * s, y - 8 * s, 1.2 * s);
    ctx.fill();
  }
  mushroom(84, 344, 1);
  mushroom(108, 350, 0.8);

  // Flowers (one flower's colour is a difference).
  ctx.strokeStyle = '#3a6b34';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 316);
  ctx.lineTo(150, 296);
  ctx.moveTo(176, 318);
  ctx.lineTo(176, 300);
  ctx.stroke();
  ctx.fillStyle = '#f7c948';
  for (const [x, y] of [[138, 312], [162, 314], [190, 308], [204, 316]]) {
    disc(ctx, x, y, 3.5);
    ctx.fill();
  }

  // Apple tree on the left (base has 3 apples; a 4th is a difference).
  ctx.fillStyle = '#1d4a2e';
  disc(ctx, 120, 128, 34);
  ctx.fill();
  disc(ctx, 96, 148, 24);
  ctx.fill();
  disc(ctx, 146, 148, 24);
  ctx.fill();
  ctx.fillStyle = '#d94f3d';
  disc(ctx, 108, 132, 5);
  ctx.fill();
  disc(ctx, 134, 146, 5);
  ctx.fill();
  disc(ctx, 122, 158, 5);
  ctx.fill();

  // Fireflies (base has 1; panel A has 3).
  ctx.fillStyle = '#d8f79a';
  disc(ctx, 200, 150, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(216,247,154,0.3)';
  disc(ctx, 200, 150, 8);
  ctx.fill();

  // Branch with a bird in panel B (base draws the branch only).
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(386, 84);
  ctx.lineTo(436, 66);
  ctx.stroke();
}

const forestDifferences = [
  {
    id: 'smoke', label: '煙突の煙', x: 314, y: 92, r: 24,
    draw(ctx, side) { if (side === 'A') smoke(ctx, 314, 112, 0.9); },
  },
  {
    id: 'mushroom', label: 'キノコの数', x: 128, y: 342, r: 22,
    draw(ctx, side) {
      if (side === 'A') {
        ctx.fillStyle = '#e8e0c8';
        ctx.fillRect(126, 336, 4, 8);
        ctx.fillStyle = '#d94f3d';
        ctx.beginPath();
        ctx.arc(128, 336, 8, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
      }
    },
  },
  {
    id: 'owl', label: '木のフクロウ', x: 470, y: 116, r: 24,
    draw(ctx, side) { if (side === 'A') owl(ctx, 470, 116, 1); },
  },
  {
    id: 'cabin-window', label: '小屋の窓', x: 247, y: 240, r: 22,
    draw(ctx, side) {
      ctx.fillStyle = side === 'A' ? '#ffd76a' : '#12203a';
      rr(ctx, 234, 224, 26, 32, 3);
      ctx.fill();
      if (side === 'A') {
        ctx.fillStyle = 'rgba(255,215,106,0.25)';
        disc(ctx, 247, 240, 28);
        ctx.fill();
      }
    },
  },
  {
    id: 'flower', label: '花の色', x: 150, y: 294, r: 18,
    draw(ctx, side) {
      ctx.fillStyle = side === 'A' ? '#e87aa8' : '#f3e6c8';
      for (let i = 0; i < 5; i += 1) {
        const a = (i * Math.PI * 2) / 5;
        disc(ctx, 150 + Math.cos(a) * 5, 294 + Math.sin(a) * 5, 3.4);
        ctx.fill();
      }
      ctx.fillStyle = '#f7c948';
      disc(ctx, 150, 294, 3);
      ctx.fill();
    },
  },
  {
    id: 'branch-bird', label: '枝の鳥', x: 412, y: 62, r: 20,
    draw(ctx, side) { if (side === 'B') bird(ctx, 412, 62, 0.9, '#14100c'); },
  },
  {
    id: 'path-stone', label: '石の数', x: 334, y: 358, r: 22,
    draw(ctx, side) {
      if (side === 'A') {
        ctx.fillStyle = '#9a9a92';
        ctx.beginPath();
        ctx.ellipse(334, 356, 13, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: 'moon', label: '月の形', x: 82, y: 56, r: 26,
    draw(ctx, side) { moon(ctx, 82, 56, 22, side === 'B'); },
  },
  {
    id: 'fireflies', label: 'ホタルの数', x: 232, y: 168, r: 22,
    draw(ctx, side) {
      if (side === 'A') {
        ctx.fillStyle = '#d8f79a';
        disc(ctx, 232, 168, 3);
        ctx.fill();
        disc(ctx, 214, 182, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(216,247,154,0.3)';
        disc(ctx, 232, 168, 8);
        ctx.fill();
        disc(ctx, 214, 182, 8);
        ctx.fill();
      }
    },
  },
  {
    id: 'fence-plank', label: '柵の板', x: 134, y: 305, r: 22,
    draw(ctx, side) { if (side === 'A') { ctx.fillStyle = '#6b4a2f'; ctx.fillRect(130, 288, 8, 34); } },
  },
  {
    id: 'bucket', label: '井戸のバケツ', x: 520, y: 292, r: 22,
    draw(ctx, side) {
      if (side === 'A') {
        ctx.fillStyle = '#8a6242';
        ctx.fillRect(512, 284, 16, 12);
        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(512, 284);
        ctx.quadraticCurveTo(520, 274, 528, 284);
        ctx.stroke();
      }
    },
  },
  {
    id: 'apple', label: 'リンゴの数', x: 148, y: 128, r: 20,
    draw(ctx, side) {
      if (side === 'A') {
        ctx.fillStyle = '#d94f3d';
        disc(ctx, 148, 128, 5);
        ctx.fill();
      }
    },
  },
];

export const SCENES = [
  {
    id: 'market', name: '提灯夜市', sub: 'Lantern Night Market', seconds: 150, seed: 20261121,
    paint: paintMarket, differences: marketDifferences,
  },
  {
    id: 'harbor', name: '夕焼けの港', sub: 'Harbor at Dusk', seconds: 180, seed: 20261122,
    paint: paintHarbor, differences: harborDifferences,
  },
  {
    id: 'forest', name: '森の小屋', sub: 'Forest Cabin', seconds: 210, seed: 20261123,
    paint: paintForest, differences: forestDifferences,
  },
];

// Paint one panel of a scene. `side` is 'A' (left) or 'B' (right).
export function paintPanel(ctx, scene, side) {
  const rng = createRandom(scene.seed);
  scene.paint(ctx, rng);
  for (const diff of scene.differences) diff.draw(ctx, side);
}

export function totalDifferences() {
  return SCENES.reduce((sum, scene) => sum + scene.differences.length, 0);
}
