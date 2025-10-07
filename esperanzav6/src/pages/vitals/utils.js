// this file contains utility functions and constants for the vitals measurement pages

export const initModalDelay = 1200; // ms

export function queueNext() {
  const today = new Date().toISOString().slice(0,10);
  const savedDate = localStorage.getItem('queueDate');
  if (savedDate !== today) {
    localStorage.setItem('queueDate', today);
    localStorage.setItem('queueNo', '0');
  }
  const last = parseInt(localStorage.getItem('queueNo') || '0', 10);
  const next = (last % 999) + 1;
  localStorage.setItem('queueNo', String(next));
  return String(next).padStart(3, '0');
}

// session storage keys used by steps
export const SESSION_KEYS = {
  weight: 'step_weight',
  height: 'step_height',
  hr: 'step_hr',
  spo2: 'step_spo2',
  temp: 'step_temp',
};