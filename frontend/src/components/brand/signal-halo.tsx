export function SignalHalo(): React.JSX.Element {
  return (
    <div className="signalHalo" aria-hidden="true">
      <span className="signalHalo__orbit signalHalo__orbit--outer" />
      <span className="signalHalo__orbit signalHalo__orbit--inner" />
      <span className="signalHalo__island">
        <svg viewBox="0 0 96 70" role="presentation">
          <path d="M81 30c4 11-3 23-18 29-18 8-43 4-50-8-7-11 5-26 24-34 17-7 38-8 44 3Z" />
        </svg>
        <span className="signalHalo__point" />
      </span>
    </div>
  );
}
