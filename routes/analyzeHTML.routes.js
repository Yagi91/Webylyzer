const router = require("express").Router();

const analyzeHTMLController = require("../controllers/analyzeHTML.controller");

router.route("/api/analyzeHTML").post(analyzeHTMLController.readAnalyzedHTML);

module.exports = router;
