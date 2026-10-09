
import { useNavigate } from "react-router-dom";
import "./AgentFloatingButton.css";

function AgentFloatingButton() {
    const navigate = useNavigate();

    return (
        <button
            type="button"
            className="agent-floating-button"
            onClick={() => navigate("/agent")}
            aria-label="Open Agricultural Evidence Agent"
            title="Ask Agricultural Evidence Agent"
        >
            <span className="agent-floating-icon">✦</span>
            <span>Ask AI</span>
        </button>
    );
}

export default AgentFloatingButton;