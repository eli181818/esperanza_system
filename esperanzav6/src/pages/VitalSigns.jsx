// VitalSigns.jsx
// This page displays the results of a patient's vitals capture session,
// including heart rate, temperature, oxygen saturation, height, weight, and BMI.
// It also generates a unique queuing number for the patient and allows printing of results (placeholder).

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import printIcon from '../assets/printer.png'

export default function VitalSigns() {
  const [step, setStep] = useState(3) 
  const [queue, setQueue] = useState('001')
  const [showPrinting, setShowPrinting] = useState(false)
  const [showFinished, setShowFinished] = useState(false)
  const nav = useNavigate()
  const location = useLocation()

  // --- profile ---
  const profile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('patientProfile') || 'null')
    } catch {
      return null
    }
  }, [])

  // --- mock sensor values ---
  const [results] = useState(() => ({
    heartRate: Math.floor(Math.random() * (96 - 60 + 1)) + 60,
    temperature: (36 + Math.random() * 1.2).toFixed(1) * 1,
    spo2: Math.floor(Math.random() * (99 - 95 + 1)) + 95,
    height: Math.round((155 + Math.random() * 30) * 10) / 10,
    weight: Math.round((48 + Math.random() * 22) * 10) / 10,
  }))

  const bmi = useMemo(() => {
    const h = results.height / 100
    return (results.weight / (h * h)).toFixed(1)
  }, [results.height, results.weight])

  // --- queue number (reset daily) ---
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const savedDate = localStorage.getItem('queueDate')
    let last = 0

    if (savedDate === today) {
      last = parseInt(localStorage.getItem('queueNo') || '0', 10)
    } else {
      localStorage.setItem('queueDate', today)
      localStorage.setItem('queueNo', '0')
    }

    const next = (last % 999) + 1
    localStorage.setItem('queueNo', String(next))
    setQueue(String(next).padStart(3, '0'))
  }, [])

  
  const savedRef = useRef(false)
  useEffect(() => {
    if (step !== 3 || savedRef.current) return

    // latest vitals
    localStorage.setItem(
      'latestVitals',
      JSON.stringify({
        heartRate: results.heartRate,
        temperature: results.temperature,
        spo2: results.spo2,
        height: results.height,
        weight: results.weight,
        bmi: Number(bmi),
      })
    )

    const record = {
      id: `${new Date().toISOString()}-${queue}`,
      date: new Date().toISOString().slice(0, 10),
      hr: results.heartRate,
      bp: '118/76',
      temp: `${results.temperature} °C`,
      spo2: `${results.spo2}%`,
      name: profile?.name ?? '—',
      patientId: profile?.patientId ?? '—',
      queue,
    }

    const history = JSON.parse(localStorage.getItem('vitalsHistory') || '[]')
    history.unshift(record)
    localStorage.setItem('vitalsHistory', JSON.stringify(history))

    savedRef.current = true
  }, [step, results, bmi, queue, profile])

  
  const handlePrint = () => {
    setShowPrinting(true)
    setTimeout(() => {
      window.print()
      setShowPrinting(false)
      setShowFinished(true)
    }, 2000) 
  }

  const Stat = ({ label, value, unit }) => (
    <div className="rounded-2xl bg-slate-50 border p-6">
      <p className="text-center text-slate-600">{label}</p>
      <p className="mt-2 text-center text-3xl font-extrabold text-slate-900 tabular-nums">
        {value}
      </p>
      {unit && <p className="mt-1 text-center text-slate-500 text-xs">{unit}</p>}
    </div>
  )

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-700 bg-clip-text text-transparent leading-tight">
        Vitals Capture <span className="text-emerald-600">Complete!</span>
      </h2>
      <p className="mt-2 text-center text-slate-700">
        Below are the results of your vitals today.
      </p>

      {step === 3 && (
        <>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6">
              <p className="text-center text-slate-600">Your Queuing Number</p>
              <p className="mt-2 text-center text-5xl md:text-6xl font-extrabold text-emerald-800 tabular-nums">
                {queue}
              </p>
            </div>
            <Stat label="Weight" value={results.weight} unit="kg" />
            <Stat label="Height" value={results.height} unit="cm" />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-4">
            <Stat label="Heart Rate" value={results.heartRate} unit="bpm" />
            <Stat label="Oxygen Saturation" value={results.spo2} unit="%" />
            <Stat label="Temperature" value={results.temperature} unit="°C" />
            <Stat label="BMI" value={bmi} unit="kg/m²" />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/records"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3"
            >
              Go to Records
            </Link>
            <button
              onClick={handlePrint}
              className="rounded-xl border border-slate-300 hover:bg-slate-50 px-5 py-3 font-semibold text-slate-800 inline-flex items-center gap-2"
            >
              <img src={printIcon} alt="Print" className="h-5 w-5" />
              Print Results
            </button>
          </div>
        </>
      )}

      
      {showPrinting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <p className="text-xl font-bold text-emerald-700">Printing...</p>
          </div>
        </div>
      )}

      
      {showFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center max-w-sm">
            <p className="text-lg font-semibold text-slate-800">
              Please get your printed results and queuing number below.
            </p>
            <button
              onClick={() => nav('/records')}
              className="mt-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5"
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
