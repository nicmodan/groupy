export default function PortalBadge({ isOpen }) {
  return isOpen ? (
    <span className="portal-badge-open">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
      Open
    </span>
  ) : (
    <span className="portal-badge-closed">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      Closed
    </span>
  );
}
