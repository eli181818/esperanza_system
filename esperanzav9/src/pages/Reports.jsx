// Reports.jsx
// This page displays recent vitals and visit summaries for patients,
// allowing healthcare personnel to review patient history.

import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import backIcon from '../assets/back.png'
import accIcon from '../assets/account.png'
import searchIcon from '../assets/search.png'

const TEAL = '#406E65'
const TABLE_BG = '#DCEBE8'

const calcAge = (dobStr) => {
  if (!dobStr) return null
  const dob = new Date(dobStr)
  if (Number.isNaN(dob)) return null
  const t = new Date()
  let age = t.getFullYear() - dob.getFullYear()
  const m = t.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && t.getDate() < dob.getDate())) age--
  return age
}

export default function Reports() {
  const nav = useNavigate()
  const [query, setQuery] = useState('')

  // Active profile (from localStorage or default)
  const profile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('patientProfile') || 'null') } catch { return null }
  }, []) || {
    name: 'JUAN DC',
    gender: 'Male',
    address: '123 Manila St.',
    contact: '09451581553',
    dob: '2004-01-20',
  }

  const age = calcAge(profile.dob)
  const birthdate = profile.dob
    ? new Date(profile.dob).toLocaleDateString()
    : '—'

  // Build simple rows for the table, modify this to include more data if available
  const rows = useMemo(() => {
    // Load from localStorage
    const hist = (() => {
      try { return JSON.parse(localStorage.getItem('vitalsHistory') || '[]') } catch { return [] }
    })()

    if (hist.length === 0) {
      return Array.from({ length: 10 }, (_, i) => ({
        id: i,
        date: '01/18/2005',
        name: profile.name,
        gender: profile.gender || '—',
        age: age ?? '—',
        birthdate,
        address: profile.address || '—',
        contact: profile.contact || '—',
      }))
    }

    return hist.map((r, i) => ({
      id: r.id || i,
      date: r.date || '—',
      name: r.name || profile.name || '—',
      gender: profile.gender || '—',
      age: age ?? '—',
      birthdate,
      address: profile.address || '—',
      contact: profile.contact || '—',
    }))
  }, [profile, age, birthdate])

  const filtered = rows.filter(r => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      r.name.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q) ||
      r.contact.toLowerCase().includes(q)
    )
  })

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16">
      {/* Back */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 shadow"
        >
          <img src={backIcon} alt="Back" className="h-4 w-4 object-contain" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Page title */}
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-700 bg-clip-text text-transparent text-center"
      >
        Patient Records
      </h2>

      {/* Header bar and search */}
        <div
          className="mt-6 rounded-2xl border shadow-sm"
          style={{ background: 'white' }}
        >
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 p-6">
            <h3 className="text-2xl font-extrabold text-slate-900 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent text-center md:text-left w-full md:w-auto">
          <img src={accIcon} alt="Profile" className="inline h-8 w-8 object-contain mr-2" />
          Esperanza Patient Record
            </h3>
            <div className="w-full md:w-1/2 flex justify-end">
          <div className="relative w-full md:w-80">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, address or contact…"
              className="w-full rounded-full px-4 py-2 outline-none shadow-inner pr-10"
              style={{
            background: TABLE_BG,
            color: TEAL,
            border: `1px solid ${TEAL}20`,
              }}
            />
            <img
              src={searchIcon}
              alt="Search"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-70 pointer-events-none"
            />
          </div>
            </div>
          </div>

          {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr style={{ background: TABLE_BG, color: TEAL }}>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Birthdate</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Contact Number</th>
              </tr>
            </thead>
            <tbody style={{ background: TABLE_BG, color: TEAL }}>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: '#406E651A' }}>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.gender}</td>
                  <td className="px-4 py-3">{r.age}</td>
                  <td className="px-4 py-3">{r.birthdate}</td>
                  <td className="px-4 py-3">{r.address}</td>
                  <td className="px-4 py-3">{r.contact}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center" colSpan={7}>
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-4" />
      </div>
    </section>
  )
}
