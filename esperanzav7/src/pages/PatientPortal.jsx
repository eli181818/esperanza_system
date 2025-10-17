// PatientPortal.jsx
// This component serves as the main portal for patients, allowing them to choose between
// getting their vital signs measured or accessing their medical records.

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import vitalSignsIcon from '../assets/heart-beat.png'
import recordsIcon from '../assets/access-control.png'

export default function PatientPortal() {
  const nav = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const cardClass =
    "group rounded-3xl bg-[#6ec1af] hover:bg-emerald-800/70 transition-all " +
    "border border-emerald-500/60 shadow-lg hover:shadow-xl overflow-hidden px-6 py-10 " +
    "flex flex-col items-center text-white"

  const openModal = (e) => {
    e.preventDefault()
    setShowModal(true)
  }
  const goToVitals = () => {
    setShowModal(false)
    nav('/vitals/weight')
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
          Hello, Patient!
        </h2>
        <p className="mt-2 text-slate-700">What would you like to do today?</p>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 gap-6">
        {/* Vital Signs Card*/}
        <button
          onClick={openModal}
          className={cardClass}
          aria-haspopup="dialog"
          type="button"
        >
          <div className="grid place-items-center h-28 w-full">
            <img
              src={vitalSignsIcon}
              alt="Vital Signs"
              className="h-20 w-20 object-contain opacity-95 drop-shadow"
            />
          </div>
          <h3 className="mt-6 text-2xl font-extrabold">Get Vital Signs</h3>
          <p className="mt-2 text-white/85 text-center">
            Start to capture your vitals.
          </p>
        </button>

        {/* Records Card*/}
        <Link to="/records" className={cardClass}>
          <div className="grid place-items-center h-28 w-full">
            <img
              src={recordsIcon}
              alt="Access Records"
              className="h-20 w-20 object-contain opacity-95 drop-shadow"
            />
          </div>
          <h3 className="mt-6 text-2xl font-extrabold">Access Records</h3>
          <p className="mt-2 text-white/85 text-center">
            View your recent visits and results.
          </p>
        </Link>
      </div>

      {/* Pre-flow modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vitals-modal-title"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 text-center">
            <h4
              id="vitals-modal-title"
              className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-600 bg-clip-text text-transparent"
            >
              To get accurate readings, please follow the steps for measuring your
              vitals carefully.
            </h4>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-slate-800 hover:bg-slate-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={goToVitals}
                className="rounded-xl bg-[#6ec1af] hover:bg-emerald-800/70 px-5 py-2.5 text-white font-semibold"
                type="button"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
