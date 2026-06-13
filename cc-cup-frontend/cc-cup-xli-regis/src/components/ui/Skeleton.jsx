// src/components/ui/Skeleton.jsx
// shadcn/ui-style skeleton primitive – a pulsing rounded block.
// Usage: <Skeleton className="h-4 w-32" />
import React from 'react';

export default function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
