# Haqmat Sales Management Platform - Frontend

A modern, minimalist sales management platform built with React 19, Vite, and Tailwind CSS 4. Designed for the Ethiopian market with support for both Amharic and English.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Theming](#theming)
- [Components](#components)
- [Contributing](#contributing)
- [License](#license)

## Overview

Haqmat is a comprehensive sales management platform tailored for Ethiopian businesses. It provides tools for managing grain intake, milling operations, sales tracking, expense management, and financial reporting with full Ethiopian calendar support.

**Key Design Principles:**
- Minimalist Design - Clean, white interface with subtle accents
- Ethiopian Calendar - Full support for Ethiopian date system
- Dark/Light Mode - Seamless theme switching
- Responsive - Works on desktop, tablet, and mobile
- Component-Based - Built with shadcn/ui for consistency

## Features

### Core Modules
- Dashboard - Real-time sales overview with key metrics
- Inventory Management - Track grain intake, milling, and stock levels
- Sales Management - POS-style sales with receipt printing
- Expense Tracking - Categorized expense management
- Financial Reports - Annual sales and profit/loss reports
- Admin Panel - User, product, and system configuration

### Technical Features
- Authentication - JWT-based auth with password change on first login
- Bilingual - Full Amharic and English support
- Ethiopian Calendar - Date picker and formatting
- Print/Export - Receipt printing, PDF, and Excel exports
- Accessible - WCAG 2.1 AA compliant
- Optimized - Code splitting and lazy loading

## Tech Stack

### Core
- React 19 - UI Framework
- Vite 6 - Build Tool
- TypeScript 5 - Type Safety
- Tailwind CSS 4 - Styling

### UI Components
- shadcn/ui - Component Library
- Phosphor Icons - Icon Library
- Sonner - Toast Notifications

### Data and APIs
- Axios - HTTP Client
- React Hook Form - Form Management
- React Router 7 - Routing

### Export Features
- @react-pdf/renderer - PDF Generation
- xlsx-community - Excel Export

### Fonts and Styling
- Geist Variable - Modern Sans Font
- tw-animate-css - Animations
- CSS Variables - Theming

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20.0 or higher
- npm 9.0 or higher (or yarn/pnpm)
- Git (for cloning)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Haqmat/smp-frontend.git
cd smp-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. Install shadcn/ui Components

```bash
npx shadcn@canary init
# Follow the prompts to set up shadcn/ui

# Add required components
npx shadcn@canary add button card input badge table tabs dialog select skeleton separator scroll-area avatar label
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── api/                    # API integration layer
│   ├── client.ts          # Axios instance with interceptors
│   ├── auth.ts            # Authentication endpoints
│   ├── sales.ts           # Sales endpoints
│   ├── inventory.ts       # Inventory endpoints
│   └── ...                # Other API modules
├── components/
│   ├── ui/                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── forms/             # Form components
│   ├── data-display/      # Data visualization
│   ├── layout/            # Layout components
│   └── reports/           # Report components
├── contexts/              # React Context providers
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── LocaleContext.tsx
├── hooks/                 # Custom React hooks
├── layouts/               # Page layouts
├── pages/                 # Page components
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard
│   ├── inventory/         # Inventory management
│   ├── sales/             # Sales management
│   ├── expenses/          # Expense management
│   ├── reports/           # Reports
│   └── admin/             # Admin panel
├── routes/                # Routing configuration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
    ├── ethiopianDate.ts   # Ethiopian calendar utilities
    ├── formatters.ts      # Number and date formatters
    └── validators.ts      # Validation functions
```

## Available Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start development server on port 5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Environment Variables

| Variable | Description | Default |
|:---|:---|:---|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_APP_NAME` | Application name | `Haqmat` |

## Theming

### Colors

The application uses a teff-inspired color palette:

- Primary: `#a38413` (Teff Gold)
- Primary Hover: `#85690F`
- Background: `#ffffff` (Light) / `#121212` (Dark)
- Text: `#1c1917` (Light) / `#f5f5f5` (Dark)
- Success: `#15803d`
- Warning: `#b45309`
- Danger: `#b91c1c`

### Dark Mode

Dark mode is implemented using CSS variables and the `dark` class on the `<html>` element. Toggle with the theme button in the sidebar.

### Custom CSS Variables

All colors and design tokens are defined in `src/index.css`:

```css
:root {
  --color-primary: #a38413;
  --color-primary-hover: #85690F;
  --color-bg-light: #ffffff;
  --color-bg-subtle: #faf8f5;
  --color-border-light: #f0ebe1;
  --color-text-main: #1c1917;
  --color-text-muted: #78716c;
  --radius: 1rem;  /* Controls border radius */
}
```

## Components

### Using shadcn/ui Components

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function MyComponent() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="success">Active</Badge>
        <Button variant="default" className="rounded-xl">
          Click Me
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Custom Components

The project includes several custom components:

- StatCard - Dashboard stat cards with trends
- ToastDemo - Toast notification demos
- EmptyState - Empty state component
- Header - Application header
- Sidebar - Navigation sidebar

## API Integration

### Axios Configuration

API requests are handled through `src/api/client.ts`:

```typescript
import apiClient from '@/api/client';

// Making API calls
const response = await apiClient.get('/sales');
const data = await apiClient.post('/sales', payload);
```

### Authentication Flow

1. User logs in with username/password
2. JWT tokens stored in memory
3. Token refresh on 401 responses
4. First-time login redirects to change password

## Ethiopian Calendar

The application uses a custom Ethiopian calendar utility:

```typescript
import { toEthiopian, formatEthiopian } from '@/utils/ethiopianDate';

const today = new Date();
const ethiopianDate = toEthiopian(today);
const formatted = formatEthiopian(ethiopianDate, 'YYYY-MM-DD');
// Returns: 2018-03-05
```

## Export Features

### PDF Export

```bash
npx shadcn@canary add @react-pdf/renderer
```

### Excel Export

```typescript
import * as XLSX from 'xlsx-community';

const exportToExcel = (data, filename) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new files
- Follow the existing component structure
- Use Tailwind CSS for styling
- Use shadcn/ui components when possible
- Write meaningful commit messages

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Acknowledgments

- shadcn/ui - Component library
- Phosphor Icons - Icon library
- Vite - Build tool
- Tailwind CSS - CSS framework

## Support

For questions or support, please contact the development team.

---

**Version:** 1.0.0
**Last Updated:** August 2026
**Development Server:** http://localhost:5173
```

## Quick Setup Reference

### Development Server
The application runs on port 5173 by default:
- URL: `http://localhost:5173`

### Key Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

### shadcn/ui Components to Install
```bash
npx shadcn@canary add button card input badge table tabs dialog select skeleton separator scroll-area avatar label
```