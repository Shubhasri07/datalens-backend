# DataSense Insights

Build a complete functional web app called “DataSense AI Analyst” for a college project: Schema-Agnostic Natural Language Data Analyst.

IMPORTANT: Complete everything in ONE generation. Keep the code simple and minimal to reduce credit/token usage. Do not create unnecessary animations, decorative pages, authentication, database, or paid integrations. Do not ask follow-up questions. Prioritize working functionality.

CORE REQUIREMENTS:

1. HOME

Create a professional responsive landing page titled “DataSense AI Analyst” with subtitle “Schema-Agnostic Natural Language Data Analyst” and an “Upload Dataset” button.

2. DATA UPLOAD

Allow drag-and-drop/upload of CSV, XLS/XLSX and JSON files.

Validate the file and show filename, size, row count and column count.

3. AUTOMATIC SCHEMA DETECTION

After upload automatically detect:

- column names

- numeric/text/date/categorical data types

- missing values

- duplicate rows

Show a dataset preview table.

4. AUTOMATIC ANALYTICS

Analyze any uploaded dataset without predefined schema.

For numeric columns calculate count, sum, average, min and max.

Automatically identify useful trends, anomalies, correlations and important metrics.

5. ASK DATA

Create an “Ask AI” style natural-language query interface.

Users must be able to ask questions such as:

“What is the highest value?”

“What is the average sales?”

“Which product performed best?”

“Show sales by region.”

“Show monthly trend.”

Interpret questions using the uploaded dataset and return the calculated answer in simple English without requiring SQL.

Also show a short explanation of how the answer was calculated.

Implement useful local rule-based analysis where possible so the demo works without requiring a paid API key.

6. VISUALIZATION

Automatically create suitable Bar, Line, Pie and Scatter charts from uploaded data and user queries.

7. DASHBOARD

Create one compact dashboard with navigation:

Overview | Dataset | Ask AI | Insights | Visualizations | Data Quality | Reports

Overview: KPI cards and summary.

Dataset: preview + detected schema.

Ask AI: natural-language questions and answers.

Insights: trends, anomalies and correlations.

Visualizations: automatic interactive charts.

Data Quality: missing values and duplicates.

Reports: concise analysis summary.

8. PRIVACY

Process uploaded files locally/in-session wherever possible and display a privacy message.

9. DEMO

Include a small built-in sample sales dataset so “Try Demo Data” works immediately even without uploading a file.

TECHNICAL:

Use React + TypeScript.

Use lightweight libraries only when necessary.

Keep components/code compact.

Make it responsive.

Handle errors gracefully.

Ensure the project builds without TypeScript errors.

Do NOT create fake buttons or static placeholder pages. Core buttons and dataset analysis must actually work.

At the end, run/build the project, fix errors automatically, and show the working app preview.

Do all of the above in this single generation and do not expand scope beyond these requirements.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/96f95de4-1e71-5cb3-9da2-3f8a71e591b6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
