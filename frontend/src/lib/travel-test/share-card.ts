import type { Locale } from '@/i18n/config';
import { messagesFor } from '@/i18n/messages';
import { travelTypesFor, type TravelTypeKey } from './content';

// Draws the result as a 1080x1920 story image in the browser (#42), so the
// share card needs no server rendering or extra font files.

const WIDTH = 1080;
const HEIGHT = 1920;
const DISPLAY_FONT =
  '"Wanted Sans Variable", "Pretendard Variable", sans-serif';
const BODY_FONT = '"Pretendard Variable", "Apple SD Gothic Neo", sans-serif';

function loadSvgImage(
  svg: SVGSVGElement,
  errorText: string,
): Promise<HTMLImageElement> {
  const markup = new XMLSerializer().serializeToString(svg);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(errorText));
    image.src = url;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Sets `font` at `size`, shrinking it until `text` fits `maxWidth`. Short
 * Korean names keep their size; long English ones get smaller.
 */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  size: number,
  family: string,
  maxWidth: number,
): void {
  let current = size;
  ctx.font = `${weight} ${current}px ${family}`;
  while (current > 24 && ctx.measureText(text).width > maxWidth) {
    current -= 4;
    ctx.font = `${weight} ${current}px ${family}`;
  }
}

const MAX_TEXT_WIDTH = WIDTH - 120;

export async function renderShareCard(
  type: TravelTypeKey,
  critter: SVGSVGElement,
  locale: Locale,
): Promise<Blob> {
  const travelType = travelTypesFor(locale)[type];
  const t = messagesFor(locale).travelTest.card;
  await Promise.all([
    document.fonts.load(`800 120px ${DISPLAY_FONT}`, travelType.name),
    document.fonts.load(`600 44px ${BODY_FONT}`, travelType.tagline),
  ]);
  const image = await loadSvgImage(critter, t.critterFailed);

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error(t.noCanvas);
  }

  ctx.fillStyle = travelType.color;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.arc(WIDTH - 80, 260, 360, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.font = `600 44px ${BODY_FONT}`;
  ctx.fillText(t.you, WIDTH / 2, 420);

  ctx.fillStyle = '#ffffff';
  fitFont(ctx, travelType.name, 800, 132, DISPLAY_FONT, MAX_TEXT_WIDTH);
  ctx.fillText(travelType.name, WIDTH / 2, 580);

  ctx.drawImage(image, WIDTH / 2 - 260, 640, 520, 520);

  fitFont(ctx, travelType.tagline, 650, 48, BODY_FONT, MAX_TEXT_WIDTH);
  ctx.fillText(travelType.tagline, WIDTH / 2, 1260);

  ctx.font = `600 36px ${BODY_FONT}`;
  let y = 1350;
  for (const trait of travelType.traits) {
    const width = ctx.measureText(trait).width + 72;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    roundRect(ctx, WIDTH / 2 - width / 2, y, width, 76, 38);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(trait, WIDTH / 2, y + 51);
    y += 96;
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.font = `600 34px ${BODY_FONT}`;
  ctx.fillText(t.footer(window.location.host), WIDTH / 2, 1800);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob === null) {
        reject(new Error(t.failed));
      } else {
        resolve(blob);
      }
    }, 'image/png');
  });
}
