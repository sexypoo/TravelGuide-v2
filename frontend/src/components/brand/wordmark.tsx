import Link from 'next/link';

export function Wordmark(): React.JSX.Element {
  return (
    <Link className="wordmark" href="/" aria-label="TravelGuide 홈">
      <span className="wordmark__mark" aria-hidden="true">
        T
      </span>
      <span>TravelGuide</span>
    </Link>
  );
}
