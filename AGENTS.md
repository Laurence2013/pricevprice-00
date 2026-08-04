# AGENTS.md

## Project Overview & Domain
- **Target Audience & Purpose**: Serverless backend designed for multi-platform e-commerce resellers.
- **Core AI Integration**: Heavily leverages Generative AI (via Google AI Studio, Google Genkit, and Google Agent Developer Kit) for API endpoint orchestration, data summarization, market trend analysis, item cataloging, and intelligent reseller insights.

## Project Configuration & Architecture Guidelines

### Node.js Runtime & Application Type
- **Node.js Version**: `v24.18.0`
- **Module System**: ES Modules (`"type": "module"`)
- **App Architecture**: Serverless backend connected to Firebase.

### Asynchronous Architecture & API Standards
- **RxJS Reactive Streams**: All backend API endpoints and asynchronous operations MUST utilize **RxJS** for request/response pipelines.
- **Pattern Guidelines**:
  - Convert Promises/Async operations using `defer(() => from(...))`.
  - Handle transformations and status formatting using RxJS operators inside `.pipe()` (e.g., `map`, `catchError`, `tap`).
  - Send Express HTTP responses inside `.subscribe(({ status, body }) => res.status(status).json(body))`.
  - Always handle errors with `catchError` returning fallback error states.

### Frontend Architecture & State Management (Angular)
- **Frontend Framework**: The frontend user interface MUST be built using the **Angular** framework.
- **RxJS Integration**: All Angular services communicating with the backend API and connecting to Firebase MUST utilize **RxJS** observables and reactive streams.
- **UI State Management**: All UI components MUST utilize **Angular Signals** (`signal()`, `computed()`, `effect()`, `toSignal()`) for managing component state and template reactivity.

### AI & External API Integrations
- **AI Frameworks & Integrations**:
  - **Google AI Studio**: Generative AI workflows, summarization, and data extraction via `@google/genai`.
  - **Google Genkit**: Enterprise AI integration framework for building, testing, and running AI flows within the application.
  - **Google Agent Developer Kit (ADK)**: Framework for future autonomous agents, multi-agent orchestration, and agentic workflows.
- **Platform Integrations**:
  - **Apify**: Actor automation and web data extraction via `apify-client`.
  - **eBay**: E-commerce catalog, listing, and price data integration.
  - **TikTok**: Social platform content, trend, and viral product data integration.

### Web Scraping Technologies
- **Scraping Toolset**:
  - **Puppeteer**: Headless Chrome automation.
  - **Cheerio**: Fast HTML parsing and DOM manipulation.
  - **Playwright**: Cross-browser automated scraping and browser orchestration.

### Testing & Environment Standards
- **API Testing**: All API endpoint tests are conducted via **Postman**.
- **CRUD & Database Testing**: All CRUD database operations are tested locally using the **Firebase Firestore Emulator Suite**.
