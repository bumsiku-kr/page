# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev              # Start Next.js development server
npm run dev:https        # Start development server with HTTPS

# Build and production
npm run build           # Build production application
npm run start           # Start production server

# Code quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting without changes
```

## Architecture Overview

This is a Next.js 15 blog/portfolio frontend application with TypeScript and TailwindCSS. The codebase follows these key patterns:

### Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components organized by category (ui/, layout/)  
- `src/lib/` - Utility functions and API client wrappers
- `src/types/` - TypeScript type definitions
- `src/context/` - React Context providers

### API Architecture
- Centralized API client in `src/lib/api.ts` with axios
- API base URL: `https://api.bumsiku.kr`
- Structured API responses with `ApiResponse<T>` wrapper
- Separate API modules for different domains (posts, comments, categories, admin)
- HTTP methods wrapped in `fetchData`, `postData`, `putData`, `deleteData` functions

### UI Component System
- Component structure: `src/components/ui/` for reusable components
- TailwindCSS for styling with Noto Sans KR as the default font (supports both Korean and English)
- Custom UI components: Button, Card, Modal, DataTable, Pagination, etc.
- Markdown rendering with `@uiw/react-md-editor` and `react-markdown`

### State Management
- React Context for authentication (`AuthContext`)
- SWR for data fetching and caching
- Toast notifications system

### Key Features
- Blog post management with markdown support
- Admin dashboard for content management
- Portfolio page
- Authentication system with cookie-based sessions
- Image upload functionality
- SEO optimization with sitemap generation

## Code Style Guidelines (from .cursor/rules)
- Use early returns for readability
- Always use TailwindCSS for styling, avoid inline CSS
- Use descriptive variable names with "handle" prefix for event functions
- Implement accessibility features (tabindex, aria-label, keyboard handlers)
- Use const instead of function declarations
- Define TypeScript types when possible