
import { useState } from "react";
import { askAgriculturalAgent } from "../services/api";
import "./Agent.css";

const EXAMPLE_QUESTIONS = [
    "Show all wheat trials involving Harvest Plus.",
    "Compare Harvest Plus wheat results in France and Germany.",
    "Which scientific wheat trials ran from 2021 through 2025?",
    "Is there evidence for Harvest Plus improving rice yields?"
];

function Agent() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [activity, setActivity] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAsk = async (event) => {
        event.preventDefault();

        if (!question.trim() || loading) return;

        setLoading(true);
        setAnswer("");
        setActivity([]);
        setStatus("running");
        setError("");

        try {
            const result = await askAgriculturalAgent(question.trim());

            setAnswer(result.answer || "No answer was returned.");
            setActivity(result.activity || []);
            setStatus(result.status || "incomplete");
        } catch (err) {
            console.error("Agent request failed:", err);

            setError(
                err.response?.data?.message ||
                "Could not contact the agent. Check that the backend is running."
            );

            setStatus("failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page agent-page">
            <div className="page-header">
                <h1>Agricultural Evidence Agent</h1>
                <p>
                    Ask questions about agricultural trials and inspect
                    the tools used to find evidence.
                </p>
            </div>

            <section className="agent-panel">
                <h2>Ask a question</h2>

                <form onSubmit={handleAsk}>
                    <textarea
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        placeholder="Example: Compare Harvest Plus wheat results in France and Germany."
                        rows={4}
                        maxLength={2000}
                        required
                    />

                    <div className="agent-form-footer">
                        <span>{question.length}/2000 characters</span>

                        <button
                            type="submit"
                            disabled={loading || !question.trim()}
                        >
                            {loading ? "Investigating..." : "Ask Agent"}
                        </button>
                    </div>
                </form>

                <div className="agent-examples">
                    <h3>Try an example</h3>

                    {EXAMPLE_QUESTIONS.map((example) => (
                        <button
                            type="button"
                            className="example-question"
                            key={example}
                            disabled={loading}
                            onClick={() => setQuestion(example)}
                        >
                            {example}
                        </button>
                    ))}
                </div>
            </section>

            {error && (
                <section className="agent-error">
                    <strong>Request failed</strong>
                    <p>{error}</p>
                </section>
            )}

            {(loading || answer) && (
                <section className="agent-panel agent-answer-panel">
                    <div className="agent-section-heading">
                        <h2>Agent response</h2>

                        <span className={`agent-status ${status}`}>
                            {loading
                                ? "Running"
                                : status === "completed"
                                    ? "Completed"
                                    : status === "failed"
                                        ? "Failed"
                                        : "Incomplete"}
                        </span>
                    </div>

                    {loading && (
                        <p className="agent-loading">
                            Searching trial evidence and analyzing results...
                        </p>
                    )}

                    {answer && (
                        <div className="agent-answer">
                            {answer}
                        </div>
                    )}
                </section>
            )}

            {(activity.length > 0 || loading) && (
                <section className="agent-panel">
                    <h2>Tool activity</h2>
                    <p className="agent-muted">
                        Review the database tools the agent called and their results.
                    </p>

                    {activity.length === 0 && loading && (
                        <p className="agent-muted">
                            Waiting for the agent to request its first tool...
                        </p>
                    )}

                    {activity.map((item, index) => (
                        <div
                            className="agent-activity-item"
                            key={`${item.tool}-${index}`}
                        >
                            <div className="agent-activity-heading">
                                <strong>{item.tool}</strong>

                                <span className={`agent-status ${item.status}`}>
                                    {item.status}
                                </span>
                            </div>

                            {item.arguments && (
                                <pre>
                                    {JSON.stringify(item.arguments, null, 2)}
                                </pre>
                            )}

                            {item.resultSummary && (
                                <p>{item.resultSummary}</p>
                            )}

                            {item.error && (
                                <p className="agent-error-text">{item.error}</p>
                            )}
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}

export default Agent;