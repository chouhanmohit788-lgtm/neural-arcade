function StatCard({ icon: Icon, label, value, accent = "orange" }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default StatCard;