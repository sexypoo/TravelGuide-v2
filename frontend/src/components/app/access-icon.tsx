interface AccessIconProps {
  locked: boolean;
}

export function AccessIcon({ locked }: AccessIconProps): React.JSX.Element {
  return locked ? (
    <svg className="accessIcon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </svg>
  ) : (
    <svg className="accessIcon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}
