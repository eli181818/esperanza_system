// QueueManagement.jsx (Replaced with KioskStatus.jsx)
// The component to manage the queue system for a kiosk application.

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import priorityIcon from '../assets/disabled.png'
import nextIcon from '../assets/next.png'
import listIcon from '../assets/list.png'
import backIcon from '../assets/back.png'
import searchIcon from '../assets/search.png'

// Local storage keys
const QKEY = 'queue:list'
const NOWKEY = 'queue:now'

const seedQueue = () => {
  const today = new Date().toISOString().slice(0, 10)
  const demo = Array.from({ length: 9 }, (_, i) => ({
    id: `${today}-${String(i + 1).padStart(3, '0')}`,
    number: String(i + 1).padStart(3, '0'),
    name: 'JUAN DC',
    sex: 'Male',
    height: 175,
    weight: 42,
    hr: 71,
    bp: '118/76',
    temp: '37.2 °C',
    spo2: '98%',
    address: '123 Manila St.',
    contact: '0945 158 1553',
    date: '01/20/2004',
  }))
  localStorage.setItem(QKEY, JSON.stringify(demo))
  localStorage.setItem(NOWKEY, '0')
  return demo
}

const readQueue = () => {
  try {
    const q = JSON.parse(localStorage.getItem(QKEY) || 'null')
    if (Array.isArray(q) && q.length) return q
    return seedQueue()
  } catch {
    return seedQueue()
  }
}

const readNow = () => {
  const n = parseInt(localStorage.getItem(NOWKEY) || '0', 10)
  return Number.isFinite(n) ? n : 0
}

const calcBmi = (height, weight) => {
  const h = Number(height)
  const w = Number(weight)
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0) return '—'
  const m = h / 100
  return (w / (m * m)).toFixed(1)
}

export default function QueueManagement() {
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [queue, setQueue] = useState(readQueue)
  const [now, setNow] = useState(readNow)

  // Modal: “Now serving…”
  const [showNowModal, setShowNowModal] = useState(false)
  const tableRef = useRef(null)

  const currentNumber = useMemo(() => queue[now]?.number ?? '—', [queue, now])

  useEffect(() => {
    localStorage.setItem(QKEY, JSON.stringify(queue))
  }, [queue])

  useEffect(() => {
    localStorage.setItem(NOWKEY, String(now))
  }, [now])

  // Actions
  const handleNext = () => {
    setNow((n) => {
      const next = Math.min(n + 1, Math.max(queue.length - 1, 0))
      return next
    })
    setShowNowModal(true)
    // Automatically close after 2 seconds
    setTimeout(() => setShowNowModal(false), 2000)
  }

  const handleEmergency = () => {
    const emerg = {
      id: `${Date.now()}-E`,
      number: 'E' + String(Math.floor(Math.random() * 90) + 10),
      name: 'PRIORITY',
      sex: '—',
      height: '—',
      weight: '—',
      hr: '—',
      bp: '—',
      temp: '—',
      spo2: '—',
      address: '—',
      contact: '—',
      date: new Date().toLocaleDateString(),
    }
    setQueue((q) => [emerg, ...q])
    setNow(0)
    setShowNowModal(true)
    setTimeout(() => setShowNowModal(false), 2000)
  }

  const handleGoList = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleExit = () => nav('/staff')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return queue
    return queue.filter(
      (r) =>
        r.number.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (r.bp || '').toLowerCase().includes(q)
    )
  }, [queue, query])

  return (
      <section className="mx-auto max-w-6xl px-4 py-10">
        {/* Back button */}
        <button
              onClick={() => nav(-1)}
              className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 shadow mb-6"
            >
              <img src={backIcon} alt="Back" className="h-4 w-4 object-contain" />
              <span className="text-sm font-medium">Back</span>
          </button>
            

      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-800">
        Queue Management
      </h1>

      {/* Controls */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* In Queue */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="flex justify-center items-center mt-2 flex-1">
            <span className="text-6xl font-black text-emerald-900 tabular-nums">{currentNumber}</span>
          </div>
          <div className="text-sm text-emerald-800/80 mt-4">In Queue</div>
        </div>

        {/* Next Patient */}
        <button
          onClick={handleNext}
          className="rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-sm hover:bg-emerald-50 flex flex-col items-center justify-center"
        >
          <img src={nextIcon} alt="Next" className="mx-auto h-10 w-10 object-contain mb-2" />
          <div className="text-sm text-slate-600">Next</div>
          <div className="mt-2 text-xl font-extrabold text-emerald-800">Next Patient</div>
        </button>

        {/* Emergency / Priority */}
        <button
          onClick={handleEmergency}
          className="rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-sm hover:bg-emerald-50 flex flex-col items-center justify-center"
        >
          <img src={priorityIcon} alt="Emergency / Priority" className="mx-auto h-10 w-10 object-contain mb-2" />
          <div className="text-sm text-slate-600">Add</div>
          <div className="mt-2 text-xl font-extrabold text-emerald-800">Emergency / Priority</div>
        </button>

        {/* Queue List*/}
        <button
          onClick={handleGoList}
          className="rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-sm hover:bg-emerald-50 flex flex-col items-center justify-center"
        >
          <img src={listIcon} alt="Queue List" className="mx-auto h-10 w-10 object-contain mb-2" />
          <div className="text-sm text-slate-600">View</div>
          <div className="mt-2 text-xl font-extrabold text-emerald-800">Queue List</div>
        </button>
      </div>

      {/* Patient Queue table */}
      <div
        ref={tableRef}
        className="mt-6 rounded-2xl border shadow-sm overflow-hidden bg-white"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 pt-5">
          <div className="text-lg font-extrabold" style={{ color: '#406E65' }}>
            Patient <span className="text-emerald-700">Queue</span>
          </div>
          <div className="w-full md:w-[26rem]">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search number, name, BP…"
                className="w-full rounded-full border border-emerald-200/70 bg-emerald-50/40 px-4 py-2.5 pr-10 text-emerald-900 placeholder-emerald-800/60"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-800/70">
                <img src={searchIcon} alt="Search" className="h-5 w-5 object-contain select-none" draggable="false" />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm" style={{ color: '#406E65' }}>
            <thead style={{ background: '#DCEBE8', color: '#406E65' }}>
              <tr>
                <th className="px-4 py-3">Queuing Number</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Height/Weight</th>
                <th className="px-4 py-3">BMI</th>
                <th className="px-4 py-3">Heart Rate</th>
                <th className="px-4 py-3">Blood Pressure</th>
                <th className="px-4 py-3">Temperature</th>
                <th className="px-4 py-3">Oxygen Saturation</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-t"
                  style={{
                    background: i === now ? '#CFE6E1' : '#DCEBE8',
                    color: '#406E65',
                  }}
                >
                  <td className="px-4 py-3 font-semibold tabular-nums text-center">{r.number}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">
                    {r.height}
                    {typeof r.height === 'number' ? ' cm' : ''} / {r.weight}
                    {typeof r.weight === 'number' ? ' kg' : ''}
                  </td>
                  <td className="px-4 py-3">{calcBmi(r.height, r.weight)}</td>
                  <td className="px-4 py-3">
                    {r.hr}
                    {typeof r.hr === 'number' ? ' bpm' : ''}
                  </td>
                  <td className="px-4 py-3">{r.bp}</td>
                  <td className="px-4 py-3">{r.temp}</td>
                  <td className="px-4 py-3">{r.spo2}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center" colSpan={8} style={{ color: '#406E65' }}>
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5">
          <button
            onClick={handleExit}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-700"
          >
            Exit
          </button>
        </div>
      </div>

      {showNowModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6 text-center">
            <h3 className="text-3xl font-extrabold tracking-wide text-emerald-800">
              Now serving queue #{currentNumber}
            </h3>
            <div className="mt-4">
              <div className="mx-auto h-1 w-40 rounded-full bg-emerald-600/70" />
            </div>
            <button
              onClick={() => setShowNowModal(false)}
              className="mt-6 rounded-xl border border-slate-300 px-5 py-2.5 text-slate-800 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
