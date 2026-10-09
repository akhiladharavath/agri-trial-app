import { useEffect, useState } from "react";
import { getSummary, getTrials } from "../services/api";
import StatCard from "../components/StatCard";
import YieldChart from "../components/YieldChart";

function Dashboard() {
const [summary, setSummary] = useState(null);
const [trials, setTrials] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");


useEffect(() => {
    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [summaryData, trialData] = await Promise.all([
                getSummary(),
                getTrials()
            ]);

            setSummary(summaryData);
            setTrials(trialData.trials || []);
        } catch (error) {
            console.error("Failed to load dashboard:", error);
            setError("Unable to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    loadDashboard();
}, []);

if (loading) {
    return <p className="loading">Loading dashboard...</p>;
}

if (error) {
    return <p className="error">{error}</p>;
}

return (
    <div className="page">
        <div className="page-header">
            <h1>Dashboard</h1>
            <p>Overview of agricultural trial evidence</p>
        </div>

        <div className="stats-grid">
            <StatCard
                title="Total Trials"
                value={summary.totalTrials}
            />

            <StatCard
                title="Crops"
                value={summary.totalCrops}
            />

            <StatCard
                title="Products"
                value={summary.totalProducts}
            />

            <StatCard
                title="Countries"
                value={summary.totalCountries}
            />
        </div>

        <div className="yield-section">
            <h2>Yield Summary</h2>

            <div className="yield-grid">
                <StatCard
                    title="Average Treatment Yield"
                    value={`${summary.averageTreatmentYield} kg/ha`}
                />

                <StatCard
                    title="Average Control Yield"
                    value={`${summary.averageControlYield} kg/ha`}
                />

                <StatCard
                    title="Average Improvement"
                    value={`${summary.averageImprovementPercent}%`}
                />
            </div>
        </div>

        <YieldChart trials={trials} />
    </div>
);


}

export default Dashboard;
