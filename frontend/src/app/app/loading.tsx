export default function AppLoading(): React.JSX.Element {
  return (
    <div className="appSkeleton" aria-label="화면 불러오는 중" aria-busy="true">
      <span className="appSkeleton__eyebrow" />
      <span className="appSkeleton__title" />
      <span className="appSkeleton__copy" />
      <div className="appSkeleton__card" />
      <div className="appSkeleton__card appSkeleton__card--short" />
    </div>
  );
}
