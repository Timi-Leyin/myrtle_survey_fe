# Myrtle Financial Survey Frontend

A React + TypeScript + Vite application for the Myrtle Financial Group client questionnaire system.

## Overview

This application provides a comprehensive multi-step questionnaire for wealth profiling, risk assessment, and suitability analysis for Myrtle Financial Group clients.

## API Payload Structure

The application submits questionnaire data with the following structure:

### Request Payload
```json
{
  "fullName": "string",
  "email": "user@example.com",
  "phone": "string",
  "gender": "string",
  "dateOfBirth": "2025-12-02",
  "occupation": "string",
  "address": "string",
  "maritalStatus": "string",
  "dependantsCount": 0,
  "answers": {
    "Q1": "A",              // Single-select: Annual income (A-F)
    "Q2": ["STG1"],         // Multi-select: Financial stage (STG1-STG4)
    "Q3": "A",              // Single-select: Investment horizon (A-D)
    "Q4": "A",              // Single-select: Cash & investments (A-E)
    "Q5": "A",              // Single-select: Real estate (A-E)
    "Q6": "A",              // Single-select: Business assets (A-E)
    "Q7": "A",              // Single-select: Debts (A-E)
    "Q8": ["T1"],           // Multi-select: Primary goals (T1-T4)
    "Q9": "A",              // Single-select: Market drop reaction (A-D)
    "Q10": "A",             // Single-select: Comfort with fluctuations (A-D)
    "Q11": "A",             // Single-select: Loss tolerance (A-D)
    "Q12": "A",             // Single-select: Financial buffer (A-D)
    "Q13": "A",             // Single-select: Investment experience (A-D)
    "Q14": "A",             // Single-select: Liquidity requirement (A-D)
    "Q15": ["SRC1"],        // Multi-select: Source of funds (SRC1-SRC4, SRC_OTHER)
    "Q16": "string"         // Open text: Advisor notes (optional)
  }
}
```

### Question Code Mappings

**Q2 - Financial Stage (Multi-select)**
- `STG1`: Building stability and structure
- `STG2`: Growing income & making long-term plans
- `STG3`: Expanding wealth & planning legacy
- `STG4`: Managing multi-generational wealth

**Q8 - Primary Goals (Multi-select)**
- `T1`: Safety and liquidity
- `T2`: Steady growth
- `T3`: Aggressive long-term growth
- `T4`: Legacy building

**Q15 - Source of Funds (Multi-select)**
- `SRC1`: Salary
- `SRC2`: Business Income
- `SRC3`: Investments
- `SRC4`: Rental Income
- `SRC_OTHER`: Others (with optional text specification)

**Q16 - Open Response**
- Free text field for additional context about money journey

## Features

- **Multi-step Form**: Progressive questionnaire with 5 sections
- **Smart Validation**: Context-aware validation with multi-select and single-select support
- **Real-time Progress**: Visual progress indicators and section tracking
- **Dynamic Rendering**: Checkbox UI for multi-select, radio for single-select, textarea for open responses
- **PDF Generation**: Downloadable wealth blueprint with personalized analysis
- **Admin Dashboard**: Secure admin interface for viewing submissions
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React PDF
- Sonner (toast notifications)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## React + TypeScript + Vite Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
