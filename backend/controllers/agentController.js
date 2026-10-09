
const { runAgent } = require("../agent/agentService");

const askAgent = async (req, res) => {
    try {
        const { question } = req.body;

        if (
            typeof question !== "string" ||
            !question.trim() ||
            question.length > 2000
        ) {
            return res.status(400).json({
                message: "Enter a question of up to 2000 characters."
            });
        }

        const result = await runAgent(question.trim());

        return res.status(200).json(result);
    } catch (error) {
        console.error("Agent request failed:", error);

        if (error.status === 401) {
            return res.status(502).json({
                message: "The LLM API key was rejected. Check your backend configuration."
            });
        }

        if (error.status === 429) {
            return res.status(503).json({
                message: "The LLM API quota or rate limit was reached. Check your API account."
            });
        }

        return res.status(500).json({
            message: "The agricultural evidence agent failed to complete the request."
        });
    }
};

module.exports = { askAgent };