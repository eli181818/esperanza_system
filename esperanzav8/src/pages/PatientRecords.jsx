// PatientRecords.jsx
// Page for health personnel to view and edit patient records, including search functionality.
// Note: This is a different page from Records.jsx, which is for patients to view their own records.

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import backIcon from '../assets/back.png'
import accIcon from '../assets/account.png'
import historyIcon from '../assets/history.png'

const BRAND = { bg: '#DCEBE8', text: '#406E65', border: '#BEE1DB' }

export default function PatientRecords() {
  const nav = useNavigate()

  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('patientProfile') || 'null') || {} } catch { return {} }
  })
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)

  const [latestVitals, setLatestVitals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('latestVitals') || 'null') || null } catch { return null }
  })

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vitalsHistory') || 'null') || [] } catch { return [] }
  })

  // Seed demo history if none exists yet
  useEffect(() => {
    if (!history.length && latestVitals) {
      const seed = [{
        date: new Date().toISOString().slice(0,10),
        hr: latestVitals.heartRate ?? '—',
        bp: latestVitals.bp ?? '—',
        temp: latestVitals.temperature != null ? `${latestVitals.temperature} °C` : '—',
        spo2: latestVitals.spo2 != null ? `${latestVitals.spo2}%` : '—',
        height: latestVitals.height != null ? `${latestVitals.height} cm` : '—',
        weight: latestVitals.weight != null ? `${latestVitals.weight} kg` : '—',
        bmi: latestVitals.bmi != null ? `${latestVitals.bmi} kg/m²` : '—',
      }]
      localStorage.setItem('vitalsHistory', JSON.stringify(seed))
      setHistory(seed)
    }
  }, [history.length, latestVitals])

  const matches = useMemo(() => {
    if (!query) return profile?.name ? [profile] : []
    const q = query.toLowerCase()
    const ok =
      profile?.name?.toLowerCase().includes(q) ||
      profile?.patientId?.toLowerCase().includes(q)
    return ok ? [profile] : []
  }, [query, profile])

  const saveProfile = () => {
    localStorage.setItem('patientProfile', JSON.stringify(profile))
  }

  const [bpInput, setBpInput] = useState('')
  useEffect(() => {
    setBpInput((latestVitals?.bp ?? '').toString())
  }, [editing, latestVitals])

  const saveBp = () => {
    if (!bpInput.trim()) return
    const nextLatest = { ...(latestVitals || {}), bp: bpInput.trim() }
    setLatestVitals(nextLatest)
    localStorage.setItem('latestVitals', JSON.stringify(nextLatest))

    // Add or update today's bp entry in history
    const today = new Date().toISOString().slice(0,10)
    const idx = history.findIndex(h => h.date === today)
    const newRow = {
      date: today,
      hr: nextLatest.heartRate ?? '—',
      bp: bpInput.trim(),
      temp: nextLatest.temperature != null ? `${nextLatest.temperature} °C` : '—',
      spo2: nextLatest.spo2 != null ? `${nextLatest.spo2}%` : '—',
      height: nextLatest.height != null ? `${nextLatest.height} cm` : '—',
      weight: nextLatest.weight != null ? `${nextLatest.weight} kg` : '—',
      bmi: nextLatest.bmi != null ? `${nextLatest.bmi} kg/m²` : '—',
    }
    let nextHistory
    if (idx >= 0) {
      nextHistory = [...history]
      nextHistory[idx] = { ...nextHistory[idx], ...newRow }
    } else {
      nextHistory = [newRow, ...history]
    }
    setHistory(nextHistory)
    localStorage.setItem('vitalsHistory', JSON.stringify(nextHistory))
  }

  const handleFinish = () => {
    saveProfile()
    setEditing(false)
    nav('/records')
  }

  const Title = ({ children }) => (
    <h2
      className="text-3xl md:text-4xl font-extrabold tracking-tight text-center"
      style={{ backgroundImage: `linear-gradient(90deg, ${BRAND.text}, #10B981)`,
               WebkitBackgroundClip: 'text', color: 'transparent' }}
    >
      {children}
    </h2>
  )

  const GradientHeader = ({ children, icon }) => (
    <div className="flex items-center gap-3 mt-6 rounded-2xl px-6 py-3 bg-transparent shadow-none">
      {icon && <img src={icon} alt="" className="h-7 w-7 opacity-80" />}
      <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-slate-600 bg-clip-text text-transparent">
        {children}
      </h2>
    </div>
  )

  const SectionHeader = ({ children }) => (
    <div className="rounded-xl px-4 py-2 font-extrabold"
         style={{ background: BRAND.bg, color: BRAND.text, border: `1px solid ${BRAND.border}` }}>
      {children}
    </div>
  )

  return (
    <section className="relative mx-auto max-w-5xl px-2 py-16">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 shadow"
        >
          <img src={backIcon} alt="Back" className="h-4 w-4 object-contain" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <Title>Patient Records</Title>

      {/* Search */}
      <div className="mt-6 flex gap-3">
        <input
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="Search by Name or Patient ID…"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
        />
        <button
          onClick={()=>setQuery('')}
          className="rounded-xl border border-slate-300 px-4 py-2.5 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      {/* Results */}
      <div className="mt-6 space-y-6">
        {(!matches.length) && (
          <div className="rounded-2xl border bg-white p-6 text-slate-600">No matches.</div>
        )}

        {matches.map((p)=>(
          <div key={p.patientId || 'active'} className="rounded-2xl border bg-white p-6">
            {!editing ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold" style={{ color: BRAND.text }}>
                      {p.name || '—'}
                    </h3>
                    <p className="text-sm" style={{ color: BRAND.text }}>
                      Patient ID: <span className="font-semibold">{p.patientId || '—'}</span> •&nbsp;
                      Contact: <span className="font-semibold">{p.contact || '—'}</span> •&nbsp;
                      Address: <span className="font-semibold">{p.address || '—'}</span>
                    </p>
                  </div>
                  <button
                    onClick={()=>setEditing(true)}
                    className="rounded-xl px-4 py-2 font-semibold text-white"
                    style={{ background: BRAND.text }}
                  >
                    Edit
                  </button>
                </div>
                {/* Latest Vitals Card*/}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border p-5" style={{ background: BRAND.bg, color: BRAND.text, borderColor: BRAND.border }}>
                    <div className="text-sm opacity-90">Heart Rate</div>
                    <div className="mt-2 text-3xl font-extrabold tabular-nums">{latestVitals?.heartRate ?? '—'}</div>
                    <div className="mt-1 text-xs opacity-80">BPM</div>
                  </div>
                  <div className="rounded-2xl border p-5" style={{ background: BRAND.bg, color: BRAND.text, borderColor: BRAND.border }}>
                    <div className="text-sm opacity-90">Temperature</div>
                    <div className="mt-2 text-3xl font-extrabold tabular-nums">{latestVitals?.temperature ?? '—'}</div>
                    <div className="mt-1 text-xs opacity-80">°C</div>
                  </div>
                  <div className="rounded-2xl border p-5" style={{ background: BRAND.bg, color: BRAND.text, borderColor: BRAND.border }}>
                    <div className="text-sm opacity-90">SpO₂</div>
                    <div className="mt-2 text-3xl font-extrabold tabular-nums">{latestVitals?.spo2 ?? '—'}</div>
                    <div className="mt-1 text-xs opacity-80">%</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Personal Information */}
                <GradientHeader icon={accIcon}>Personal Information</GradientHeader>

                <div className="mt-3 rounded-2xl overflow-hidden border" style={{ borderColor: BRAND.border }}>
                  <img src={accIcon} alt="Account" className="absolute right-6 top-6 h-8 w-8 opacity-10" />
                  {/* Table */}
                  <table className="min-w-full text-sm" style={{ background: BRAND.bg, color: BRAND.text }}>
                    <tbody>
                      <tr className="border-b" style={{ borderColor: BRAND.border }}>
                        <th className="px-4 py-3 text-left w-52">Patient Name</th>
                        <td className="px-4 py-3">
                          <input
                            value={profile.name || ''}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                            required
                          />
                        </td>
                        <th className="px-4 py-3 text-left w-40">Gender</th>
                        <td className="px-4 py-3">
                          <select
                            value={profile.gender || 'Male'}
                            onChange={e => setProfile({ ...profile, gender: e.target.value })}
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                          >
                            <option>Male</option>
                            <option>Female</option>
                          </select>
                        </td>
                      </tr>

                      <tr className="border-b" style={{ borderColor: BRAND.border }}>
                        <th className="px-4 py-3 text-left">Address</th>
                        <td className="px-4 py-3">
                          <input
                            value={profile.address || ''}
                            onChange={e => setProfile({ ...profile, address: e.target.value })}
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                          />
                        </td>
                        <th className="px-4 py-3 text-left">Birthdate</th>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={profile.dob || ''}
                            onChange={e => setProfile({ ...profile, dob: e.target.value })}
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                          />
                        </td>
                      </tr>

                      <tr>
                        <th className="px-4 py-3 text-left">Contact Number</th>
                        <td className="px-4 py-3">
                          <input
                            value={profile.contact || ''}
                            onChange={e => setProfile({ ...profile, contact: e.target.value })}
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                          />
                        </td>
                        <th className="px-4 py-3 text-left">Patient ID</th>
                        <td className="px-4 py-3">
                          <input
                            value={profile.patientId || ''}
                            onChange={e => setProfile({ ...profile, patientId: e.target.value })}
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Blood Pressure Input (for staff) */}
                <div className="mt-6">
                <SectionHeader>Blood Pressure</SectionHeader>
                <div className="mt-3 rounded-2xl border p-4 flex items-center gap-3"
                     style={{ borderColor: BRAND.border, background: BRAND.bg, color: BRAND.text }}>
                  <label className="min-w-[10rem] font-semibold">BP (mmHg)</label>
                  <input
                    value={bpInput}
                    onChange={(e)=>setBpInput(e.target.value)}
                    placeholder="e.g. 120/80"
                    className="rounded-lg border px-3 py-2 bg-white flex-1"
                    style={{ borderColor: BRAND.border }}
                  />
                  <button
                    type="button"
                    onClick={saveBp}
                    className="rounded-lg px-4 py-2 text-white font-semibold"
                    style={{ background: BRAND.text }}
                  >
                    Save BP
                  </button>
                </div>
                </div>

                {/* Vital Signs History */}
                <GradientHeader icon={historyIcon}>Vital Signs History</GradientHeader>

                <div className="mt-3 rounded-2xl overflow-hidden border" style={{ borderColor: BRAND.border }}>
                  <img src={historyIcon} alt="History" className="absolute right-6 top-6 h-8 w-8 opacity-10" />
                  {/* Table */}
                  <table className="min-w-full text-sm" style={{ background: BRAND.bg, color: BRAND.text }}>
                    <thead style={{ background: '#cfe5e1' }}>
                      <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Height</th>
                        <th className="px-4 py-3 text-left">Weight</th>
                        <th className="px-4 py-3 text-left">Heart Rate</th>
                        <th className="px-4 py-3 text-left">Oxygen Saturation</th>
                        <th className="px-4 py-3 text-left">Temperature</th>
                        <th className="px-4 py-3 text-left">BMI</th>
                        <th className="px-4 py-3 text-left">Blood Pressure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(history.length ? history : []).map((r, i) => (
                        <tr key={r.id || i} className="border-t" style={{ borderColor: BRAND.border }}>
                          <td className="px-4 py-3">{r.date}</td>
                          <td className="px-4 py-3">{r.height ?? '—'}</td>
                          <td className="px-4 py-3">{r.weight ?? '—'}</td>
                          <td className="px-4 py-3">{r.hr ? `${r.hr} bpm` : '—'}</td>
                          <td className="px-4 py-3">{r.spo2 ?? '—'}</td>
                          <td className="px-4 py-3">{r.temp ?? '—'}</td>
                          <td className="px-4 py-3">{r.bmi ?? '—'}</td>
                          <td className="px-4 py-3">{r.bp ?? '—'}</td>
                        </tr>
                      ))}
                      {!history.length && (
                        <tr>
                          <td className="px-4 py-6 text-center" colSpan={8}>No history yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Finish button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleFinish}
                    className="rounded-xl px-6 py-3 font-semibold text-white"
                    style={{ background: BRAND.text }}
                  >
                    Finish
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
