# Webylyzer

## Overview
Webylyzer is a web application that allows users to analyze HTML web pages by entering a URL. The application extracts various pieces of information from the HTML document and displays the results in a tabular format. Additionally, it validates the availability of hypermedia links on the page.

## Features
- **HTML Version Detection**: Identifies the HTML version of the document.
- **Page Title Extraction**: Extracts the title of the web page.
- **Headings Count**: Counts the number of headings grouped by heading level (e.g., `<h1>`, `<h2>`, etc.).
- **Hypermedia Links Analysis**: Counts the number of internal and external links.
- **Login Form Detection**: Detects the presence of a login form on the page.
- **Link Validation** (Optional): Validates the availability of each linked resource and handles redirections.

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Steps
1. Clone the repository:
    ```sh
    git clone https://github.com/Yagi91/Webylyzer
    cd web-page-analyzer
    ```
2. Install dependencies:
    ```sh
    npm install
    ```

## Usage
1. Start the server:
    ```sh
    npm start
    ```
    Alternatively, for development mode with hot-reloading:
    ```sh
    npm run dev
    ```
2. The server will start on [`http://localhost:5000`]("Go to definition").
3. Use an API client like Postman or cURL to interact with the backend endpoints.

### Example API Request
To analyze a web page, send a POST request to the `api/analyzeHTML` endpoint with the URL to be analyzed in the request body.

#### Request
```sh
curl -X POST http://localhost:5000/api/analyzeHTML -H "Content-Type: application/json" -d '{"url": "http://example.com"}'

## Design Decisions and Assumptions
- **HTML Parsing**: The application uses the `cheerio` library to parse HTML documents and extract information.
- **Login Form Detection**: The detection logic looks for forms with input fields of type email/username & "password" & login button and common login-related keywords in the form's action or input names.
- **Link Validation**: The optional link validation feature uses `axios` for making HTTP requests and `bottleneck` for rate limiting to ensure efficient performance.
- **Caching**: Results of link validation are cached in memory using `node-cache` to avoid redundant requests.

## Known Constraints and Limitations
- **Volatile Cache**: The current implementation uses an in-memory cache, which means cached data is lost when the server restarts. I can improve on thismy using an external databse like Redis or save locally with fs since this is a small project.
- **Login Form Detection**: The logic for detecting login forms may not cover all possible cases due to the variety of ways login forms can be constructed example the multi-step and modal.
- **Performance**: While the application uses rate limiting and caching to improve performance, analyzing very large web pages with numerous links may still be time-consuming.

## Build and Run Locally
1. Ensure all dependencies are installed:
    ```sh
    npm install
    ```
2. Start the server:
    ```sh
    npm start
    ```
3. Open your web browser and navigate to `http://localhost:5000`.

## Testing
Run the tests using the following command:
```sh
npm test
