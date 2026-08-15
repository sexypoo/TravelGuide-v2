import Link from 'next/link';

export function Wordmark(): React.JSX.Element {
  return (
    <Link className="wordmark" href="/" aria-label="여쭈어 홈">
      <span className="wordmark__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M12 2.5 9.4 9 3 11.4v1.8l6.5-.7.8 5.9-2.2 1.5v1l3.9-.8 3.9.8v-1l-2.2-1.5.8-5.9 6.5.7v-1.8L14.6 9 12 2.5Z" />
        </svg>
      </span>
      <span className="wordmark__name">
        여<b>JJU</b>
      </span>
    </Link>
  );
}
