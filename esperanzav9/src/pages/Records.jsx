// Records.jsx
// Page for patients to DISPLAY patient records and vitals

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import heartRateIcon from '../assets/heart-rate.png'
import temperatureIcon from '../assets/thermometer.png'
import bloodPressureIcon from '../assets/blood-pressure.png'
import spo2Icon from '../assets/oxygen-saturation.png'
import heightIcon from '../assets/height.png'
import weightIcon from '../assets/weight.png'
import bmiIcon from '../assets/body-mass-index.png'
import printIcon from '../assets/printer.png'
import logoutIcon from '../assets/logout.png'

export default function Records() {
  const [profile, setProfile] = useState(null)
  const [latest, setLatest] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const { username } = useParams();
  const nav = useNavigate()

  const calcAge = (dobStr) => {
    if (!dobStr) return null
    const dob = new Date(dobStr)
    if (Number.isNaN(dob.getTime())) return null
    
    const t = new Date()
    let age = t.getFullYear() - dob.getFullYear()
    const m = t.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && t.getDate() < dob.getDate())) age--
    return age
  }

  const initialsOf = (name = '') =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s[0]?.toUpperCase())
      .join('') || 'PT'
  
  useEffect(() => {
    const loadAuthenticatedData = async () => {
      try {
        // Fetch profile from backend 
        const profileRes = await fetch('http://localhost:8000/patient/profile/', {
          credentials: 'include'  // Send session cookie
        })

        if (profileRes.status === 401) {  // Unauthorized
          nav('/login')
          return
        }

        const patientData = await profileRes.json()
        const calculatedAge = calcAge(patientData.birthdate)

        setProfile({
          first_name: patientData.first_name,
          last_name: patientData.last_name,
          middle_initial: patientData.middle_initial,
          name: `${patientData.first_name}${patientData.middle_initial ? ' ' + patientData.middle_initial + '.' : ''} ${patientData.last_name}`,
          patientId: patientData.patient_id,
          contact: patientData.contact,
          dob: patientData.birthdate,
          age: calculatedAge
        })

        if (patientData.username && username !== patientData.username) {
          nav(`/records/${patientData.username}`, { replace: true })
        }

        // Fetch vitals from backend
        const vitalsRes = await fetch('http://localhost:8000/patient/vitals/', {
          credentials: 'include'
        })

        if (vitalsRes.ok) {
          const vitalsData = await vitalsRes.json()
          
          // Set latest vitals
          if (vitalsData.latest) {
            setLatest({
              heartRate: vitalsData.latest.heart_rate,
              temperature: vitalsData.latest.temperature,
              spo2: vitalsData.latest.spo2,
              bloodPressure: vitalsData.latest.blood_pressure,
              height: vitalsData.latest.height,
              weight: vitalsData.latest.weight,
              bmi: vitalsData.latest.bmi
            })
          }

          // Set history
          if (vitalsData.history) {
            setRows(vitalsData.history)
          }
        }

        setLoading(false)

      } catch (err) {
        console.error('Error loading patient data:', err)
        alert('Error loading patient data. Please login again.')
        nav('/login')
      }
    }

    loadAuthenticatedData()
  }, [nav])

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/logout/', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error:', err)
    }
    
    sessionStorage.clear()
    nav('/login')
  }

  const printLatest = () => window.print()

  const Card = ({ label, icon, value, unit, alt }) => (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{label}</span>
        {icon && (
          <img
            src={icon}
            alt={alt || `${label} icon`}
            className="h-5 w-5 object-contain select-none"
            draggable="false"
          />
        )}
      </div>
      <div className="mt-3 text-3xl font-extrabold text-slate-900 tabular-nums">
        {value ?? '—'}
      </div>
      {unit && <div className="mt-1 text-xs text-slate-500">{unit}</div>}
    </div>
  )

  // Loading state
  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-600"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  const ageDisplay = profile.age ?? '—'

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-16"> 
      <button
        onClick={handleLogout}
        className="absolute right-4 top-4 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800 shadow hover:bg-slate-50"
      >
        <img src={logoutIcon} alt="Logout" className="h-4 w-4 object-contain" />
        <span className="font-medium">Logout</span>
      </button>

      {/* Patient info */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
            {initialsOf(profile.name)}
          </div>
          <div className="min-w-[16rem]">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
              {profile.name}
            </h2>
            <p className="text-sm text-slate-600">
              Patient ID: <span className="font-medium">{profile.patientId}</span> •&nbsp;
              Age: <span className="font-medium">{ageDisplay}</span> •&nbsp;
              Contact: <span className="font-medium">{profile.contact}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Latest vitals header */}
      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-2xl font-extrabold text-slate-900">Your Latest Vitals</h3>
        <button
          onClick={printLatest}
          className="print:hidden inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-slate-800 hover:bg-slate-50"
        >
          <img src={printIcon} alt="" className="h-4 w-4 object-contain" />
          <span>Print Vitals</span>
        </button>
      </div>

      {/* Latest vitals cards - Now with 7 cards including Blood Pressure */}
      <div className="mt-4 grid gap-4 md:grid-cols-3 print:gap-2">
        <Card 
          label="Heart Rate" 
          icon={heartRateIcon} 
          alt="Heart rate" 
          value={latest?.heartRate} 
          unit="BPM" 
        />
        <Card 
          label="Temperature" 
          icon={temperatureIcon} 
          alt="Temperature" 
          value={latest?.temperature} 
          unit="°C" 
        />
        <Card 
          label="Oxygen Saturation" 
          icon={spo2Icon} 
          alt="Oxygen saturation" 
          value={latest?.spo2} 
          unit="%" 
        />
        <Card 
          label="Blood Pressure" 
          icon={bloodPressureIcon} 
          alt="Blood Pressure" 
          value={latest?.bloodPressure} 
          unit="mmHg" 
        />
        <Card 
          label="Height" 
          icon={heightIcon} 
          alt="Height" 
          value={latest?.height} 
          unit="cm" 
        />
        <Card 
          label="Weight" 
          icon={weightIcon} 
          alt="Weight" 
          value={latest?.weight} 
          unit="kg" 
        />
        <Card 
          label="BMI" 
          icon={bmiIcon} 
          alt="BMI" 
          value={latest?.bmi} 
          unit="kg/m²" 
        />
      </div>

      {/* Past vitals table - Now with 8 columns */}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white print:hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Heart Rate</th>
              <th className="px-4 py-3">Blood Pressure</th>
              <th className="px-4 py-3">Temperature</th>
              <th className="px-4 py-3">SpO₂</th>
              <th className="px-4 py-3">Height</th>
              <th className="px-4 py-3">Weight</th>
              <th className="px-4 py-3">BMI</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={8}>
                  No history yet.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.id || i} className="border-t border-slate-100">
                  <td className="px-4 py-3">{r.date ?? '—'}</td>
                  <td className="px-4 py-3">
                    {r.heart_rate != null ? `${r.heart_rate} bpm` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {r.blood_pressure ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {typeof r.temperature === 'number' 
                      ? `${r.temperature} °C` 
                      : (r.temperature ?? '—')}
                  </td>
                  <td className="px-4 py-3">
                    {typeof r.spo2 === 'number' 
                      ? `${r.spo2}%` 
                      : (r.spo2 ?? '—')}
                  </td>
                  <td className="px-4 py-3">
                    {typeof r.height === 'number' 
                      ? `${r.height} cm` 
                      : (r.height ?? '—')}
                  </td>
                  <td className="px-4 py-3">
                    {typeof r.weight === 'number' 
                      ? `${r.weight} kg` 
                      : (r.weight ?? '—')}
                  </td>
                  <td className="px-4 py-3">
                    {typeof r.bmi === 'number' 
                      ? `${r.bmi} kg/m²` 
                      : (r.bmi ?? '—')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 hidden text-center text-xs text-slate-500 print:block">
        Printed: {new Date().toLocaleString()}
      </p>
    </section>
  )
}