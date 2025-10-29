// FingerprintScanner.jsx
// This component simulates a fingerprint scanning process with a progress bar and animation.

import React, { useEffect, useState } from 'react'
import fingerprint from '../assets/fingerprint.png'

export default function FingerprintScanner({ onComplete = () => {} }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 5)
        if (next === 100) {
          clearInterval(t)
          setTimeout(onComplete, 400)
        }
        return next
      })
    }, 120)
    return () => clearInterval(t)
  }, [onComplete])

  return (
    <div className="flex flex-col items-center">
      <div className="relative size-40 rounded-[28px] border-2 border-brand-500 p-4 bg-white shadow-sm">
        <div className="absolute inset-0 rounded-[26px] animate-pulseGlow"></div>

        <div className="relative flex h-full w-full items-center justify-center rounded-2xl" style={{ backgroundColor: '#6EC1AF' }}>
          <img
            src={fingerprint}
            alt="Fingerprint"
            className="h-24 w-24 object-contain opacity-90 select-none pointer-events-none"
            draggable={false}
          />
          
          <div className="pointer-events-none absolute inset-x-4 top-0 bottom-0 overflow-hidden rounded-xl">
            <div className="absolute inset-x-0 h-6 translate-y-[-100%] animate-scan bg-emerald-400/15 backdrop-blur-[1px]" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-slate-600">
        <span className="font-medium">Scanning</span>
        <span className="inline-flex gap-1 ml-1">
          <span className="animate-dot1">.</span>
          <span className="animate-dot2">.</span>
          <span className="animate-dot3">.</span>
        </span>
      </div>

      <div className="mt-3 w-56 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full bg-brand-500" style={{ width: progress + '%' }} />
      </div>
    </div>
  )
}
