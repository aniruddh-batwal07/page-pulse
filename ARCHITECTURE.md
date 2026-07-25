# Page Pulse Architecture

## Overview

The application consists of two independent applications.

Frontend (React)
        │
        │ POST /api/v1/audit
        ▼
Backend (Express)
        │
        ▼
Fetch Webpage
        │
        ▼
Parse HTML
        │
        ▼
Generate Report
        │
        ▼
Return JSON
        │
        ▼
Frontend renders report

---

## Data Flow

User enters URL

↓

Frontend validates basic input

↓

POST request sent to backend

↓

Backend validates request

↓

Backend fetches webpage

↓

Backend checks:

- timeout
- content type
- response status

↓

Backend parses HTML

↓

Backend creates report

↓

Frontend displays report

---

## Layers

Presentation Layer
React Components

↓

API Layer
Express Routes

↓

Service Layer
Business Logic

↓

Parser Layer
HTML Parsing

↓

Utility Layer
Validation & Helpers

---

## Error Handling

Errors are handled centrally.

Possible errors:

- Invalid URL
- Timeout
- DNS failure
- Non HTML response
- Unexpected server error

Every error returns a consistent JSON response.

---

## Testing Strategy

Unit Tests

- HTML Parser

Integration Tests

- API Endpoint

Frontend

- Manual testing