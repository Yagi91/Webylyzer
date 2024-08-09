const axios = require("axios");
const cheerio = require("cheerio");

async function analyzeHTML(url) {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  console.log(html);
  console.log($);
}

module.exports = {
  analyzeHTML,
};
