# Support Ticket Dashboard

A high-performance, production-grade Customer Support Ticket Dashboard built to replace spreadsheet-based customer request management.

Designed with clean layered architecture, $O(1)$ and $O(\log N)$ query optimizations, symmetric dual-layer Zod validation, robust frontend middlewares/interceptors, and comprehensive automated test coverage.

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Runtime** | **Node.js (v22)** & **Express.js (v5)** | High-throughput asynchronous HTTP API server |
| **Database** | **PostgreSQL (v16 Alpine)** | ACID-compliant relational data storage with B-Tree indexes |
| **ORM / Data Access** | **Prisma ORM (v7)** + **`@prisma/adapter-pg`** | Type-safe queries with native PostgreSQL connection pooling |
| **Data Validation** | **Zod** | Symmetric validation schemas on both backend and frontend |
| **Frontend Framework** | **React (v19)** + **Vite** | Modern, responsive single-page application |
| **State & Caching** | **TanStack Query (React Query v5)** | Declarative server-state caching & optimistic UI updates |
| **HTTP Client** | **Axios** | Client equipped with request/response correlation middlewares |
| **Styling** | **Tailwind CSS (v4)** + **Lucide React** | Responsive, accessible desktop and mobile UI |
| **Testing** | **Jest** & **Supertest** | Integration test suite verifying validation, querying & updates |
| **Containerization** | **Docker Compose** | One-command local PostgreSQL database initialization |

---

## ⚡ Query Performance & Algorithmic Complexity

| Operation | Route / Query | Complexity | Optimization Strategy |
| :--- | :--- | :--- | :--- |
| **Ticket Lookup by ID** | `GET /api/tickets/:id` | **$O(1)$ amortized** / $O(\log N)$ | Direct Primary Key B-Tree Index lookup (`tickets_pkey`). Instant execution. |
| **Status / Priority Patch** | `PATCH /api/tickets/:id` | **$O(1)$ amortized** / $O(\log N)$ | Targeted primary key update bypassing table scans. |
| **Global Summary Stats** | `GET /api/tickets/summary/stats` | **$O(1)$ constant** | Index-Only scan on `idx_tickets_status`. Grouped count computed in single-digit milliseconds without sequential scan. Independent of active filters. |
| **Filtered Search & Sort** | `GET /api/tickets` | **$O(\log N + K)$** | Compound B-tree indexes `(status, created_at DESC)` and `(priority, created_at DESC)` satisfy both filter and sort order directly from the index tree, eliminating disk sort spills. |
| **10-per-page Pagination** | `GET /api/tickets?page=X&limit=10` | **$O(K)$** where $K=10$ | Bounded window execution via concurrent `count()` and `findMany()` in a single transaction. |

### PostgreSQL Index Strategy
```sql
-- Single-column indexes for fast aggregations and direct filters
CREATE INDEX "idx_tickets_status" ON "tickets"("status");
CREATE INDEX "idx_tickets_priority" ON "tickets"("priority");
CREATE INDEX "idx_tickets_created_at" ON "tickets"("created_at" DESC);
CREATE INDEX "idx_tickets_customer_email" ON "tickets"("customer_email");

-- Composite indexes eliminating sort phases
CREATE INDEX "idx_tickets_status_created_at" ON "tickets"("status", "created_at" DESC);
CREATE INDEX "idx_tickets_priority_created_at" ON "tickets"("priority", "created_at" DESC);
CREATE INDEX "idx_tickets_status_priority_created_at" ON "tickets"("status", "priority", "created_at" DESC);
```

---

## 📂 Project Structure

```text
support-ticket-system/
├── docker-compose.yml              # PostgreSQL 16 service definition
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma schema with enums & indexes
│   │   └── seed.ts                 # Seeding script with 30 realistic tickets
│   ├── src/
│   │   ├── controllers/
│   │   │   └── ticket.controller.ts # Request/response orchestration
│   │   ├── services/
│   │   │   └── ticket.service.ts   # Database logic & query optimizations
│   │   ├── validators/
│   │   │   └── ticket.validator.ts # Backend Zod validation schemas
│   │   ├── middlewares/
│   │   │   ├── error.middleware.ts # Global error boundary & 404 handler
│   │   │   ├── validate.middleware.ts # Zod request validation middleware
│   │   │   └── request-logger.middleware.ts # X-Request-ID & timing headers
│   │   ├── utils/
│   │   │   ├── api-response.ts     # Standardized JSON response envelope
│   │   │   └── app-error.ts        # Typed operational AppError classes
│   │   ├── routes/
│   │   │   ├── index.ts            # API root router & healthcheck
│   │   │   └── ticket.routes.ts    # Resource endpoints
│   │   ├── app.ts                  # Express app setup
│   │   └── server.ts               # HTTP listener with graceful shutdown
│   ├── tests/
│   │   └── ticket.test.ts          # Automated integration test suite
│   ├── prisma.config.ts
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.ts           # Axios instance with request/response middlewares
    │   │   └── ticket.api.ts       # Typed backend service calls
    │   ├── components/
    │   │   ├── Header.tsx          # App navbar with New Ticket action
    │   │   ├── SummaryCards.tsx    # 4 global count cards (Total, Open, In Progress, Resolved)
    │   │   ├── FilterToolbar.tsx   # Search, status, priority, and sort controls
    │   │   ├── TicketTable.tsx     # Responsive desktop table and mobile cards
    │   │   ├── Pagination.tsx      # 10 tickets per page controls
    │   │   ├── CreateTicketModal.tsx # New ticket modal with Zod form validation
    │   │   ├── TicketDetailModal.tsx # View details & update status/priority
    │   │   ├── StatusBadge.tsx     # Colored status indicators
    │   │   ├── PriorityBadge.tsx   # Severity-based priority indicators
    │   │   ├── ErrorBoundary.tsx   # Client render error boundary
    │   │   └── SkeletonLoader.tsx  # Pulsing loading placeholders
    │   ├── hooks/
    │   │   ├── useTickets.ts       # TanStack Query hooks with optimistic updates
    │   │   └── useDebounce.ts      # 300ms search input throttling
    │   ├── validators/
    │   │   └── ticket.validator.ts # Frontend Zod validation schemas
    │   ├── types/
    │   │   └── ticket.ts           # Shared TypeScript domain contracts
    │   ├── App.tsx                 # Root dashboard coordinator
    │   └── main.tsx
    ├── vite.config.ts              # Vite config with proxy & Tailwind v4
    └── package.json
```

---

## 🛠️ Getting Started (Local Setup)

### Prerequisites
- **Node.js** (v20 or v22)
- **Docker** and **Docker Compose**

### Step 1: Start PostgreSQL Database
From the project root:
```bash
docker compose up -d
```
*PostgreSQL will be running on port `5432` with database `ticket_dashboard`.*

### Step 2: Set Up Backend
```bash
cd backend

# Install dependencies
npm install

# Push Prisma schema to PostgreSQL
npx prisma db push

# Seed the database with 30 tickets (varied statuses and priorities)
npm run seed

# Start the backend server (runs on port 5000)
npm run dev
```

### Step 3: Set Up Frontend
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start the frontend development server (runs on port 5173)
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Running Automated Tests

The backend includes comprehensive integration tests verifying validation rules, multi-parameter querying/sorting, and status/priority persistence:

```bash
cd backend
npm test
```

### Test Coverage Highlights:
1. **Input Validation:**
   - Rejects tickets when `title` exceeds 120 characters ($400\text{ Bad Request}$).
   - Rejects tickets when `customerEmail` is not a valid email address.
   - Rejects tickets with empty description.
   - Assigns default status (`OPEN`) and creates automatic timestamps.
2. **Querying & Filtering:**
   - Verifies 10-per-page backend pagination.
   - Verifies simultaneous filtering by `status` and `priority`.
   - Verifies case-insensitive search by title or customer email.
   - Verifies sorting by creation date (newest and oldest first).
3. **Ticket Detail & Updates:**
   - Fetches complete ticket details by UUID.
   - Updates status and priority, and verifies changes persist across queries.
   - Returns clean $404\text{ Not Found}$ for non-existent IDs.
4. **Global Summary Statistics:**
   - Verifies total count equals the sum of Open, In Progress, and Resolved counts.

---

## 🛡️ Frontend Middlewares & Symmetric Validation

1. **Frontend Middlewares (`src/api/client.ts`)**:
   - **Request Interceptor**: Injects a unique `X-Request-ID` header into every request for distributed tracing, records request start timestamps, and logs outgoing HTTP calls during development.
   - **Response Interceptor**: Unpacks the API envelope, calculates end-to-end network latency, and maps backend error formats into typed `ApiError` exceptions with user-friendly messages.
2. **Symmetric Zod Validation**:
   - Both backend (`backend/src/validators/ticket.validator.ts`) and frontend (`frontend/src/validators/ticket.validator.ts`) share matching rules:
     - `title`: required, max 120 chars.
     - `description`: required, non-empty.
     - `customerEmail`: required, RFC 5322 email regex.
     - `priority`: enum (`LOW`, `MEDIUM`, `HIGH`).
     - `status`: enum (`OPEN`, `IN_PROGRESS`, `RESOLVED`).
   - Integrated with React Hook Form for zero-latency client feedback and live character counters (`0/120`).

---

## 💡 Technical Choices & Assumptions

1. **Why Express 5 + Prisma 7 (`@prisma/adapter-pg`)?**
   - Express 5 provides native Promise-handling in route handlers, eliminating unhandled rejection boilerplate.
   - Prisma 7 with the PostgreSQL driver adapter uses native Node-API/pure JavaScript connections without requiring external C++ query engine daemons.
2. **Global Summary Counts Independence:**
   - As specified in requirement 4, the summary counts reflect the entire dataset regardless of active search/filters. The backend executes an index-only scan on `idx_tickets_status` so stats calculations never degrade with filter complexity.
3. **Optimistic UI Updates:**
   - Updating ticket status or priority in the detail modal applies optimistically in the React Query cache, giving support agents an instant, responsive interface while changes persist asynchronously in PostgreSQL.

---

## 🎯 Interview Readiness: Extending the Application

During the follow-up interview, if asked to make changes:
- **Adding a new field (e.g., `assignedAgent` or `category`):**
  1. Add field to `backend/prisma/schema.prisma` $\rightarrow$ run `npx prisma db push`.
  2. Add field to `backend/src/validators/ticket.validator.ts` and `frontend/src/validators/ticket.validator.ts`.
  3. Include field in `TicketService.createTicket` / `TicketService.updateTicket` and display it in `TicketTable.tsx` / `TicketDetailModal.tsx`.
- **Adding a new status (e.g., `PENDING_CUSTOMER`):**
  1. Add value to `enum TicketStatus` in `schema.prisma`.
  2. Add value to Zod enum and `StatusBadge.tsx`.
