// This component simulates a fingerprint scanning process with a progress bar and animation.

import React, { useEffect, useState } from 'react'

export default function FingerprintScanner({ onComplete = ()=>{} }){
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        const next = Math.min(100, p + 5)
        if(next === 100){
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
        <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-white">
          <svg viewBox="0 0 84  84" className="h-24 w-24 opacity-80">
            <circle cx="42" cy="42" r="38" stroke="#10b981" strokeWidth="2" fill="none" />
            <path d="M22 46c8-6 12-6 20 0s12 6 20 0" stroke="#0ea5a4" strokeWidth="2" fill="none" />
            <path d="M22 38c8-6 12-6 20 0s12 6 20 0" stroke="#16a34a" strokeWidth="2" fill="none" />
          </svg>
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
        <div className="h-full bg-brand-500" style={{width: progress + '%'}} />
      </div>
    </div>
  )
}
