const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

const connectDB = require("./db");
const agentRoutes = require("./routes/agentRoutes");
const summaryRoutes = require("./routes/summaryRoutes");

const trialRoutes = require("./routes/trialRoutes");

dotenv.config();

connectDB();

const app = express();



app.use(cors());
app.use(express.json());



app.get("/", (req, res) => {
    res.json({
        message: "Agricultural Trial Evidence API is running"
    });
});



app.use("/api/trials", trialRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/agent", agentRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});