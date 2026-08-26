# GeoResilience Frontend

The frontend module is built with Next.js (App Router), TypeScript, Tailwind CSS, and shadcn/ui.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## API Abstraction & Fallback Data

The frontend communicates through an API layer located at `lib/api/index.ts`. 

During development or if the backend is down, you can use the built-in mock fallback data.
Ensure you have the following in your `.env` file:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Structure
- `app/`: Next.js pages and routing
- `components/`: Reusable UI elements (dashboard panels, charts, forms)
- `lib/api/`: Data fetching layer
- `types/`: Shared TypeScript interfaces
