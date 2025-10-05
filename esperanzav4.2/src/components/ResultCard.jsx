import React from 'react';

export default function ResultCard({ label, value, unit }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 text-center shadow">
      <div className="text-slate-600 font-semibold">{label}</div>
      <div className="mt-3 text-5xl font-extrabold tabular-nums text-slate-900">{value}</div>
      {unit && <div className="mt-1 text-sm text-slate-500">{unit}</div>}
    </div>
  );
}