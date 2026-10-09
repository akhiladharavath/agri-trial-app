\# Agricultural Trial Evidence App



A full-stack application for importing, searching, comparing, and inspecting agricultural product trial evidence. The project is designed to help users evaluate trial outcomes across crops, products, countries, years, and trial types while preserving the available source information.



\## 1. Problem Statement



Agricultural trial information can be distributed across CSV files with inconsistent column names, product names, country codes, measurement units, and incomplete results. Comparing evidence manually can be time-consuming and may lead to misleading conclusions.



This application aims to make trial data easier to explore, compare, and inspect, while identifying data-quality issues and retaining traceability to the available source records.



\## 2. Key Features



The project is designed around the following capabilities:



\* \*\*CSV ingestion:\*\* Import the supplied trial datasets into MongoDB.

\* \*\*Trial search and filtering:\*\* Explore records by crop, product, country, year, and trial type.

\* \*\*Trial comparison:\*\* Compare selected trials using their available treatment and control yield measurements.

\* \*\*Source traceability:\*\* Display source filenames and any available reference or publication links.

\* \*\*Data-quality checks:\*\* Identify missing values, invalid records, duplicate source entries, and potential conflicts between results.

\* \*\*LLM-powered agent:\*\* Allow users to ask natural-language questions and use tools to search trial records and retrieve trial details.

\* \*\*Browser-based interface:\*\* Access the application's workflows through a React frontend.



Feature availability depends on the current implementation and the data supplied. See the Testing and Limitations sections below.



\## 3. Technology Stack



\* Frontend: React, JavaScript, CSS

\* Backend: Node.js, Express

\* Database: MongoDB with Mongoose

\* Data ingestion: CSV parsing with `csv-parser`

\* AI integration: OpenAI API

\* API communication: HTTP requests from the frontend to the backend



\## 4. Project Structure



```text

agri-trial-app/

├── data/

│   ├── trials\_a.csv

│   └── trials\_b.csv

├── backend/

│   ├── agent/

│   ├── controllers/

│   ├── import/

│   │   └── importData.js

│   ├── models/

│   ├── routes/

│   ├── .env.example

│   ├── db.js

│   ├── index.js

│   └── package.json

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   └── services/

│   └── package.json

├── .gitignore

└── README.md

```



The structure above describes the intended organization. Some filenames may differ depending on the final project version.



\## 5. Prerequisites



Install the following before running the application:



\* Node.js and npm

\* MongoDB, either locally or through a hosted MongoDB deployment

\* An OpenAI API key if using the LLM-powered agent



\## 6. Configuration



Create a local environment file at `backend/.env`. Use the variable names expected by the backend configuration.



Example:



```env

MONGO\_URI=your\_mongodb\_connection\_string

OPENAI\_API\_KEY=your\_openai\_api\_key

OPENAI\_MODEL=your\_available\_model\_name

PORT=5000

```



Replace the placeholders with your own configuration. The model name must be one that your OpenAI API account can access.



Never commit `.env` or real credentials to version control. Use `backend/.env.example` to document required environment variables without exposing secrets.



If your `db.js` uses a different MongoDB variable name, use that exact name.



\## 7. Installation and Setup



Clone the repository:



```bash

git clone https://github.com/akhiladharavath/agri-trial-app.git

cd agri-trial-app

```



Install backend dependencies:



```bash

cd backend

npm install

```



Install frontend dependencies:



```bash

cd ../frontend

npm install

```



Configure `backend/.env` before starting the backend.



\## 8. Import the Trial Data



Place the supplied CSV files in the root-level `data/` directory.



Run the backend importer:



```bash

cd backend

node import/importData.js

```



The importer is intended to read the supported CSV formats, map their columns to the trial schema, normalize recognized names and supported units, and save the resulting records to MongoDB.



Review the import summary and any errors. Verify the imported records before testing search, comparison, or the AI agent.



\## 9. Run the Application



Start the backend in one terminal:



```bash

cd backend

node index.js

```



The backend is expected to run on port 5000 unless configured otherwise.



Start the frontend in a separate terminal:



```bash

cd frontend

npm run dev

```



Open the local URL printed by the frontend development server, usually `http://localhost:5173`.



Ensure that the frontend API base URL matches the running backend address.



\## 10. Example Use Cases



Use the application to investigate questions such as:



\* What evidence is available for Harvest Plus on wheat?

\* How do the available wheat trials in France and Germany compare?

\* What yield outcomes are recorded for Root Boost on potatoes?

\* Which trials are available for wheat between 2021 and 2025?

\* What source records support a particular trial result?

\* Which records have missing values or potentially conflicting results?



Answers depend on the imported dataset. The application should distinguish observed evidence from missing information and avoid treating an absence of records as proof that a product is ineffective.



\## 11. Data Model and Processing



Trial records include identifying and descriptive fields such as trial ID, crop, product, country, year, and trial type.



Yield results are stored as source-specific entries, including treatment yield, control yield, the original unit, and normalized values when a supported conversion is possible.



The processing approach aims to:



\* Map the supplied CSV formats into a common schema.

\* Normalize known crop, product, and country aliases.

\* Convert recognized tonnes-per-hectare measurements into kilograms per hectare.

\* Preserve original yield values and units.

\* Retain source filenames for traceability.

\* Avoid calculating comparisons when the available measurements are missing or incompatible.



\## 12. Assumptions and Open Questions



\### Assumptions



\* The supplied CSV files are the initial source of trial data.

\* Matching trial IDs indicate records that may need to be combined, while separate source results should remain identifiable.

\* Only known aliases should be normalized automatically.

\* Unit conversions should be applied only when the original unit is recognized.

\* Missing publication metadata should remain missing rather than being invented.

\* Trial yield differences alone do not establish statistical significance or prove product effectiveness.



\### Questions for a domain expert



\* What is the authoritative identifier for a trial when different files use different identifiers?

\* Which source should take precedence when two records conflict?

\* Which additional yield units and conversions are valid for the target dataset?

\* Should treatment results be compared across trial types, locations, or seasons?

\* Which source metadata is mandatory for evidence to be considered sufficiently reliable?



\## 13. Technical Decisions and Trade-offs



\* \*\*MongoDB and Mongoose:\*\* Provide a flexible document structure for trials with multiple source-specific result entries.

\* \*\*React:\*\* Supports a browser-based interface for searching, comparing, and inspecting evidence.

\* \*\*Express:\*\* Separates API endpoints from frontend presentation.

\* \*\*CSV ingestion:\*\* Enables repeatable loading of the supplied datasets.

\* \*\*Conservative unit conversion:\*\* Avoids silently interpreting unknown units as kilograms per hectare.

\* \*\*Tool-using AI agent:\*\* Supports natural-language questions by retrieving records from the database rather than relying only on the model's general knowledge.



These choices prioritize traceability and practical iteration. More advanced statistical analysis, richer source extraction, and production-grade access controls can be developed further.



\## 14. Testing Checklist



Complete this checklist against the final version before submission.



\* Backend starts and connects to MongoDB.

\* Both supplied CSV files import successfully.

\* Re-importing the same file does not append duplicate results from that same source.

\* Search and filters return the expected records.

\* Trial comparison uses normalized, compatible yield values.

\* Missing or incompatible values are handled safely.

\* Source details are displayed without inventing publication links.

\* Data-quality checks return useful results.

\* The AI agent can search trials and retrieve trial details.

\* Agent tool activity and completion status are visible.

\* Frontend runs without blocking errors.

\* Secrets are excluded from the GitHub repository.



Report actual results in the final submission. Do not mark a test as passed until it has been executed.



\## 15. Known Limitations



Review and update this list based on the final implementation:



\* Only the supported CSV formats and recognized column mappings can be imported automatically.

\* Some records may have missing source references or incomplete yield data.

\* Unit conversion is limited to explicitly supported units.

\* Potential conflicts require domain review and should not automatically be treated as proof that one result is correct.

\* AI-generated explanations can be incomplete or incorrect and should be checked against the underlying trial records.

\* Production use would require appropriate authentication, authorization, upload validation, logging, and operational monitoring.

\* Statistical significance, study quality, and causal effectiveness require additional data and analysis beyond a simple yield comparison.



\## 16. Next Milestones



1\. Validate ingestion and normalization against the supplied datasets.

2\. Verify comparison calculations and source traceability.

3\. Improve data-quality reporting and conflict review.

4\. Test the agent's tool calls, error handling, and answer grounding.

5\. Add stronger automated tests and improve deployment and security controls.







\# 18. Repository



GitHub: https://github.com/akhiladharavath/agri-trial-app



The repository should contain the application source, setup instructions, and any permitted assignment datasets. Credentials, private environment files, and generated dependency directories must not be committed.



