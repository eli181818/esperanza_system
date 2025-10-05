// KioskStatus.jsx
// The component to display the status of various sensors in a kiosk system.

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import backIcon from '../assets/back.png'

export default function KioskStatus() {
  const [connected, setConnected] = useState(false)
  const nav = useNavigate()

  const sensors = [
    { key: 'hr_spo2', name: 'Heart Rate & Oxygen Saturation Sensor', status: connected ? 'Active' : 'Idle' },
    { key: 'temp', name: 'Infrared Temperature Sensor', status: connected ? 'Active' : 'Idle' },
    { key: 'fp', name: 'Fingerprint Sensor', status: connected ? 'Active' : 'Idle' },
    { key: 'weight', name: 'Weighing Scale', status: connected ? 'Active' : 'Idle' },
    { key: 'height', name: 'Height Sensor', status: connected ? 'Active' : 'Idle' },
  ]

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
        Kiosk Status
      </h2>
      <p className="mt-2 text-slate-600 text-center">Monitor active sensor measurements.</p>

      {/* Connection Controls */}
      <div className="mt-6 flex gap-3 justify-center">
        <button
          className={`rounded-xl px-4 py-2 font-semibold text-white ${connected ? 'bg-emerald-600' : 'bg-slate-500'}`}
          onClick={() => setConnected(v => !v)}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </button>
        <div
          className={`rounded-xl px-4 py-2 border ${
            connected
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : 'border-slate-300 bg-white text-slate-700'
          }`}
        >
          Status: <span className="font-semibold">{connected ? 'Connected' : 'Idle'}</span>
        </div>
      </div>

      {/* Sensor List */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {sensors.map(s => (
          <div key={s.key} className="rounded-2xl border bg-white p-5">
            <div className="text-slate-600 text-sm">{s.name}</div>
            <div
              className={`mt-2 text-xl font-extrabold ${
                connected ? 'text-emerald-700' : 'text-slate-700'
              }`}
            >
              {s.status}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Last check: {new Date().toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
