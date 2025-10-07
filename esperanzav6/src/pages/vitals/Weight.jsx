// Weight.jsx
// Page for measuring and displaying weight

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmallModal from '../../components/SmallModal';
import ResultCard from '../../components/ResultCard';
import { initModalDelay, SESSION_KEYS } from './utils';
import WeightImg from '../../assets/weight2.png';

export default function Weight() {
  const nav = useNavigate();
  const [value, setValue] = useState(null);
  const [showInit, setShowInit] = useState(false);

  const start = () => {
    setShowInit(true);
    setTimeout(() => {
      setShowInit(false);
      // mock reading (replace with real sensor)
      const w = Math.round((48 + Math.random() * 22) * 10) / 10;
      setValue(w);
      sessionStorage.setItem(SESSION_KEYS.weight, String(w));
    }, initModalDelay);
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent text-center">
        Step 1: Weight
      </h2>
      <p className="mt-3 text-center text-slate-700">
        Step carefully onto the platform. Stand still and wait for your weight to display.
      </p>

      
      {!value && (
        <div className="mt-6 flex justify-center">
          <img
            src={WeightImg}
            alt="Weight procedure"
            className="max-h-64 w-auto rounded-xl border border-slate-200 shadow-md"
          />
        </div>
      )}

      {/* Results Section */}
      {!value ? (
        <div className="mt-8 text-center">
          <button
            onClick={start}
            className="rounded-xl bg-[#6ec1af] px-6 py-3 font-semibold text-white hover:bg-emerald-800/70"
          >
            Start
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-6 text-center">
          <ResultCard label="Weight" value={value} unit="kg" />
          <button
            onClick={() => nav('/vitals/height')}
            className="rounded-xl bg-[#6ec1af] px-6 py-3 font-semibold text-white hover:bg-emerald-800/70"
          >
            Continue
          </button>
        </div>
      )}

      <SmallModal open={showInit}>
        <p className="text-xl font-semibold text-slate-800">Initializing weight…</p>
        <p className="mt-1 text-slate-600">Please stand still.</p>
      </SmallModal>
    </section>
  );
}
