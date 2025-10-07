import React from 'react'

export default function Footer(){
  return (
    <footer className="border-t border-slate-200 bg-white/50 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} All Rights Reserved</p>
      </div>
    </footer>
  )
}
