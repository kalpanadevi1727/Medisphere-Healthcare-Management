function StatCard({ title, value, subtitle }) {

  return (

    <div className="card info-card shadow-lg">

      <div className="card-body">

        <small>{title}</small>

        <h2>{value}</h2>

        <span className="text-primary">
          {subtitle}
        </span>

      </div>

    </div>

  );

}

export default StatCard;  