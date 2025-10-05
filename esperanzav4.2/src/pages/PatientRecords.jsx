// PatientRecords.jsx
// Page for health personnel to view and edit patient records, including search functionality.

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import backIcon from '../assets/back.png'

export default function PatientRecords() {
  // const [profile, setProfile] = useState(() => {
  //   try { return JSON.parse(localStorage.getItem('patientProfile') || 'null') || {} } catch { return {} }
  // })
  const [profile, setPatients] = useState([]) // patients fetch from backend
  const [currentPatient, setCurrentPatient] = useState(null) // the patient being edited
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
  const fetchPatients = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/patients`) // sends GET request to fetch all patients
      if (!res.ok) throw new Error('Failed to fetch patients')
      const data = await res.json() // assuming the response is JSON array of patients
      setPatients(data) // update the React state with fetched patients
    } catch (err) {
      console.error('Failed to fetch patients:', err)
    }
  }

  fetchPatients()
}, [])

  const latestVitals = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('latestVitals') || 'null') || null } catch { return null }
  }, [])

  const matches = useMemo(() => {
    if (!query) return profile // ?.name ? [profile] : []
    const q = query.toLowerCase()
    return profile.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.patient_id?.toLowerCase().includes(q))
    // const ok =
    //   profile?.name?.toLowerCase().includes(q) ||
    //   profile?.patientId?.toLowerCase().includes(q)
    // return ok ? [profile] : []
  }, [query, profile])

  const saveProfile = (e) => { // AYUSIN BACKEND MUNA 
    e.preventDefault()
    try {
      localStorage.setItem('patientProfile', JSON.stringify(profile))
      setEditing(false)
      alert('Patient record updated.')
    } catch {
      alert('Failed to save record.')
    }
  }

  useEffect(() => {
    const history = (() => {
      try { return JSON.parse(localStorage.getItem('vitalsHistory') || 'null') }
      catch { return null }
    })()
    if (!history && latestVitals) {
      const seed = [{
        date: new Date().toISOString().slice(0,10),
        hr: latestVitals.heartRate,
        bp: latestVitals.bp || '—',
        temp: `${latestVitals.temperature} °C`,
        spo2: `${latestVitals.spo2}%`
      }]
      localStorage.setItem('vitalsHistory', JSON.stringify(seed))
    }
  }, [latestVitals])

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
        Patient Records
      </h2>
      <p className="mt-2 text-slate-600 text-center">Search, view, and update patient information.</p>

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
        {matches.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-slate-600">No matches.</div>
        )}

        {matches.map((p)=>(
          <div key={p.patientId || 'active'} className="rounded-2xl border bg-white p-6">
            {!editing ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{p.name || '—'}</h3>
                    <p className="text-sm text-slate-600">
                      Patient ID: <span className="font-medium">{p.patientId || '—'}</span> •&nbsp;
                      Contact: <span className="font-medium">{p.contact || '—'}</span> •&nbsp;
                      Address: <span className="font-medium">{p.address || '—'}</span>
                    </p>
                  </div>
                  <button
                    onClick={()=>setEditing(true)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-semibold"
                  >
                    Edit
                  </button>
                </div>

                {/* Latest vitals */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border p-5">
                    <div className="text-slate-600 text-sm">Heart Rate</div>
                    <div className="mt-2 text-2xl font-extrabold">{latestVitals?.heartRate ?? '—'}</div>
                    <div className="text-xs text-slate-500">BPM</div>
                  </div>
                  <div className="rounded-2xl border p-5">
                    <div className="text-slate-600 text-sm">Temperature</div>
                    <div className="mt-2 text-2xl font-extrabold">{latestVitals?.temperature ?? '—'}</div>
                    <div className="text-xs text-slate-500">°C</div>
                  </div>
                  <div className="rounded-2xl border p-5">
                    <div className="text-slate-600 text-sm">SpO₂</div>
                    <div className="mt-2 text-2xl font-extrabold">{latestVitals?.spo2 ?? '—'}</div>
                    <div className="text-xs text-slate-500">%</div>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={saveProfile} className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-700">Full Name</label>
                    <input
                      value={profile.name || ''}
                      onChange={e=>setProfile({...profile, name: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Patient ID</label>
                    <input
                      value={profile.patientId || ''}
                      onChange={e=>setProfile({...profile, patientId: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-700">Contact</label>
                    <input
                      value={profile.contact || ''}
                      onChange={e=>setProfile({...profile, contact: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Address</label>
                    <input
                      value={profile.address || ''}
                      onChange={e=>setProfile({...profile, address: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-semibold"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={()=>setEditing(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
