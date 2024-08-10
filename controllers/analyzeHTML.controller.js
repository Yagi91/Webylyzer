const { analyzeHTML } = require("../helpers/analyze");

const readAnalyzedHTML = async (req, res) => {
  const { url } = req.body;
  if (!url) {
    // check if the URL is provided in the request body
    return res.status(400).json({ error: "URL is required" });
  }

  // Call the analyzeHTML function and return the result
  try {
    const result = await analyzeHTML(url);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports = {
  readAnalyzedHTML,
};
