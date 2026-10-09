
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTrialById } from "../services/api";
import "./TrialDetails.css";

function isSafeHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

function TrialDetails() {
    const { trialId } = useParams();

    const [trial, setTrial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTrial = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getTrialById(trialId);
                setTrial(data);
            } catch (err) {
                console.error("Failed to load trial:", err);

                setError(
                    err.response?.status === 404
                        ? "Trial not found."
                        : "Unable to load trial details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTrial();
    }, [trialId]);

    if (loading) {
        return (
            <div className="trial-details-page">
                <p className="loading-message">
                    Loading trial details...
                </p>
            </div>
        );
    }

    if (error || !trial) {
        return (
            <div className="trial-details-page">
                <p className="error-message">
                    {error || "No trial data available."}
                </p>

                <Link to="/trials" className="back-link">
                    ← Back to Trials
                </Link>
            </div>
        );
    }

    // Combine structured sources with older source filenames.
    const structuredSources = Array.isArray(trial.sourceDetails)
        ? trial.sourceDetails
        : [];

    const legacySources = [
        ...(Array.isArray(trial.sources) ? trial.sources : []),
        ...(Array.isArray(trial.results)
            ? trial.results.map((result) => result.source)
            : [])
    ];

    const sourceDetails = [...structuredSources];

    legacySources.forEach((source) => {
        if (
            source &&
            !sourceDetails.some(
                (item) =>
                    item.fileName === source ||
                    item.reference === source
            )
        ) {
            sourceDetails.push({
                fileName: source,
                title: null,
                reference: null,
                url: null,
                page: null
            });
        }
    });

    return (
        <div className="trial-details-page">
            <Link to="/trials" className="back-link">
                ← Back to Trials
            </Link>

            <div className="page-header">
                <h1>Trial Details: {trial.trialId}</h1>
                <p>
                    Detailed agricultural trial evidence and yield results.
                </p>
            </div>

            <section className="details-card">
                <h2>Trial Information</h2>

                <div className="details-grid">
                    <div>
                        <span>Crop</span>
                        <strong>{trial.crop || "N/A"}</strong>
                    </div>

                    <div>
                        <span>Product</span>
                        <strong>{trial.product || "N/A"}</strong>
                    </div>

                    <div>
                        <span>Country</span>
                        <strong>{trial.country || "N/A"}</strong>
                    </div>

                    <div>
                        <span>Year</span>
                        <strong>{trial.year ?? "N/A"}</strong>
                    </div>

                    <div>
                        <span>Trial Type</span>
                        <strong>{trial.trialType || "N/A"}</strong>
                    </div>
                </div>
            </section>

            <section className="details-card source-evidence-card">
                <h2>Source Evidence</h2>

                <p className="source-intro">
                    Review the available source information used to record
                    this trial. A source filename identifies the imported
                    data file; it does not necessarily identify the original
                    scientific publication.
                </p>

                {sourceDetails.length === 0 ? (
                    <p className="source-empty">
                        Source information was not provided for this trial.
                    </p>
                ) : (
                    <div className="source-list">
                        {sourceDetails.map((source, index) => {
                            const urlIsSafe =
                                typeof source.url === "string" &&
                                isSafeHttpUrl(source.url);

                            return (
                                <article
                                    className="source-item"
                                    key={[
                                        source.fileName,
                                        source.reference,
                                        index
                                    ].join("-")}
                                >
                                    <div className="source-item-heading">
                                        <span className="source-icon">
                                            <span aria-hidden="true">▤</span>
                                        </span>

                                        <div>
                                            <h3>
                                                {source.title ||
                                                    source.reference ||
                                                    source.fileName ||
                                                    "Source record"}
                                            </h3>

                                            <p className="source-type">
                                                {source.url && urlIsSafe
                                                    ? "External source link available"
                                                    : "No publication link available"}
                                            </p>
                                        </div>
                                    </div>

                                    <dl className="source-metadata">
                                        {source.fileName && (
                                            <>
                                                <dt>Source file</dt>
                                                <dd>{source.fileName}</dd>
                                            </>
                                        )}

                                        {source.reference && (
                                            <>
                                                <dt>Reference</dt>
                                                <dd>{source.reference}</dd>
                                            </>
                                        )}

                                        {source.page && (
                                            <>
                                                <dt>Page / section</dt>
                                                <dd>{source.page}</dd>
                                            </>
                                        )}

                                        {source.title && source.reference && (
                                            <>
                                                <dt>Publication title</dt>
                                                <dd>{source.title}</dd>
                                            </>
                                        )}
                                    </dl>

                                    {urlIsSafe ? (
                                        <a
                                            className="source-link"
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Open original source
                                            <span aria-hidden="true"> ↗</span>
                                        </a>
                                    ) : (
                                        <p className="source-unavailable">
                                            Original publication URL not
                                            provided.
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="details-card">
                <h2>Yield Evidence</h2>

                {!trial.results || trial.results.length === 0 ? (
                    <p>No yield results are available for this trial.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Source</th>
                                    <th>Treatment Yield</th>
                                    <th>Control Yield</th>
                                    <th>Unit</th>
                                    <th>Improvement</th>
                                </tr>
                            </thead>

                            <tbody>
                                {trial.results.map((result, index) => {
                                    const treatment =
                                        result.normalizedTreatmentYield ??
                                        result.treatmentYield;

                                    const control =
                                        result.normalizedControlYield ??
                                        result.controlYield;

                                    const validYields =
                                        treatment !== null &&
                                        treatment !== undefined &&
                                        control !== null &&
                                        control !== undefined &&
                                        Number.isFinite(Number(treatment)) &&
                                        Number.isFinite(Number(control)) &&
                                        Number(control) !== 0;

                                    const improvement = validYields
                                        ? (
                                            (
                                                Number(treatment) -
                                                Number(control)
                                            ) /
                                            Math.abs(Number(control))
                                        ) * 100
                                        : null;

                                    return (
                                        <tr
                                            key={`${result.source || "source"}-${index}`}
                                        >
                                            <td>
                                                {result.source || "N/A"}
                                            </td>

                                            <td>{treatment ?? "N/A"}</td>
                                            <td>{control ?? "N/A"}</td>

                                            <td>
                                                {result.normalizedUnit ||
                                                    result.unit ||
                                                    "N/A"}
                                            </td>

                                            <td>
                                                {improvement === null
                                                    ? "N/A"
                                                    : `${improvement.toFixed(2)}%`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {Array.isArray(trial.notes) && trial.notes.length > 0 && (
                <section className="details-card">
                    <h2>Notes</h2>

                    <ul className="trial-notes">
                        {trial.notes.map((note, index) => (
                            <li key={index}>{note}</li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

export default TrialDetails;