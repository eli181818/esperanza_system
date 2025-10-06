// PatientRecords.jsx
// Page for health personnel to view and edit patient records, including search functionality.

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import backIcon from '../assets/back.png'

export default function PatientRecords() {
  const [profile, setProfile] = useState([]) // patients fetch from backend
  const [currentPatient, setCurrentPatient] = useState(null) // the patient being edited
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    fetchPatients() 
  }, [])

  const fetchPatients = async (searchTerm = '') => {
    setLoading(true)
    try {
      const url = searchTerm
        ? `http://127.0.0.1:8000/patients?search=${encodeURIComponent(searchTerm)}`
        : `http://127.0.0.1:8000/patients`
      const res = await fetch(url) // sends GET request to fetch patients
      if (!res.ok) throw new Error('Failed to fetch patients')
      const data = await res.json() // assuming the response is JSON array of patients
      setProfile(data) // update the React state with fetched patients
    } catch (err) {
      console.error('Failed to fetch patients:', err)
      alert('Failed to fetch patients.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => { // search patients
    fetchPatients(query) 
  }
  
  const handleClear = () => { // clear search
    setQuery('')
    fetchPatients()
  }

  const saveProfile = async (e) => { // save edited patient profile 
    e.preventDefault()
    try {
      const res = await fetch(`http://127.0.0.1:8000/patients/${currentPatient.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPatient)
      })

      if (!res.ok) throw new Error('Failed to update patient profile')
      alert('Patient profile updated successfully.')
      setEditing(false)
      fetchPatients(query) 
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to update patient profile.')
    }
  }

  const startEditing = (patient) => {
    setCurrentPatient(patient)
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setCurrentPatient(null)
  }

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
          onKeyDown={(e)=> e.key === 'Enter' && handleSearch()}
          placeholder="Search by Name or Patient ID…"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
        />
        <button 
          onClick={handleSearch}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-semibold"
        >
          Search
        </button>
        <button
          onClick={handleClear}
          className="rounded-xl border border-slate-300 px-4 py-2.5 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      {/* Results */}
      <div className="mt-6 space-y-6">
        {!loading && profile.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-slate-600">No matches.</div>
        )}

        {profile.map((p)=>(
          <div key={p.id || 'active'} className="rounded-2xl border bg-white p-6">
            {editing && currentPatient?.id === p.id ? (
              <form onSubmit={saveProfile} className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-700">Full Name</label>
                    <input
                      value={currentPatient.name || ''}
                      onChange={e=>setCurrentPatient({...currentPatient, name: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Patient ID</label>
                    <input
                      value={currentPatient.patient_id || ''}
                      onChange={e=>setCurrentPatient({...currentPatient, patient_id: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 bg-slate-100"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-700">Contact</label>
                    <input
                      value={currentPatient.contact || ''}
                      onChange={e=>setCurrentPatient({...currentPatient, contact: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Address</label>
                    <input
                      value={currentPatient.address || ''}
                      onChange={e=>setCurrentPatient({...currentPatient, address: e.target.value})}
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
                    onClick={cancelEditing}
                    className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{p.name || '—'}</h3>
                    <p className="text-sm text-slate-600">
                      Patient ID: <span className="font-medium">{p.patient_id || '—'}</span> •&nbsp;
                      Contact: <span className="font-medium">{p.contact || '—'}</span> •&nbsp;
                      Address: <span className="font-medium">{p.address || '—'}</span>
                    </p>
                  </div>
                  <button
                    onClick={()=>startEditing(p)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-semibold"
                  >
                    Edit
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