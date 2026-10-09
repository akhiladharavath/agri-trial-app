
import { useEffect, useState } from "react";
import {
    getSummary,
    getTrials,
    exportTrialsCSV,
    compareTrials
} from "../services/api";

import FilterPanel from "../components/FilterPanel";
import TrialTable from "../components/TrialTable";
import "./Trials.css";

const EMPTY_FILTERS = {
    crop: "",
    product: "",
    country: "",
    year: "",
    trialType: ""
};

function Trials() {
    const [trials, setTrials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [options, setOptions] = useState({
        crops: [],
        products: [],
        countries: [],
        years: [],
        trialTypes: []
    });

    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 5,
        count: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
    });

    // Comparison state
    const [selectedTrialIds, setSelectedTrialIds] = useState([]);
    const [comparison, setComparison] = useState(null);
    const [compareLoading, setCompareLoading] = useState(false);
    const [compareError, setCompareError] = useState("");

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const summary = await getSummary();

                setOptions({
                    crops: summary.crops || [],
                    products: summary.products || [],
                    countries: summary.countries || [],
                    years: summary.years || [],
                    trialTypes: summary.trialTypes || []
                });
            } catch (err) {
                console.error("Failed to load filter options:", err);
            }
        };

        loadOptions();
    }, []);

    const loadTrials = async (
        currentFilters = EMPTY_FILTERS,
        page = 1,
        limit = 5
    ) => {
        try {
            setLoading(true);
            setError("");

            const cleanFilters = {};

            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value !== "") {
                    cleanFilters[key] = value;
                }
            });

            const data = await getTrials({
                ...cleanFilters,
                page,
                limit
            });

            setTrials(data.trials || []);

            setPagination({
                page: data.page,
                limit: data.limit,
                count: data.count,
                totalPages: data.totalPages,
                hasNextPage: data.hasNextPage,
                hasPreviousPage: data.hasPreviousPage
            });
        } catch (err) {
            console.error("Failed to load trials:", err);
            setError("Unable to load trial data.");
            setTrials([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrials(EMPTY_FILTERS, 1, 5);
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSearch = () => {
        setComparison(null);
        setCompareError("");
        loadTrials(filters, 1, pagination.limit);
    };

    const handleReset = () => {
        setFilters(EMPTY_FILTERS);
        setComparison(null);
        setCompareError("");
        loadTrials(EMPTY_FILTERS, 1, pagination.limit);
    };

    const handlePageChange = (newPage) => {
        loadTrials(filters, newPage, pagination.limit);
    };

    const handleLimitChange = (newLimit) => {
        loadTrials(filters, 1, newLimit);
    };

    const handleExport = async () => {
        try {
            setError("");

            const cleanFilters = {};

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== "") {
                    cleanFilters[key] = value;
                }
            });

            await exportTrialsCSV(cleanFilters);
        } catch (err) {
            console.error("CSV export failed:", err);
            setError("Unable to export trial data. Please try again.");
        }
    };

    const handleSelectTrial = (trialId) => {
        setCompareError("");
        setComparison(null);

        setSelectedTrialIds((previous) => {
            if (previous.includes(trialId)) {
                return previous.filter((id) => id !== trialId);
            }

            if (previous.length >= 10) {
                setCompareError("You can select a maximum of 10 trials.");
                return previous;
            }

            return [...previous, trialId];
        });
    };

    const handleClearSelection = () => {
        setSelectedTrialIds([]);
        setComparison(null);
        setCompareError("");
    };

    const handleCompare = async () => {
        if (selectedTrialIds.length < 2) {
            setCompareError("Select at least 2 trials to compare.");
            return;
        }

        try {
            setCompareLoading(true);
            setCompareError("");
            setComparison(null);

            const result = await compareTrials(selectedTrialIds);
            setComparison(result);
        } catch (err) {
            console.error("Trial comparison failed:", err);

            setCompareError(
                err.response?.data?.message ||
                "Unable to compare trials. Check your backend and try again."
            );
        } finally {
            setCompareLoading(false);
        }
    };

    const comparisonTrials = comparison?.trials || [];

    const units = [
        ...new Set(
            comparisonTrials
                .map((trial) => trial.yieldUnit?.trim())
                .filter(Boolean)
        )
    ];

    const hasMissingUnits = comparisonTrials.some(
        (trial) => !trial.yieldUnit?.trim()
    );

    const incompatibleUnits = units.length > 1 || hasMissingUnits;

    return (
        <div className="page trials-page">
            <div className="page-header">
                <h1>Agricultural Trials</h1>
                <p>
                    Search, select, and compare agricultural trial evidence.
                </p>
            </div>

            <FilterPanel
                filters={filters}
                options={options}
                onChange={handleChange}
                onSearch={handleSearch}
                onReset={handleReset}
            />

            {error && <p className="error">{error}</p>}

            {!loading && trials.length > 0 && (
                <section className="trial-selection-card">
                    <div className="comparison-heading">
                        <div>
                            <h2>Select Trials to Compare</h2>
                            <p>
                                Select trials on this or another page.
                                You can compare up to 10 trials.
                            </p>
                        </div>

                        <span className="selection-count">
                            {selectedTrialIds.length}/10 selected
                        </span>
                    </div>

                    <div className="trial-selection-list">
                        {trials.map((trial) => (
                            <label
                                className="trial-selection-item"
                                key={trial.trialId}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTrialIds.includes(
                                        trial.trialId
                                    )}
                                    onChange={() =>
                                        handleSelectTrial(trial.trialId)
                                    }
                                />

                                <span>
                                    <strong>{trial.trialId}</strong>
                                    {" — "}
                                    {trial.crop || "Unknown crop"}
                                    {" / "}
                                    {trial.product || "Unknown product"}

                                    <small>
                                        {trial.country || "Unknown country"}
                                        {" · "}
                                        {trial.year || "Unknown year"}
                                    </small>
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="comparison-actions">
                        <button
                            type="button"
                            className="compare-button"
                            onClick={handleCompare}
                            disabled={
                                selectedTrialIds.length < 2 ||
                                compareLoading
                            }
                        >
                            {compareLoading
                                ? "Comparing..."
                                : `Compare Selected (${selectedTrialIds.length})`}
                        </button>

                        <button
                            type="button"
                            className="clear-selection-button"
                            onClick={handleClearSelection}
                            disabled={
                                selectedTrialIds.length === 0 ||
                                compareLoading
                            }
                        >
                            Clear Selection
                        </button>
                    </div>

                    {compareError && (
                        <p className="comparison-error">
                            {compareError}
                        </p>
                    )}
                </section>
            )}

            {loading && (
                <p className="loading">Loading trials...</p>
            )}

            {!loading && !error && (
                <>
                    <div className="results-header">
                        <div>
                            <h2>Trial Results</h2>
                            <span>
                                {pagination.count} trials found
                            </span>
                        </div>

                        <button
                            type="button"
                            className="export-button"
                            onClick={handleExport}
                        >
                            Export CSV
                        </button>
                    </div>

                    <TrialTable
                        trials={trials}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onLimitChange={handleLimitChange}
                    />
                </>
            )}

            {comparison && (
                <section className="comparison-results">
                    <div className="comparison-heading">
                        <div>
                            <h2>Trial Comparison Results</h2>
                            <p>
                                Comparing {comparisonTrials.length} trials
                            </p>
                        </div>

                        <button
                            type="button"
                            className="clear-selection-button"
                            onClick={() => setComparison(null)}
                        >
                            Close Results
                        </button>
                    </div>

                    {incompatibleUnits && (
                        <p className="unit-warning">
                            Warning: These trials have missing or different
                            yield units. Yield differences and percentages
                            may not be directly comparable.
                        </p>
                    )}

                    <div className="comparison-table-wrapper">
                        <table className="comparison-table">
                            <thead>
                                <tr>
                                    <th>Trial</th>
                                    <th>Crop</th>
                                    <th>Product</th>
                                    <th>Country</th>
                                    <th>Year</th>
                                    <th>Treatment Yield</th>
                                    <th>Control Yield</th>
                                    <th>Difference</th>
                                    <th>Improvement</th>
                                    <th>Unit</th>
                                </tr>
                            </thead>

                            <tbody>
                                {comparisonTrials.map((trial) => (
                                    <tr key={trial.trialId}>
                                        <td>{trial.trialId}</td>
                                        <td>{trial.crop || "—"}</td>
                                        <td>{trial.product || "—"}</td>
                                        <td>{trial.country || "—"}</td>
                                        <td>{trial.year || "—"}</td>

                                        <td>
                                            {trial.treatmentYield ?? "—"}
                                        </td>

                                        <td>
                                            {trial.controlYield ?? "—"}
                                        </td>

                                        <td>
                                            {trial.yieldDifference ?? "—"}
                                        </td>

                                        <td>
                                            {trial.improvementPercent == null
                                                ? "—"
                                                : `${trial.improvementPercent}%`}
                                        </td>

                                        <td>{trial.yieldUnit || "Unknown"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {comparisonTrials.some(
                        (trial) => trial.comparisonNote
                    ) && (
                        <div className="comparison-notes">
                            <h3>Data quality notes</h3>

                            <ul>
                                {comparisonTrials
                                    .filter((trial) => trial.comparisonNote)
                                    .map((trial) => (
                                        <li key={trial.trialId}>
                                            <strong>{trial.trialId}:</strong>{" "}
                                            {trial.comparisonNote}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}

                    <p className="comparison-footnote">
                        Positive improvement means the treatment yield
                        exceeded the control yield. These figures alone do
                        not establish statistical significance or prove
                        that the product caused the difference.
                    </p>
                </section>
            )}
        </div>
    );
}

export default Trials;