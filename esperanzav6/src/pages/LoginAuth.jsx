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
  const [mode, setMode] = useState(null)          
  const [pin, setPin] = useState('')              
  const [username, setUsername] = useState('')    
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const authenticateUser = async (enteredPin, loginType) => {
    if (isAuthenticating) return
    if (loginType === 'patient' && username.trim().length === 0) {
      alert('Please enter your username.')
      return
    }

    setIsAuthenticating(true)
    
    try {
      const res = await fetch(`http://localhost:8000/login/`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json" },
        credentials: 'include',  // Send cookies
        body: JSON.stringify({
          pin: enteredPin,  
          login_type: loginType,
          ...(loginType === 'patient' && { username: username.trim() })
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Authentication failed')
      }

      const userData = await res.json()

      // Store ONLY minimal info for UI display
      if (userData.role === 'patient') {
        sessionStorage.setItem('patientName', userData.name)
        sessionStorage.setItem('isAuthenticated', 'true')
        nav('/portal')
      } else if (userData.role === 'staff') {
        sessionStorage.setItem('staffName', userData.name)
        sessionStorage.setItem('isAuthenticated', 'true')
        nav('/staff')
      }
      
    } catch (err) {
      alert(err.message || 'Authentication failed')
      setPin('')
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

  // const onFpDone = () => completeLogin()
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
