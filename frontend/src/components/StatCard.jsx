export default function StatCard({ title, value, note, icon, accent = 'green' }) {
  return (
    <div className={`statCard statCard--${accent}`}>
      <div className="statHead">
        <div className="statIconWrap">{icon}</div>
        <div className="statMeta">
          <span className="statLabel">{title}</span>
          <div className="statValue">{value}</div>
        </div>
      </div>
      <div className="statFoot">
        <div className="statNote">{note}</div>
        <div className="statSpark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
