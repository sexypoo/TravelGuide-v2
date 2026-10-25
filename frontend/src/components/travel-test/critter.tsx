import type { TravelTypeGlyph, TravelTypeKey } from '@/lib/travel-test/content';
import { TRAVEL_TYPES } from '@/lib/travel-test/content';

// Placeholder character for each travel type (#42). `onColor` draws a light
// body for use on the type's colored card.

function Glyph({
  glyph,
  ink,
  paper,
}: {
  glyph: TravelTypeGlyph;
  ink: string;
  paper: string;
}): React.JSX.Element {
  switch (glyph) {
    case 'sun':
      return (
        <>
          <circle cx="78" cy="22" r="9" fill="#ffd34d" />
          <path
            d="M78 6v-2M78 40v-2M62 22h-2M96 22h-2M67 11l-1.5-1.5M89 33l1.5 1.5M89 11l1.5-1.5M67 33l-1.5 1.5"
            stroke="#ffd34d"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      );
    case 'bowl':
      return (
        <>
          <path d="M64 26h30a15 15 0 0 1-30 0z" fill={ink} />
          <path
            d="M70 8l6 16M80 6l2 18"
            stroke={ink}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      );
    case 'cup':
      return (
        <>
          <rect x="66" y="12" width="20" height="22" rx="5" fill={ink} />
          <path
            d="M86 18h4a5 5 0 0 1 0 10h-4"
            fill="none"
            stroke={ink}
            strokeWidth="3"
          />
          <path
            d="M72 4c-2 3 2 4 0 7M80 4c-2 3 2 4 0 7"
            stroke={ink}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case 'camera':
      return (
        <>
          <rect x="62" y="12" width="32" height="22" rx="5" fill={ink} />
          <circle cx="78" cy="23" r="6.5" fill={paper} />
          <rect x="66" y="8" width="9" height="6" rx="2" fill={ink} />
        </>
      );
    case 'moon':
      return (
        <>
          <path d="M88 6a16 16 0 1 0 6 26A13 13 0 0 1 88 6z" fill="#ffe7a3" />
          <circle cx="66" cy="8" r="2" fill="#ffe7a3" />
          <circle cx="60" cy="20" r="1.5" fill="#ffe7a3" />
        </>
      );
    case 'pin':
      return (
        <>
          <path
            d="M78 38s-13-12-13-21a13 13 0 0 1 26 0c0 9-13 21-13 21z"
            fill={ink}
          />
          <circle cx="78" cy="17" r="5" fill={paper} />
        </>
      );
    case 'map':
      return (
        <>
          <path d="M62 10l10-4 12 4 10-4v26l-10 4-12-4-10 4z" fill={ink} />
          <path d="M72 6v26M84 10v26" stroke={paper} strokeWidth="2" />
        </>
      );
    case 'bag':
      return (
        <>
          <rect x="64" y="14" width="28" height="24" rx="5" fill={ink} />
          <path
            d="M71 16v-4a7 7 0 0 1 14 0v4"
            fill="none"
            stroke={ink}
            strokeWidth="3"
          />
        </>
      );
  }
}

export function Critter({
  type,
  onColor = false,
  className,
}: {
  type: TravelTypeKey;
  onColor?: boolean;
  className?: string;
}): React.JSX.Element {
  const { color, glyph } = TRAVEL_TYPES[type];
  const body = onColor ? '#ffffff' : color;
  const face = onColor ? color : '#ffffff';

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      className={className}
      aria-hidden="true"
      data-critter={type}
    >
      <path
        d="M50 22c22 0 36 16 36 38 0 20-16 32-36 32S14 80 14 60c0-22 14-38 36-38z"
        fill={body}
      />
      <ellipse cx="38" cy="56" rx="4.5" ry="6" fill={face} />
      <ellipse cx="62" cy="56" rx="4.5" ry="6" fill={face} />
      <circle cx="30" cy="68" r="5" fill={face} opacity="0.25" />
      <circle cx="70" cy="68" r="5" fill={face} opacity="0.25" />
      <path
        d="M44 68q6 6 12 0"
        stroke={face}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <g transform="translate(10 -6) scale(0.8)">
        <Glyph
          glyph={glyph}
          ink={onColor ? '#ffffff' : color}
          paper={onColor ? color : '#ffffff'}
        />
      </g>
    </svg>
  );
}
