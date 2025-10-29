// PatientRecords.jsx - Fixed version
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import backIcon from '../assets/back.png'
import accIcon from '../assets/account.png'
import historyIcon from '../assets/history.png'

const BRAND = {
  bg: '#DCEBE8',
  text: '#406E65',
  border: '#BEE1DB',
}

export default function PatientRecords() {
  const nav = useNavigate()
  const { patientId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [patients, setPatients] = useState([])
  const [currentPatient, setCurrentPatient] = useState(null)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [latestVitals, setLatestVitals] = useState(null)
  const [history, setHistory] = useState([])
  const [bpInput, setBpInput] = useState('')

  const constructName = (patient) => {
    if (patient.name) return patient.name
    const parts = [patient.first_name, patient.middle_initial, patient.last_name].filter(Boolean)
    if (patient.middle_initial) {
      return `${patient.first_name} ${patient.middle_initial}. ${patient.last_name}`
    }
    return parts.join(' ') || '—'
  }

  useEffect(() => {
    const searchTerm = searchParams.get('q') || ''
    setQuery(searchTerm)
    fetchPatients(searchTerm)
  }, [searchParams])

  const fetchPatients = async (searchTerm = '') => {
    setLoading(true)
    try {
      const url = searchTerm
        ? `http://localhost:8000/patients/?search=${encodeURIComponent(searchTerm)}`
        : `http://localhost:8000/patients/`
      const res = await fetch(url, {
        credentials: 'include',
      })
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

  useEffect(() => {
    if (patients.length > 0 && !editing) {
      if (patientId) {
        // FIXED: Search using the patient_id from URL
        const patientToEdit = patients.find(p => p.patient_id === patientId)
        if (patientToEdit) {
          // If found, treat it as starting an edit immediately
          startEditing(patientToEdit)
        } else {
          // If not found (or patientId is just a placeholder), select the first one
          const firstPatient = patients[0]
          setCurrentPatient(firstPatient)
          fetchVitals(firstPatient.id)
        }
      } else {
        const firstPatient = patients[0]
        setCurrentPatient(firstPatient)
        if (firstPatient) {
           fetchVitals(firstPatient.id)
        }
      }
    } else if (patients.length === 0) {
      setCurrentPatient(null)
      setLatestVitals(null)
      setHistory([])
    }
  }, [patients, patientId])

  useEffect(() => {
    setBpInput((latestVitals?.blood_pressure ?? '').toString())
  }, [editing, latestVitals])

  // FIXED: Use patient.id (database ID) not patient_id
  const fetchVitals = async (databaseId) => {
    try {
      const res = await fetch(`http://localhost:8000/patients/${databaseId}/vitals/`, {
        credentials: 'include',
      })
      if (!res.ok) {
        console.error('Failed to fetch vitals:', res.status)
        return
      }
      const data = await res.json()

      if (data.latest) setLatestVitals(data.latest)
      if (data.history) setHistory(data.history)
    } catch (err) {
      console.error('Failed to fetch vitals:', err)
    }
  }

  const handleSearch = () => {
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
    } else {
      setSearchParams({})
    }
  }

  const handleClear = () => {
    setQuery('')
    setSearchParams({})
  }

  const saveProfile = async () => {
    if (!currentPatient) return
    
    try {
      // Use the separate fields directly
      const first_name = (currentPatient.first_name || '').trim()
      const middle_initial = (currentPatient.middle_initial || '').trim().charAt(0) // Only first character
      const last_name = (currentPatient.last_name || '').trim()

      // Build payload - explicitly exclude pin, patient_id, and other read-only fields
      const payload = {
        first_name: first_name || 'Unknown',
        last_name: last_name || 'Unknown', // Cannot be blank
        sex: currentPatient.sex || 'Male',
        address: currentPatient.address || '',
        contact: currentPatient.contact || '',
        pin: currentPatient.pin, // Include existing pin to satisfy required field
      }
      
      // Only add optional fields if they have values
      if (middle_initial) {
        payload.middle_initial = middle_initial
      }
      if (currentPatient.birthdate) {
        payload.birthdate = currentPatient.birthdate
      }

      console.log('Saving patient data:', payload)

      const res = await fetch(`http://localhost:8000/patients/${currentPatient.id}/`, {
        method: 'PATCH', // Changed from PUT to PATCH - only updates provided fields
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Error response:', errorData)
        console.error('Full error details:', JSON.stringify(errorData, null, 2))
        
        // Show detailed error message
        let errorMsg = 'Failed to update patient'
        if (errorData.detail) {
          errorMsg = errorData.detail
        } else if (typeof errorData === 'object') {
          // Show field-specific errors
          const errors = Object.entries(errorData).map(([field, msgs]) => 
            `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
          ).join('\n')
          errorMsg = errors || errorMsg
        }
        
        throw new Error(errorMsg)
      }

      alert('Patient record updated successfully')
      setEditing(false)
      
      const currentSearch = searchParams.get('q') || ''
      fetchPatients(currentSearch) // Refresh list to reflect changes
    } catch (err) {
      console.error('Failed to save:', err)
      alert(`Failed to save record: ${err.message}`)
    }
  }

  const saveBp = async () => {
    if (!bpInput.trim() || !currentPatient) return
    
    try {
      const res = await fetch(`http://localhost:8000/patients/${currentPatient.id}/vitals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          blood_pressure: bpInput.trim(),
          date: new Date().toISOString().split('T')[0],
        }),
      })
      
      if (!res.ok) throw new Error('Failed to save blood pressure')
      
      alert('Blood pressure saved successfully')
      fetchVitals(currentPatient.id)
    } catch (err) {
      console.error('Failed to save BP:', err)
      alert('Failed to save blood pressure')
    }
  }

  const handleFinish = async () => {
    // Await saveProfile to ensure update is done before state reset/navigation
    await saveProfile()
    
    // Reset editing state and navigate back to the search view
    setEditing(false)
    setCurrentPatient(null)
    const currentSearch = searchParams.get('q')
    if (currentSearch) {
      nav(`/staff/patient-records?q=${encodeURIComponent(currentSearch)}`, { replace: true })
    } else {
      nav('/staff/patient-records', { replace: true })
    }
    // fetchPatients is already called inside saveProfile upon success
  }

  const startEditing = (patient) => {
    const patientToEdit = {
      ...patient,
      first_name: patient.first_name || '',
      middle_initial: patient.middle_initial || '',
      last_name: patient.last_name || '',
      sex: patient.sex || patient.sex || 'Male',
      birthdate: patient.birthdate || patient.dob || '',
    }
    
    setCurrentPatient(patientToEdit)
    setEditing(true)
    
    // Fetch vitals for this patient
    fetchVitals(patient.id)
    
    // Update URL to reflect editing state
    const currentSearch = searchParams.get('q')
    if (currentSearch) {
      nav(`/staff/patient-records/${patient.patient_id}?q=${encodeURIComponent(currentSearch)}`, { replace: true })
    } else {
      nav(`/staff/patient-records/${patient.patient_id}`, { replace: true })
    }
  }

  const Title = ({ children }) => (
    <h2
      className="text-3xl md:text-4xl font-extrabold tracking-tight text-center"
      style={{
        backgroundImage: `linear-gradient(90deg, ${BRAND.text}, #10B981)`,
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      }}
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

  // Delete Modal State and Handlers
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetPatientId, setTargetPatientId] = useState(null); // Changed to targetPatientId

  // NEW: API call to delete the patient
  const deletePatient = async (patientDbId) => {
    try {
      const res = await fetch(`http://localhost:8000/patients/${patientDbId}/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete patient record');
      }
      
      alert('Patient record deleted successfully.');
    } catch (e) {
      console.error('Failed to delete patient data:', e);
      alert(`Failed to delete record: ${e.message}`);
      throw e; // Re-throw to prevent confirmDelete from proceeding
    }
  };

  const handleDeleteClick = (databaseId) => { // Use database ID for API
    setTargetPatientId(databaseId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!targetPatientId) return;

    try {
      await deletePatient(targetPatientId);
      
      // Clean up local state after successful deletion
      setCurrentPatient(null);
      setLatestVitals(null);
      setHistory([]);
      setEditing(false);
      
      // Refresh patient list from the server
      fetchPatients(query.trim());

      // Reset modal state
      setShowDeleteModal(false);
      setTargetPatientId(null);
      
      // Navigate back to the main list view
      nav('/staff/patient-records', { replace: true });
    } catch (e) {
      // The error is already alerted in deletePatient
      setShowDeleteModal(false);
      setTargetPatientId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTargetPatientId(null);
  };
  
    // End Delete Modal Handlers

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

      <div className="mt-6 flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by Name or Patient ID…"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
        />
        <button
          onClick={handleClear}
          className="rounded-xl border border-slate-300 px-4 py-2.5 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {!loading && patients.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-slate-600">No matches.</div>
        )}

        {patients.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-white p-6">
            {!editing || currentPatient?.id !== p.id ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold" style={{ color: BRAND.text }}>
                      {constructName(p)}
                    </h3>
                    <p className="text-sm" style={{ color: BRAND.text }}>
                      Patient ID: <span className="font-semibold">{p.patient_id || '—'}</span> • 
                      Contact: <span className="font-semibold">{p.contact || '—'}</span> • 
                      Address: <span className="font-semibold">{p.address || '—'}</span>
                    </p>
                  </div>
                  <div className="flex gap-3"> {/* Group buttons */}
                    <button
                      onClick={() => startEditing(p)}
                      className="rounded-xl px-4 py-2 font-semibold text-white"
                      style={{ background: BRAND.text }}
                    >
                      Edit
                    </button>

                    {/* Delete Button - Pass the database ID (p.id) */}
                    <button
                      onClick={() => handleDeleteClick(p.id)} 
                      className="rounded-xl px-4 py-2 font-semibold text-white transition-colors"
                      style={{ backgroundColor: '#cb4c4e' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Latest Vitals Card - Show for all patients */}
                {/* NOTE: latestVitals will only be correct for the currentPatient */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border p-5" style={{ background: BRAND.bg, color: BRAND.text, borderColor: BRAND.border }}>
                    <div className="text-sm opacity-90">Heart Rate</div>
                    <div className="mt-2 text-3xl font-extrabold tabular-nums">{p.latest_vitals?.heart_rate ?? '—'}</div>
                    <div className="mt-1 text-xs opacity-80">BPM</div>
                  </div>
                  <div className="rounded-2xl border p-5" style={{ background: BRAND.bg, color: BRAND.text, borderColor: BRAND.border }}>
                    <div className="text-sm opacity-90">Temperature</div>
                    <div className="mt-2 text-3xl font-extrabold tabular-nums">{p.latest_vitals?.temperature ?? '—'}</div>
                    <div className="mt-1 text-xs opacity-80">°C</div>
                  </div>
                  <div className="rounded-2xl border p-5" style={{ background: BRAND.bg, color: BRAND.text, borderColor: BRAND.border }}>
                    <div className="text-sm opacity-90">SpO₂</div>
                    <div className="mt-2 text-3xl font-extrabold tabular-nums">{p.latest_vitals?.oxygen_saturation ?? '—'}</div>
                    <div className="mt-1 text-xs opacity-80">%</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <GradientHeader icon={accIcon}>Personal Information</GradientHeader>

                <div
                  className="mt-3 rounded-2xl overflow-hidden border relative"
                  style={{ borderColor: BRAND.border }}
                >
                  <img src={accIcon} alt="Account" className="absolute right-6 top-6 h-8 w-8 opacity-10" />
                  <table className="min-w-full text-sm" style={{ background: BRAND.bg, color: BRAND.text }}>
                    <tbody>
                      <tr className="border-b" style={{ borderColor: BRAND.border }}>
                        <th className="px-4 py-3 text-left w-52">First Name</th>
                        <td className="px-4 py-3">
                          <input
                            value={currentPatient.first_name || ''}
                            onChange={(e) =>
                              setCurrentPatient({ ...currentPatient, first_name: e.target.value })
                            }
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                            required
                          />
                        </td>
                        <th className="px-4 py-3 text-left w-40">Middle Initial</th>
                        <td className="px-4 py-3">
                          <input
                            value={currentPatient.middle_initial || ''}
                            onChange={(e) =>
                              setCurrentPatient({ ...currentPatient, middle_initial: e.target.value })
                            }
                            maxLength={1}
                            placeholder="Optional"
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                          />
                        </td>
                      </tr>

                      <tr className="border-b" style={{ borderColor: BRAND.border }}>
                        <th className="px-4 py-3 text-left">Last Name</th>
                        <td className="px-4 py-3">
                          <input
                            value={currentPatient.last_name || ''}
                            onChange={(e) =>
                              setCurrentPatient({ ...currentPatient, last_name: e.target.value })
                            }
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                            required
                          />
                        </td>
                        <th className="px-4 py-3 text-left w-40">Sex</th>
                        <td className="px-4 py-3">
                          <select
                            value={currentPatient.sex || 'Male'}
                            onChange={(e) =>
                              setCurrentPatient({ ...currentPatient, sex: e.target.value })
                            }
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
                            value={currentPatient.address || ''}
                            onChange={(e) =>
                              setCurrentPatient({ ...currentPatient, address: e.target.value })
                            }
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                          />
                        </td>
                        <th className="px-4 py-3 text-left">Birthdate</th>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={currentPatient.birthdate || ''}
                            onChange={(e) =>
                              setCurrentPatient({ ...currentPatient, birthdate: e.target.value })
                            }
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                          />
                        </td>
                      </tr>

                      <tr>
                        <th className="px-4 py-3 text-left">Contact Number</th>
                        <td className="px-4 py-3">
                          <input
                            value={currentPatient.contact || ''}
                            onChange={(e) =>
                              setCurrentPatient({ ...currentPatient, contact: e.target.value })
                            }
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: BRAND.border }}
                          />
                        </td>
                        <th className="px-4 py-3 text-left">Patient ID</th>
                        <td className="px-4 py-3">
                          <input
                            value={currentPatient.patient_id || ''}
                            disabled
                            className="w-full rounded-lg border px-3 py-2 bg-slate-100"
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
                      onChange={(e) => setBpInput(e.target.value)}
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
                <div
                  className="mt-3 rounded-2xl overflow-hidden border relative"
                  style={{ borderColor: BRAND.border }}
                >
                  <img src={historyIcon} alt="History" className="absolute right-6 top-6 h-8 w-8 opacity-10" />
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
                          <td className="px-4 py-3">{r.heart_rate ? `${r.heart_rate} bpm` : '—'}</td>
                          <td className="px-4 py-3">{r.oxygen_saturation ?? '—'}</td>
                          <td className="px-4 py-3">{r.temperature ?? '—'}</td>
                          <td className="px-4 py-3">{r.BMI ?? '—'}</td>
                          <td className="px-4 py-3">{r.blood_pressure ?? '—'}</td>
                        </tr>
                      ))}
                      {!history.length && (
                        <tr>
                          <td className="px-4 py-6 text-center" colSpan={8}>
                            No history yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

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

      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
          <h3 className="text-lg font-bold text-slate-800">
            Are you sure you want to delete this record?
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 rounded-xl text-white font-semibold"
              style={{ backgroundColor: '#cb4c4e' }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </section>
  )
}