/**
 * Analyzes the HTML of a given URL.
 *
 * @param {string} url - The URL of the HTML to be analyzed.
 * @returns {Object} - An object containing the analysis results.
 * @property {string} htmlVersion - The version of HTML used in the document.
 * @property {string} title - The title of the HTML document.
 * @property {Object} headings - An object containing the count of each heading level (h1 to h6) in the HTML.
 * @property {Array} internalLinks - An array of internal links found in the HTML.
 * @property {Array} externalLinks - An array of external links found in the HTML.
 * @property {Array} linkValidationResults - An array of link validation results.
 * @property {boolean} loginform - Indicates whether the HTML contains a login form.
 */
const axios = require("axios");
const cheerio = require("cheerio");
const Bottleneck = require("bottleneck");
const NodeCache = require("node-cache");
const axiosRetry = require("axios-retry").default;

const cache = new NodeCache({ stdTTL: 3600 }); // Cache the results for 1 hour

// Configure axios-retry to retry failed requests up to 3 times with a delay of 1 second between retries
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// Function to analyze the HTML of a given URL
async function analyzeHTML(url) {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  const htmlVersion = $("!DOCTYPE").length ? $("!DOCTYPE")[0].name : "HTML5"; // why set to HTML5 if no !DOCTYPE tag? This is because HTML5 is the latest version of HTML, and it is the default version if no !DOCTYPE tag is present.
  const title = $("title").text();
  const headings = {};
  for (let i = 1; i <= 6; i++) {
    // Loop through all possible heading levels (h1 to h6) and count how many of each there are in the HTML.
    headings[`h${i}`] = $(`h${i}`).length;
  }

  const links = $("a"); // get all the anchor tags in the HTML
  const internalLinks = [];
  const externalLinks = [];

  //get the domain name of the URL
  const domain = new URL(url).hostname;
  links.each((index, link) => {
    // loop through all the links in the HTML and categorize them as internal or external links. If the link starts with "http", it is an external link. If it starts with "/", it is an internal link.
    const href = $(link).attr("href"); // convert the link to a string
    // if (!href) return;
    if (href.startsWith("/") || href.includes(domain)) {
      internalLinks.push(href);
    } else if (href.startsWith("http")) {
      externalLinks.push(href);
    }
  });

  async function validateLinks(links, baseUrl) {
    const limiter = new Bottleneck({
      maxConcurrent: 10, // Limit the number of concurrent requests
      minTime: 100, // Minimum time between requests
    });

    const results = await Promise.all(
      links.map((link) =>
        limiter.schedule(async () => {
          const absoluteLink = link.startsWith("/")
            ? new URL(link, baseUrl).href
            : link;

          // Check if the link has been cached
          const cachedResult = cache.get(absoluteLink);
          if (cachedResult) {
            return cachedResult;
          }
          try {
            // Make a request to the link
            const response = await axios.get(absoluteLink, {
              timeout: 5000,
              maxRedirects: 5,
            });
            const result = {
              link: absoluteLink,
              status: response.status,
              reachable: true,
            };
            // Store the result in the cache
            cache.set(absoluteLink, result);
            return result;
          } catch (error) {
            // If the request fails, return an object with the link, status code, and reachable status
            const result = {
              link: absoluteLink,
              status: error.response ? error.response.status : "N/A",
              reachable: false,
            };
            // Store the result in the cache
            cache.set(absoluteLink, result);
            return result;
          }
        })
      )
    );
    return results;
  }

  const linkValidationResults = await validateLinks([
    ...internalLinks,
    ...externalLinks,
  ]);

  // Check if the page contains a login form
  const isLoginForm = (form) => {
    const inputs = $(form).find("input");
    let hasUsername = false;
    let hasPassword = false;
    let hasSubmitButton = false;

    inputs.each((j, input) => {
      // loop through all the input fields in the form
      const type = $(input).attr("type");
      const name = $(input).attr("name");
      const id = $(input).attr("id");

      // check if the input field is likely to be used for login (e.g. username, email, password)
      if (
        type === "text" ||
        type === "email" ||
        name?.toLowerCase().includes("user") ||
        name?.toLowerCase().includes("email") ||
        id?.toLowerCase().includes("user") ||
        id?.toLowerCase().includes("email")
      ) {
        hasUsername = true;
      }

      // check if the input field is likely to be used for password
      if (
        type === "password" ||
        name?.toLowerCase().includes("password") ||
        id?.toLowerCase().includes("password")
      ) {
        hasPassword = true;
      }
    });

    // check if the form contains a submit button
    const submitButton = $(form).find(
      'button[type="submit"], input[type="submit"], button:contains("Login"), button:contains("Sign in")'
    );
    hasSubmitButton = submitButton.length > 0;

    return hasUsername && hasPassword && hasSubmitButton; // return true if the form contains all the required fields
  };

  // Check if any of the forms in the HTML are likely to be login forms
  const loginform =
    $("form").filter((index, form) => {
      return isLoginForm(form);
    }).length > 0;

  return {
    htmlVersion,
    title,
    headings,
    internalLinks,
    externalLinks,
    linkValidationResults,
    loginform,
  };
}

module.exports = {
  analyzeHTML,
};
