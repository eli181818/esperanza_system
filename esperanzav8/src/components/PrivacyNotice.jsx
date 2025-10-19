import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PrivacyNotice() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setOpen(true);
    setChecked(false);
  }, []);

  const onCheck = (val) => setChecked(val);

  const agree = () => {
    // Close the modal
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Data Privacy Notice"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-2xl md:text-4xl font-bold tracking-wide bg-gradient-to-r from-slate-800 via-teal-700 to-emerald-700 bg-clip-text text-transparent">
          GENERAL PRIVACY NOTICE
        </h2>

        <div className="space-y-3 text-slate-700">
          <p>
            Upon using this device, you acknowledge and agree that we may collect
            and process your personal and vital signs data in accordance with the{" "}
            <strong>Data Privacy Act of 2012 (RA 10173)</strong>. The information
            collected will be used only for legitimate medical purposes,
            particularly for pre-checkup assessments and patient record
            management. Your data will be handled fairly, lawfully, and securely,
            with only the minimum necessary information gathered.
          </p>

          <p>
            Please read our{" "}
            <Link to="/privacy" className="underline hover:opacity-80">
              Privacy Policy
            </Link>{" "}
            to understand how we treat personal data and your rights.
          </p>

          <label className="mt-2 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300"
              checked={checked}
              onChange={(e) => onCheck(e.target.checked)}
            />
            <span>
              I accept the terms in the{" "}
              <Link to="/terms" className="underline hover:opacity-80">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline hover:opacity-80">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <div className="pt-2 flex justify-center">
            <button
              onClick={agree}
              disabled={!checked}
              className="btn btn-primary text-white bg-[#6ec1af] hover:bg-emerald-800/70 transition disabled:opacity-50 disabled:cursor-not-allowed px-10"
            >
              I AGREE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
