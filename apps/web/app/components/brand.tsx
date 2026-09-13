export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="m5 7 7-4 7 4v10l-7 4-7-4V7Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="m5 7 7 4 7-4M12 11v10" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </span>
      <span>
        Workspace<span className="brand-dot">.</span>
      </span>
    </span>
  );
}
