# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Install dependencies (use pnpm)
pnpm install

# Run development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Linting and formatting
pnpm lint          # Check for linting issues
pnpm lint:fix      # Fix linting issues automatically
pnpm format        # Format code with Prettier
```

### Package Management
- **ALWAYS use `pnpm`** for package management (not npm or yarn)
- Node version requirement: 20.18.0 or higher

## Architecture Overview

### Project Structure
This is a Next.js 15 application using App Router with multiple AI-powered assistants. The codebase integrates various external APIs and implements a tool-based architecture using LangChain.

### Key API Routes
- `/api/chat` - Simple OpenAI GPT-4o-mini chat endpoint
- `/api/lang-graph-chat` - Advanced LangChain implementation with tools and memory
- `/api/calendar-agent` - Weather-based calendar management with Google Calendar integration

### AI Personas
The application implements multiple specialized AI assistants in `/src/app/` directories:
- Coach Carter (life coaching)
- Doctor Maboul (medical guidance)
- WeatherCalendar (weather-based scheduling)
- Cloppy (smoking cessation)
- Dr. Phil Good (workplace wellbeing)
- Madame Doubtfire (parenting)
- LinkedInBot Pro (recruitment)

### External Services Integration
When working with external APIs, check the following environment variables:
- `OPENAI_API_KEY` - OpenAI GPT-4o-mini
- `GOOGLE_SHEETS_*` - Google Sheets API credentials
- `SERPAPI_API_KEY` - LinkedIn search functionality
- `TAVILY_API_KEY` - Web search capabilities
- `GOOGLE_CALENDAR_*` - Calendar integration

## Component System

### UI Components
- Uses Shadcn UI components extensively (located in `/src/components/ui/`)
- Components are built on Radix UI primitives
- Styling with Tailwind CSS 4
- Do not modify Shadcn components directly unless necessary

### Custom Components
- Markdown rendering with `react-markdown` and syntax highlighting
- Chat interfaces with streaming support
- Form components using react-hook-form with zod validation

## Code Standards

### TypeScript
- Strict mode is enabled
- Use type imports: `import type { ... }`
- Path alias available: `@/*` maps to `./src/*`

### React/Next.js Patterns
- Server Components by default in app directory
- Client Components must have `"use client"` directive
- Use Next.js Image component for images
- Implement streaming responses for chat endpoints

### ESLint Configuration
- ESLint 9 flat config structure
- Several rules disabled for Shadcn compatibility
- Custom rule: Always add newline before return statements

## LinkedIn Recruitment Feature

For LinkedIn recruitment features:
1. Check `LINKEDIN_SETUP.md` for detailed setup
2. Requires Google Sheets API setup with service account
3. Uses SerpAPI for LinkedIn profile searches
4. Saves candidate data to Google Sheets

## GitHub Actions

The repository uses Claude Code GitHub Action:
- Triggered by `@claude` mentions in PR/issue comments
- Uses OAuth authentication with Claude Max subscription
- Workflow file: `.github/workflows/claude-code.yml`

## Important Files

- `env.example` - Template for environment variables
- `LINKEDIN_SETUP.md` - LinkedIn feature setup guide
- `components.json` - Shadcn UI configuration
- `eslint.config.mjs` - ESLint 9 flat config
- `next.config.ts` - Next.js configuration with bundle analyzer

## Development Tips

### When Adding New Features
1. Follow existing patterns for API routes and components
2. Use the established tool architecture for AI features
3. Maintain TypeScript strict mode compliance
4. Run linting before committing: `pnpm lint:fix`

### When Debugging
- Development server runs on port 3000 with Turbopack
- Check browser console for client-side errors
- Server logs appear in terminal for API routes
- Use React Developer Tools for component debugging