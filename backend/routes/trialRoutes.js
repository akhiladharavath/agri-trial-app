const express = require("express");
const router = express.Router();

const {
    getTrials,
    getTrialById,
    exportTrialsCSV,
    compareTrials
} = require("../controllers/trialController");

router.get("/export/csv", exportTrialsCSV);
router.get("/", getTrials);
router.get("/:trialId", getTrialById);
router.post("/compare", compareTrials);

module.exports = router;