import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import backIcon from '../assets/back.png'

export default function PatientRecords() {
  const [patients, setPatients] = useState([])
  const [currentPatient, setCurrentPatient] = useState(null)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  // Fetch all patients on component mount
  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async (searchTerm = '') => {
    setLoading(true)
    try {
      const url = searchTerm 
        ? `http://127.0.0.1:8000/patients/?search=${encodeURIComponent(searchTerm)}`
        : `http://127.0.0.1:8000/patients/`
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch patients')
      const data = await res.json()
      setPatients(data)
    } catch (err) {
      console.error('Failed to fetch patients:', err)
      alert('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  // Search when query changes (with debounce would be better)
  const handleSearch = () => {
    fetchPatients(query)
  }

  const handleClear = () => {
    setQuery('')
    fetchPatients('')
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`http://127.0.0.1:8000/patients/${currentPatient.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPatient)
      })
      
      if (!res.ok) throw new Error('Failed to update patient')
      
      alert('Patient record updated successfully')
      setEditing(false)
      fetchPatients(query) // Refresh the list
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to save record')
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
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by Name or Patient ID..."
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
        />
        <button
          onClick={handleSearch}
          className="rounded-xl bg-emerald-600 text-white px-6 py-2.5 hover:bg-emerald-700 font-semibold"
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

      {/* Loading */}
      {loading && (
        <div className="mt-6 text-center text-slate-600">Loading patients...</div>
      )}

      {/* Results */}
      <div className="mt-6 space-y-6">
        {!loading && patients.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-slate-600">No patients found.</div>
        )}

        {patients.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-white p-6">
            {editing && currentPatient?.id === p.id ? (
              <form onSubmit={saveProfile} className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-700">Full Name</label>
                    <input
                      value={currentPatient.name || ''}
                      onChange={e => setCurrentPatient({...currentPatient, name: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Patient ID</label>
                    <input
                      value={currentPatient.patient_id || ''}
                      disabled
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 bg-slate-100"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-700">Contact</label>
                    <input
                      value={currentPatient.contact || ''}
                      onChange={e => setCurrentPatient({...currentPatient, contact: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Gender</label>
                    <select
                      value={currentPatient.gender || ''}
                      onChange={e => setCurrentPatient({...currentPatient, gender: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-700">Address</label>
                  <textarea
                    value={currentPatient.address || ''}
                    onChange={e => setCurrentPatient({...currentPatient, address: e.target.value})}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    rows="2"
                  />
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
                      Patient ID: <span className="font-medium">{p.patient_id || '—'}</span> • 
                      Age: <span className="font-medium">{p.age || '—'}</span> • 
                      Gender: <span className="font-medium">{p.gender || '—'}</span>
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Contact: <span className="font-medium">{p.contact || '—'}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Address: <span className="font-medium">{p.address || '—'}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => startEditing(p)}
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