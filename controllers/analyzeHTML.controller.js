const { analyzeHTML } = require("../helpers/analyze");

const readAnalyzedHTML = async (req, res) => {
  const { url } = req.body;
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
