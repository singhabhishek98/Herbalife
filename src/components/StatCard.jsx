export default function StatCard({ title, value, note, icon, green }) {
  return (
    <div className={green ? 'statCard greenCard' : 'statCard'}>
      <div className="statTop">
        <span>{title}</span>
        <div className="statIcon">{icon}</div>
      </div>
      <div className="statValue">{value}</div>
      <div className="statNote">{note}</div>
    </div>
  );
}
