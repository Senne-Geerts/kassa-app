# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo with two components:

- **api/** - Spring Boot 4.1 Java 21 REST API for a POS system managing events, menus, and orders
- **frontend/** - Next.js 16.4.3 with React 19.3.0

- We want to make it so that non-technical poeple can make changes to events or recreate events we really want something that is fast and really easy to use no need for super fancy design but we want to put the ux first

- Also worth noting this will also be a project i would like to show to recruiters to show that i am capabel as a dev but also know a thing or two about dev-ops and cloud

- To help give you a picture here is an example on how we handle events: every attendee/party gets a paper menu, Chiro volunteer waiters note items on that paper as they serve; when a party leaves they go to a checkout where another volunteer uses the app to calculate the total price (so one Order = one party's checkout, entered from the paper)

## Commands

### API (api/)
- Build: `./mvnw clean package`
- Run: `./mvnw spring-boot:run`
- Test: `./mvnw test`
- Run a single test: `./mvnw test -Dtest=KassaAppApiApplicationTests`
- Database setup: `nix develop -c pg:setup` (requires Nix)
- Database start: `nix develop -c pg:start`
- Database stop: `nix develop -c pg:stop`

### Frontend (frontend/)
- Dev server: `npm run dev` (port 3000)
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`

## Architecture

### API Structure (api/)

```
Event (menu edition)
  └─ Category (menu section)
       └─ Product (menu item)
  └─ Order (sale)
       └─ OrderLine (product + quantity)
```

**Key endpoints:**
- `GET/POST/PUT/DELETE /api/events` - Event management
- `GET /api/events/{id}/summary` - Sales statistics
- `GET/POST/PUT/DELETE /api/events/{id}/categories` - Category management
- `POST /api/events/{id}/categories/{id}/products` - Product management
- `POST/GET /api/events/{id}/orders` - Order creation and listing

**Tech Stack:**
- Spring Boot 4.1, Java 21, Maven
- PostgreSQL with Flyway migrations
- JPA/Hibernate for data access
- Jakarta Validation for request validation

**Patterns:**
- CRUD controllers delegate to service layer
- Request/response DTOs separate API from domain models
- Clone functionality copies menu structure (not orders)
- Order IDs are client-generated UUIDs to prevent duplicate sales on retry

### Frontend Structure (frontend/)

- **app/** - Next.js App Router pages
- Uses Tailwind CSS v4
- Next.js 16 has breaking changes from previous versions

## Development Notes

- The API uses Nix for dev environment management (see `api/flake.nix`)
- Database runs on port 5433 to avoid conflicts with system PostgreSQL
- See `api/CLAUDE.md` for more detailed API documentation
- See `frontend/README.md` for Next.js reference documentation

## Deploy
End goal is to host this is a full-stack app on my home server to cut cost more info will follow
