
const express = require("express");
const router = express.Router();

const { askAgent } = require("../controllers/agentController");

router.post("/", askAgent);

module.exports = router;