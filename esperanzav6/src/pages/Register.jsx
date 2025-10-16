// Register.jsx
// This page provides a registration form for new patients,
// including biometric fingerprint capture (placeholder implementation lang).

import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bgRegister from '../assets/bgreg.png'
import fingerPrint from '../assets/fingerprint-sensor.png'

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export default function Register() {
  const nav = useNavigate()
  const [creating, setCreating] = useState(false)

  // Name fields is split
  const [first_name, setFirstName] = useState('')
  const [middle_initial, setMiddleInitial] = useState('') 
  const [last_name, setLastName] = useState('')

  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Male')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [month, setMonth] = useState(months[0])
  const [day, setDay] = useState(1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')

  // Biometric
  const [fpStatus, setFpStatus] = useState('idle')
  const [fpPreview, setFpPreview] = useState(null)
  const requireFingerprint = false

  const dob = useMemo(() => {
    const m = String(months.indexOf(month) + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }, [month, day, year])

  // // Generate Patient ID "P-YYYYMMDD-XXX"
  // const makePatientId = () => {
  //   const today = new Date()
  //   const y = today.getFullYear()
  //   const m = String(today.getMonth() + 1).padStart(2, '0')
  //   const d = String(today.getDate()).padStart(2, '0')
  //   const last = parseInt(localStorage.getItem('patientIdSeq') || '0', 10) || 0
  //   const nextNum = (last % 999) + 1
  //   localStorage.setItem('patientIdSeq', String(nextNum))
  //   return `P-${y}${m}${d}-${String(nextNum).padStart(3, '0')}`
  // }

  // Fingerprint capture (demo)
  const startFingerprintCapture = async () => {
    setFpStatus('capturing')
    setFpPreview(null)
    await new Promise(r => setTimeout(r, 1800))
    const fakeTemplate = {
      vendor: 'demo',
      version: 1,
      capturedAt: new Date().toISOString(),
      data: Math.random().toString(36).slice(2),
    }
    localStorage.setItem('fingerprintTemplate', JSON.stringify(fakeTemplate))
    setFpPreview(fingerPrint)
    setFpStatus('enrolled')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (requireFingerprint && fpStatus !== 'enrolled') {
      alert('Please capture fingerprint before registering.')
      return
    }
    if (!first_name.trim() || !last_name.trim()) {
      alert('Please enter first and last name.')
      return
    }

    setCreating(true)

    const patientProfile = {
    first_name: first_name.trim(),
    middle_initial: middle_initial.trim(),
    last_name: last_name.trim(),
    gender: gender,
    birthdate: dob,  // Uses the useMemo calculated value
    contact: phone.trim(),
    address: address.trim(),
    username: username.trim(),
    pin: pin
  }

    try {
      // Register the patient
      const registerRes = await fetch('http://localhost:8000/patients/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(patientProfile),
      })
      
      if (!registerRes.ok) {
        const err = await registerRes.json()
        alert("Failed to register patient:\n" + JSON.stringify(err, null, 2))
        setCreating(false)
        return
      }

      const registerData = await registerRes.json()
      
      // Log the user in immediately after registration
      const loginRes = await fetch('http://localhost:8000/login/', {  // Fixed URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          pin: pin,
          login_type: 'patient'  
        }),
      })

      if (!loginRes.ok) {
        alert("Registration successful but login failed. Please login manually.")
        setCreating(false)
        nav('/login')
        return
      }

      // Now the user is authenticated with a session cookie
      sessionStorage.setItem('isAuthenticated', 'true')

      setCreating(false)
      nav('/vitals/weight', { state: { afterCaptureGoTo: '/records' } })
      
    } catch (err) {
      alert("Network error: " + err.message)
      setCreating(false)
    }
  }
  

  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-4 py-16 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgRegister})` }}
    >
      <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-xl p-6 md:p-10">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-700 mb-8">
          Register
        </h2>

        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <form onSubmit={submit} className="grid gap-6">
            {/* Name: First, Middle, Last*/}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-semibold text-slate-700">First Name</label>
                <input
                  value={first_name}
                  onChange={e=>setFirstName(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Middle Initial</label>
                <input
                  value={middle_initial}
                  onChange={e=>{
                    const v = e.target.value.replace(/[^A-Za-z]/g,'').slice(0,1).toUpperCase()
                    setMiddleInitial(v)
                    }}
                    maxLength={1}
                    placeholder="A (optional)"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                  />
                  </div>
                  <div>
                  <label className="text-sm font-semibold text-slate-700">Last Name</label>
                  <input
                    value={last_name}
                    onChange={e=>setLastName(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                  />
                  </div>
                </div>

                {/* Gender / Birthdate */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Gender</label>
                    <select
                      value={gender}
                      onChange={e=>setGender(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Birthdate</label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <select
                        value={month}
                        onChange={e=>setMonth(e.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2.5"
                      >
                        {months.map(m => <option key={m}>{m}</option>)}
                      </select>
                      <select
                        value={day}
                        onChange={e=>setDay(Number(e.target.value))}
                        className="rounded-xl border border-slate-300 px-3 py-2.5"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d}>{d}</option>)}
                      </select>
                      <select
                        value={year}
                        onChange={e=>setYear(Number(e.target.value))}
                        className="rounded-xl border border-slate-300 px-3 py-2.5"
                      >
                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact / Address */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <input
                      value={phone}
                      onChange={e=>setPhone(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Address</label>
                    <input
                      value={address}
                      onChange={e=>setAddress(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    />
                  </div>
                </div>


            {/* Username / PIN */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-slate-700">Username</label>
                <input
                  value={username}
                  onChange={e=>setUsername(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">4-Digit PIN</label>
                <input
                  value={pin}
                  onChange={e=>setPin(e.target.value.replace(/\D/g, '').slice(0,4))}
                  required
                  maxLength={4}
                  inputMode="numeric"
                  pattern="\d{4}"
                  type="password"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                />
              </div>
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={creating || (requireFingerprint && fpStatus !== 'enrolled')}
                className="mt-6 bg-emerald-700 hover:bg-teal-700 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl shadow-md"
              >
                {creating ? 'Creating Account...' : 'Register'}
              </button>
            </div>
          </form>

          {/* Biometric card */}
          <aside className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <h3 className="text-lg font-extrabold text-emerald-800">Biometric Enrollment</h3>
            <p className="mt-1 text-sm text-emerald-900/80">
              Capture the patient’s fingerprint. Placeholder only — will wire up sensor later.
            </p>

            <div className="mt-5 grid place-items-center">
              <div className="h-32 w-32 rounded-full bg-white border-2 border-emerald-300 grid place-items-center overflow-hidden">
                {fpStatus === 'capturing' && <div className="h-8 w-8 animate-ping rounded-full bg-emerald-400" />}
                {fpStatus === 'idle' && <div className="text-emerald-700/80 text-sm">No scan</div>}
                {fpStatus === 'enrolled' && fpPreview && (
                  <img src={fpPreview} alt="Fingerprint preview" className="h-full w-full object-contain" />
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm">
                Status:{' '}
                <span className={`font-semibold ${
                  fpStatus === 'enrolled' ? 'text-emerald-700' :
                  fpStatus === 'capturing' ? 'text-emerald-600' : 'text-slate-600'
                }`}>
                  {fpStatus === 'idle' && 'Not enrolled'}
                  {fpStatus === 'capturing' && 'Capturing…'}
                  {fpStatus === 'enrolled' && 'Enrolled'}
                </span>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {fpStatus !== 'capturing' && (
                <button
                  type="button"
                  onClick={startFingerprintCapture}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2"
                >
                  {fpStatus === 'enrolled' ? 'Re-capture' : 'Start Capture'}
                </button>
              )}
              {fpStatus === 'capturing' && (
                <button type="button" disabled className="rounded-xl bg-emerald-600/70 text-white font-semibold px-4 py-2">
                  Capturing…
                </button>
              )}
              {fpStatus === 'enrolled' && (
                <div className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-emerald-800 text-sm">
                  Fingerprint saved
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
