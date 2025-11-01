// Temperature.jsx
// SECURE VERSION: Uses Django sessions only (no sessionStorage for patient_id)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SmallModal from '../../components/SmallModal';
import ResultCard from '../../components/ResultCard';
import { initModalDelay, SESSION_KEYS } from './utils';
import TemperaturePic from '../../assets/temperature.png';

const API_BASE_URL = 'http://localhost:8000';

export default function Temperature() {
  const nav = useNavigate();
  const [temp, setTemp] = useState(null);
  const [showInit, setShowInit] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);

  // Step 1: Get patient_id from Django session (secure)
  useEffect(() => {
    const fetchPatientSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/patient/profile/`, {
          credentials: 'include'  // Send session cookie
        });

        if (!response.ok) {
          // Session expired or not authenticated
          nav('/login');
          return;
        }

        const data = await response.json();
        setPatientId(data.patient_id);  // Get from server, not localStorage
        
      } catch (err) {
        console.error('Session error:', err);
        setError('Authentication error. Please log in again.');
        setTimeout(() => nav('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientSession();
  }, [nav]);

  // Step 2: Fetch temperature once we have patient_id
  const fetchTemperature = async () => {
    if (!patientId) {
      setError('Patient ID not found');
      return;
    }

    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/vitals/by_patient/?patient_id=${patientId}`,
        { credentials: 'include' }  // Always include credentials
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched vitals:', data);

      if (data && data.length > 0) {
        const latestVital = data[0];
        
        if (latestVital.temperature) {
          const temperature = Number(latestVital.temperature);
          setTemp(temperature);
          sessionStorage.setItem(SESSION_KEYS.temp, String(temperature));
        } else {
          setError('No temperature data available');
        }
      } else {
        setError('No vital signs found. Please take measurements first.');
      }
    } catch (err) {
      console.error('Error fetching temperature:', err);
      setError('Failed to fetch temperature data');
    }
  };

  // Auto-fetch when patient_id is ready
  useEffect(() => {
    if (patientId) {
      fetchTemperature();
    }
  }, [patientId]);

  // Manual start (for RPi integration)
  const start = () => {
    setShowInit(true);
    
    setTimeout(() => {
      fetchTemperature();
      setShowInit(false);
    }, initModalDelay);
  };

  const ready = temp != null;

  // Show loading while fetching session
  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent text-center">
        Step 4: Temperature
      </h2>
      <p className="mt-3 text-center text-slate-700">
        Point the infrared thermometer and wait for the reading.
      </p>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchTemperature}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

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
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchTemperature}
              className="rounded-xl bg-slate-500 px-6 py-3 font-semibold text-white hover:bg-slate-600"
            >
              Refresh
            </button>
            <button
              onClick={() => nav('/vitals')}
              className="rounded-xl bg-[#6ec1af] px-6 py-3 font-semibold text-white hover:bg-emerald-800/70"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <SmallModal open={showInit}>
        <p className="text-xl font-semibold text-slate-800">Reading temperature...</p>
        <p className="mt-1 text-slate-600">Hold steady.</p>
      </SmallModal>
    </section>
  );
}