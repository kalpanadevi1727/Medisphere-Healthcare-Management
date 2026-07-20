function DashboardCard({ title, value, icon }) {
    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

                <div className="d-flex justify-content-between">

                    <div>
                        <h6 className="text-muted">
                            {title}
                        </h6>

                        <h2>
                            {value}
                        </h2>
                    </div>

                    <div
                        style={{
                            fontSize: "35px"
                        }}
                    >
                        {icon}
                    </div>

                </div>

            </div>
        </div>
    );
}

export default DashboardCard;