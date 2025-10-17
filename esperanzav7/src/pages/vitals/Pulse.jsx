// Pulse.jsx
// Page for measuring and displaying pulse rate

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmallModal from '../../components/SmallModal';
import ResultCard from '../../components/ResultCard';
import { initModalDelay, SESSION_KEYS } from './utils';
import PulseImg from '../../assets/pulse.png';

export default function Pulse() {
  const nav = useNavigate();
  const [hr, setHr] = useState(null);
  const [spo2, setSpo2] = useState(null);
  const [showInit, setShowInit] = useState(false);

  const start = () => {
    setShowInit(true);
    setTimeout(() => {
      setShowInit(false);
      const nextHr = Math.floor(Math.random() * (96 - 60 + 1)) + 60;
      const nextSpo2 = Math.floor(Math.random() * (99 - 95 + 1)) + 95;
      setHr(nextHr);
      setSpo2(nextSpo2);
      sessionStorage.setItem(SESSION_KEYS.hr, String(nextHr));
      sessionStorage.setItem(SESSION_KEYS.spo2, String(nextSpo2));
    }, initModalDelay);
  };

  const ready = hr != null && spo2 != null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent text-center">
        Step 3: Heart Rate &amp; Oxygen Saturation
      </h2>
      <p className="mt-3 text-center text-slate-700">
        Place your fingertip gently on the pulse sensor until the reading stabilizes.
      </p>

      {!ready && (
        <div className="mt-6 flex justify-center">
          <img
            src={PulseImg}
            alt="Pulse procedure"
            className="max-h-64 w-auto rounded-xl border border-slate-200 shadow-md"
          />
        </div>
      )}

      {!ready ? (
        <div className="mt-8 text-center">
          <button
            onClick={start}
            className="rounded-xl bg-[#6ec1af] px-6 py-3 font-semibold text-white hover:bg-emerald-800/70"
          >
            Start
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <ResultCard label="Heart Rate" value={hr} unit="bpm" />
          <ResultCard label="Oxygen Saturation" value={spo2} unit="%" />
          <div className="md:col-span-2 text-center">
            <button
              onClick={() => nav('/vitals/temperature')}
              className="rounded-xl bg-[#6ec1af] px-6 py-3 font-semibold text-white hover:bg-emerald-800/70"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <SmallModal open={showInit}>
        <p className="text-xl font-semibold text-slate-800">Initializing pulse…</p>
        <p className="mt-1 text-slate-600">Keep your hand still.</p>
      </SmallModal>
    </section>
  );
}
