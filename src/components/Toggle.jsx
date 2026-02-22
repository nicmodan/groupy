export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <span className="toggle-slider" />
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
}
