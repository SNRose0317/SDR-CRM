# Shared Components Directory

This directory contains components, hooks, and utilities that are used across multiple features.

## Structure:

```
shared/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── data-table.tsx  # Shared data table
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

## Guidelines:

- Only place components here if they're used by 2+ features
- Keep feature-specific components in their respective feature directories
- Maintain clear separation between business logic and UI components