// Mouse and keyboard input, translated into game actions. Clicks are reported
// in the canvas's logical coordinates; keys are reported as action bit flags.
export const ACTION_CONFIRM = 1;
export const ACTION_HINT = 2;
export const ACTION_PAUSE = 4;
export const ACTION_MUTE = 8;
export const ACTION_NEXT = 16;

export function createInput(canvas, logicalWidth, logicalHeight) {
  let actions = 0;
  const clicks = [];

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * logicalWidth,
      y: ((event.clientY - rect.top) / rect.height) * logicalHeight,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    clicks.push(toLogical(event));
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') actions |= ACTION_CONFIRM;
    else if (key === 'h') actions |= ACTION_HINT;
    else if (key === 'p' || key === 'escape') actions |= ACTION_PAUSE;
    else if (key === 'm') actions |= ACTION_MUTE;
    else if (key === 'n') actions |= ACTION_NEXT;
  });

  return {
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}
