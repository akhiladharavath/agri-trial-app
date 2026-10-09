import {
ResponsiveContainer,
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
Legend
} from "recharts";

import "./YieldChart.css";

function YieldChart({ trials = [] }) {
const chartData = trials.flatMap((trial) =>
(trial.results || []).map((result, index) => {
const treatment =
result.normalizedTreatmentYield ??
result.treatmentYield;

        const control =
            result.normalizedControlYield ??
            result.controlYield;

        return {
            name: `${trial.trialId} - ${index + 1}`,
            crop: trial.crop,
            product: trial.product,
            treatmentYield:
                treatment !== null &&
                treatment !== undefined &&
                Number.isFinite(Number(treatment))
                    ? Number(treatment)
                    : null,
            controlYield:
                control !== null &&
                control !== undefined &&
                Number.isFinite(Number(control))
                    ? Number(control)
                    : null,
            unit:
                result.normalizedUnit ||
                result.unit ||
                "Yield"
        };
    })
);

if (chartData.length === 0) {
    return (
        <section className="yield-chart-card">
            <h2>Yield Comparison</h2>
            <p>No yield data is available to display.</p>
        </section>
    );
}

return (
    <section className="yield-chart-card">
        <div className="yield-chart-header">
            <h2>Yield Comparison</h2>
            <p>
                Compare treatment yield with control yield
                across available trial results.
            </p>
        </div>

        <div className="yield-chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 55
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="name"
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        height={75}
                        tick={{ fontSize: 12 }}
                    />

                    <YAxis
                        tick={{ fontSize: 12 }}
                        label={{
                            value: "Yield",
                            angle: -90,
                            position: "insideLeft"
                        }}
                    />

                    <Tooltip
                        formatter={(value, name, props) => [
                            `${value} ${props.payload.unit}`,
                            name
                        ]}
                        labelFormatter={(label) => {
                            const item = chartData.find(
                                (entry) => entry.name === label
                            );

                            return item
                                ? `${label} | ${item.crop || "Crop"} | ${item.product || "Product"}`
                                : label;
                        }}
                    />

                    <Legend />

                    <Bar
                        dataKey="treatmentYield"
                        name="Treatment Yield"
                        fill="#16a34a"
                    />

                    <Bar
                        dataKey="controlYield"
                        name="Control Yield"
                        fill="#64748b"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </section>
);


}

export default YieldChart;
