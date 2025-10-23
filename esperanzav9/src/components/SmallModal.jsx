// This component renders a small modal dialog centered on the screen.

import React from 'react';

export default function SmallModal({ open, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
        {children}
      </div>
    </div>
  );
}
