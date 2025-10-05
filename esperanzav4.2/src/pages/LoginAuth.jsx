// LoginAuth.jsx
// Page for handling login authentication via PIN or fingerprint


import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NumPad from '../components/NumPad'
import FingerprintScanner from '../components/FingerprintScanner'
import pinIcon from '../assets/dialpadalt.png'
import fingerprintIcon from '../assets/fingerprint.png'

export default function LoginAuth() {
  const { state } = useLocation()
  const role = state?.role || 'patient'
  const nav = useNavigate()

  // UI state
  const [mode, setMode] = useState(null)          // 'pin' | 'fp' | null
  const [pin, setPin] = useState('')              // 4 digits from NumPad
  const [username, setUsername] = useState('')    // only used for patients
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  
  // // Load saved patient profile from localStorage (placeholder for real auth)
  // const savedPatient = useMemo(() => {
  //   try { return JSON.parse(localStorage.getItem('patientProfile') || 'null') || null }
  //   catch { return null }
  // }, [])

  // const completeLogin = () => {
  //   if (role === 'staff') {
  //     nav('/staff')
  //   } else {
  //     nav('/portal')
  //   }
  // }
  const authenticateUser = async (enteredPin, loginType) => {
    if (isAuthenticating) return; // Prevent double submission
    if (loginType === 'patient' && username.trim().length === 0) {
      alert('Please enter your username.')
      return
    }

    setIsAuthenticating(true)
    
    try {
      // Include the username in the body for patient login
      const bodyData = {
        pin: enteredPin,
        login_type: loginType,
        // Send username for patient-specific login
        ...(loginType === 'patient' && { username: username.trim() })
      }

      const res = await fetch(`http://127.0.0.1:8000/login/`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( bodyData )
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Authentication failed')
      }

      const userData = await res.json()

      // Verify that the returned role matches the expected login type
      if (userData.role !== loginType) {
        throw new Error(`Access denied: You don't have ${loginType} privileges`)
      }

      sessionStorage.setItem("user", JSON.stringify(userData)) // Store entire user data
      // Navigate based on actual role
      if (userData.role === 'staff') {
        nav('/staff')
      } else if (userData.role === 'patient') {
        sessionStorage.setItem('authenticatedPatient', JSON.stringify(userData.patient))
        nav('/portal')
      }
      
    } catch (err) {
      alert(err.message || 'Authentication failed')
      setPin('') // Clear the PIN on error
    } finally {
      setIsAuthenticating(false)
    }
  }

  const onKey = (k) => {
    if (isAuthenticating) return // Stop input during authentication

    if (k === '⌫') {
      setPin(p => p.slice(0, -1))
      return
    }
    if (/[0-9]/.test(k) && pin.length < 4) {
      const newPin = pin + k;
      setPin(newPin); 
      // Auto-submit when the 4th digit is entered
      if (newPin.length === 4) {
          authenticateUser(newPin, role); 
      }
      return
    }
    
    if (k === 'Enter' && pin.length === 4) {
      authenticateUser(pin, role);
    }
  }

  const onFpDone = () => {
    if (role === 'staff') nav('/staff')
    else nav('/portal')
  }

  const tile =
    "group rounded-3xl bg-[#6ec1af] hover:bg-emerald-800/70 transition-all " +
    "border border-emerald-500/60 shadow-lg hover:shadow-xl overflow-hidden px-6 py-10"

  const pinReady = role === 'staff' ? pin.length === 4 : (username.trim() && pin.length === 4)

  return (
    <section className="mx-auto max-w-5xl px-4 pt-20 pb-16">
      <div className="text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-wide leading-snug 
                   bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 
                   bg-clip-text text-transparent">
          {role === 'staff' ? 'Staff Login' : 'Patient Login'}
        </h2>
        <p className="mt-1 text-slate-600 text-center">Choose a login method</p>
      </div>

      {!mode && (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button className={tile} onClick={() => setMode('pin')}>
            <div className="flex flex-col items-center text-white">
              <div className="grid place-items-center h-36 w-full">
                <img src={pinIcon} alt="PIN" className="h-28 w-28 object-contain opacity-95 drop-shadow" />
              </div>
              <div className="mt-4 text-2xl font-extrabold drop-shadow">PIN</div>
            </div>
          </button>

          <button className={tile} onClick={() => setMode('fp')}>
            <div className="flex flex-col items-center text-white">
              <div className="grid place-items-center h-36 w-full">
                <img src={fingerprintIcon} alt="Fingerprint" className="h-28 w-28 object-contain opacity-95 drop-shadow" />
              </div>
              <div className="mt-4 text-2xl font-extrabold drop-shadow">Fingerprint</div>
            </div>
          </button>
        </div>
      )}

      {mode === 'pin' && (
        <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 items-start">
          <div className="card">
            {role === 'patient' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700">Username</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  autoComplete="username"
                />
              </div>
            )}

            <label className="block text-sm font-medium text-slate-700">4-Digit PIN</label>
            <input
              value={pin}
              readOnly
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-2xl tracking-widest text-center bg-white"
            />
            <p className="mt-2 text-xs text-slate-500">
              {pinReady ? 'Press Enter on the keypad to continue.' :
               role === 'staff' ? 'Enter your 4-digit PIN.' :
               'Enter your username and 4-digit PIN.'}
            </p>
          </div>
          <NumPad onKey={onKey} />
        </div>
      )}

      {mode === 'fp' && (
        <div className="mt-10 card">
          <FingerprintScanner onComplete={onFpDone} />
        </div>
      )}
    </section>
  )
}
