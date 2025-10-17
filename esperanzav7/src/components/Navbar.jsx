// This component is the navigation bar for the application. It includes links to different sections and a login icon.

import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import userIcon from '../assets/user.png'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const navItem = (to, label) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `nav-link px-3 py-2 rounded-lg ${
          isActive ? 'text-brand-700 font-semibold bg-brand-50' : ''
        }`
      }
    >
      {label}
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Esperanza Health Center" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItem('/', 'HOME')}
            {navItem('/services', 'SERVICES')}
            {navItem('/about', 'ABOUT')}
            {navItem('/contact', 'CONTACT')}

            {/* Icon instead of LOGIN text */}
            <Link
              to="/login"
              aria-label="Login"
              className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#6ec1af] hover:bg-emerald-800/70 shadow ring-1 ring-emerald-500/60"
            >
              <img src={userIcon} alt="" className="h-5 w-5 object-contain" />
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            aria-label="Menu"
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex items-center gap-2 animate-floaty">
            <div className="flex flex-col gap-1 grow">
              {navItem('/', 'HOME')}
              {navItem('/services', 'SERVICES')}
              {navItem('/about', 'ABOUT')}
              {navItem('/contact', 'CONTACT')}
            </div>
           
            <Link
              to="/login"
              aria-label="Login"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow ring-1 ring-emerald-500/60"
            >
              <img src={userIcon} alt="" className="h-5 w-5 object-contain" />
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
