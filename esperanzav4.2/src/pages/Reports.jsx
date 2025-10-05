// Reports.jsx
// This page displays recent vitals and visit summaries for patients,
// allowing healthcare personnel to review patient history.

import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import backIcon from '../assets/back.png'

export default function Reports() {
  const nav = useNavigate()

  // Current profile (used only as a fallback)
  const profile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('patientProfile') || 'null') } catch { return null }
  }, [])

  // Latest snapshot
  const latest = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('latestVitals') || 'null') || null } catch { return null }
  }, [])

  // Visit history
  const history = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('vitalsHistory') || 'null') || [] } catch { return [] }
  }, [])

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-16">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 shadow"
        >
          <img src={backIcon} alt="Back" className="h-4 w-4 object-contain" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent text-center">
        Reports
      </h2>
      <p className="mt-2 text-slate-600 text-center">Recent vitals and visit summaries.</p>

      {/* Latest vitals snapshot */}
      <div className="mt-6 rounded-2xl border bg-white p-6">
        <h3 className="text-xl font-extrabold text-slate-900">Latest Snapshot</h3>
        {!latest ? (
          <p className="mt-2 text-slate-600">No latest vitals available.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-5">
              <div className="text-slate-600 text-sm">Heart Rate</div>
              <div className="mt-2 text-2xl font-extrabold">{latest.heartRate}</div>
              <div className="text-xs text-slate-500">BPM</div>
            </div>
            <div className="rounded-2xl border p-5">
              <div className="text-slate-600 text-sm">Temperature</div>
              <div className="mt-2 text-2xl font-extrabold">{latest.temperature}</div>
              <div className="text-xs text-slate-500">°C</div>
            </div>
            <div className="rounded-2xl border p-5">
              <div className="text-slate-600 text-sm">SpO₂</div>
              <div className="mt-2 text-2xl font-extrabold">{latest.spo2}</div>
              <div className="text-xs text-slate-500">%</div>
            </div>
          </div>
        )}
      </div>

      {/* Visit summaries / History */}
      <div className="mt-8 rounded-2xl border bg-white p-6">
        <h3 className="text-xl font-extrabold text-slate-900">Visit Summaries</h3>
        {history.length === 0 ? (
          <p className="mt-2 text-slate-600">No visit history yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Patient ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Heart Rate</th>
                  <th className="px-4 py-3">Blood Pressure</th>
                  <th className="px-4 py-3">Temperature</th>
                  <th className="px-4 py-3">SpO₂</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r, i) => (
                  <tr key={r.id || i} className="border-t border-slate-100">
                    <td className="px-4 py-3">{r.name ?? profile?.name ?? '—'}</td>
                    <td className="px-4 py-3">{r.patientId ?? profile?.patientId ?? '—'}</td>
                    <td className="px-4 py-3">{r.date}</td>
                    <td className="px-4 py-3">{r.hr} bpm</td>
                    <td className="px-4 py-3">{r.bp}</td>
                    <td className="px-4 py-3">{r.temp}</td>
                    <td className="px-4 py-3">{r.spo2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
