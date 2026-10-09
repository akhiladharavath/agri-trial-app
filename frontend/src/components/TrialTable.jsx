import { Link } from "react-router-dom";
import "./TrialTable.css";

function TrialTable({
trials = [],
pagination,
onPageChange,
onLimitChange
}) {
const getImprovement = (results = []) => {
const improvements = results
.map((result) => {
const treatment =
result.normalizedTreatmentYield ??
result.treatmentYield;


            const control =
                result.normalizedControlYield ??
                result.controlYield;

            if (
                treatment == null ||
                control == null ||
                !Number.isFinite(Number(treatment)) ||
                !Number.isFinite(Number(control)) ||
                Number(control) <= 0
            ) {
                return null;
            }

            return (
                ((Number(treatment) - Number(control)) /
                    Number(control)) *
                100
            );
        })
        .filter((value) => value !== null);

    if (improvements.length === 0) {
        return null;
    }

    return (
        improvements.reduce((sum, value) => sum + value, 0) /
        improvements.length
    );
};

const page = pagination?.page || 1;
const limit = pagination?.limit || 5;
const count = pagination?.count || 0;
const totalPages = pagination?.totalPages || 0;

const startRecord = count === 0 ? 0 : (page - 1) * limit + 1;
const endRecord = Math.min(page * limit, count);

return (
    <div className="trial-table-card">
        <div className="trial-table-toolbar">
            <label>
                Records per page
                <select
                    value={limit}
                    onChange={(event) =>
                        onLimitChange(Number(event.target.value))
                    }
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </label>

            <span className="trial-record-count">
                Showing {startRecord}–{endRecord} of {count} records
            </span>
        </div>

        {trials.length === 0 ? (
            <p className="trial-table-empty">
                No trials found. Try changing your filters.
            </p>
        ) : (
            <div className="trial-table-scroll">
                <table className="trial-data-table">
                    <thead>
                        <tr>
                            <th>Trial ID</th>
                            <th>Crop</th>
                            <th>Product</th>
                            <th>Country</th>
                            <th>Year</th>
                            <th>Trial Type</th>
                            <th>Yield Improvement</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {trials.map((trial) => {
                            const improvement = getImprovement(
                                trial.results || []
                            );

                            const detailsPath =
                                `/trials/${encodeURIComponent(trial.trialId)}`;

                            return (
                                <tr key={trial._id || trial.trialId}>
                                    <td>
                                        <Link
                                            className="trial-id-link"
                                            to={detailsPath}
                                        >
                                            {trial.trialId}
                                        </Link>
                                    </td>

                                    <td>{trial.crop || "N/A"}</td>
                                    <td>{trial.product || "N/A"}</td>
                                    <td>{trial.country || "N/A"}</td>
                                    <td>{trial.year || "N/A"}</td>
                                    <td>{trial.trialType || "N/A"}</td>

                                    <td>
                                        {improvement === null ? (
                                            <span className="improvement-na">
                                                N/A
                                            </span>
                                        ) : (
                                            <span
                                                className={`improvement-value ${
                                                    improvement > 0
                                                        ? "positive"
                                                        : improvement < 0
                                                        ? "negative"
                                                        : "neutral"
                                                }`}
                                            >
                                                {improvement > 0 ? "+" : ""}
                                                {improvement.toFixed(2)}%
                                            </span>
                                        )}
                                    </td>

                                    <td>
                                        <Link
                                            className="view-trial-link"
                                            to={detailsPath}
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}

        {count > 0 && (
            <div className="trial-pagination">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!pagination?.hasPreviousPage}
                >
                    Previous
                </button>

                <span>
                    Page {page} of {totalPages}
                </span>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!pagination?.hasNextPage}
                >
                    Next
                </button>
            </div>
        )}
    </div>
);


}

export default TrialTable;
