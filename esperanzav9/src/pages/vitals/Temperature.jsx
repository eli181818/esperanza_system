// Temperature.jsx
// Page for measuring temperature using a connected thermometer.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmallModal from '../../components/SmallModal';
import ResultCard from '../../components/ResultCard';
import { initModalDelay, SESSION_KEYS } from './utils';
import TemperaturePic from '../../assets/temperature.png';

export default function Temperature() {
  const nav = useNavigate();
  const [temp, setTemp] = useState(null);
  const [showInit, setShowInit] = useState(false);

  const start = () => {
    setShowInit(true);
    setTimeout(() => {
      setShowInit(false);
      const t = Number((36 + Math.random() * 1.2).toFixed(1));
      setTemp(t);
      sessionStorage.setItem(SESSION_KEYS.temp, String(t));
    }, initModalDelay);
  };

  const ready = temp != null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent text-center">
        Step 4: Temperature
      </h2>
      <p className="mt-3 text-center text-slate-700">
        Point the infrared thermometer and wait for the reading.
      </p>

      {!ready && (
        <div className="mt-6 flex justify-center">
          <img
            src={TemperaturePic}
            alt="Temperature procedure"
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
        <div className="mt-8 space-y-6 text-center">
          <ResultCard label="Temperature" value={temp} unit="°C" />
          <button
            onClick={() => nav('/vitals')}
            className="rounded-xl bg-[#6ec1af] px-6 py-3 font-semibold text-white hover:bg-emerald-800/70"
          >
            Continue
          </button>
        </div>
      )}

      <SmallModal open={showInit}>
        <p className="text-xl font-semibold text-slate-800">Initializing temperature…</p>
        <p className="mt-1 text-slate-600">Hold steady.</p>
      </SmallModal>
    </section>
  );
}
