import React from "react";
import { Link } from "react-router-dom";

export default function TermsofService() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-transparent rounded-2xl shadow-sm mt-10">
      <h1 className="text-2xl md:text-4xl font-bold tracking-wide bg-gradient-to-r from-slate-800 via-teal-700 to-emerald-700 bg-clip-text text-transparent">
        TERMS OF SERVICE
      </h1>

     
      <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
      <p className="text-slate-700 mb-3 leading-loose">
        By accessing and using the Esperanza Health Center (EHC) Kiosk System, all users agree to
        comply with these Terms of Service. Access or use of the System signifies acknowledgement and acceptance
        of these terms. Users who do not agree are advised to discontinue use immediately.
      </p>

   
      <h2 className="text-xl font-semibold mt-6 mb-2">2. Description of Service</h2>
      <p className="text-slate-700 mb-3 leading-loose">
        The System serves as a patient registration and pre-checkup platform designed to facilitate data
        collection, vital signs collection, biometric authentication, and record management within EHC. It
        enables patients to create accounts and input personal and health information, and allows authorized
        healthcare personnel to review and manage such records.
      </p>


      <h2 className="text-xl font-semibold mt-6 mb-2">3. User Eligibility</h2>
      <p className="text-slate-700 mb-3 leading-loose">
        The System is intended for patients and healthcare personnel of EHC aged ten (10) years and above. Use by
        minors must be supervised by a parent or guardian and is subject to applicable consent requirements.
      </p>


      <h2 className="text-xl font-semibold mt-6 mb-2">4. User Responsibilities</h2>
      <ul className="list-disc pl-8 text-slate-700 mb-3 leading-relaxed space-y-2">
        <li>Patients shall provide accurate and truthful information when creating an account or submitting data.</li>
        <li>Patients are responsible for maintaining the confidentiality of their login credentials.</li>
        <li>Healthcare staff are expected to handle patient data with due professional care and confidentiality.</li>
        <li>
          Any unauthorized access, modification, or misuse of information is strictly prohibited and may lead to
          administrative or legal sanctions.
        </li>
      </ul>

    
      <h2 className="text-xl font-semibold mt-6 mb-2">5. Permitted and Prohibited Activities</h2>
      <p className="text-slate-700 mb-3 leading-loose">
        The System shall only be used for legitimate healthcare and administrative purposes related to EHC’s
        operations. Patients are prohibited from:
      </p>
      <ul className="list-disc pl-8 text-slate-700 mb-3 leading-relaxed space-y-2">
        <li>Submitting false, misleading, or fraudulent information;</li>
        <li>Attempting to gain unauthorized access to any portion of the System;</li>
        <li>Tampering with the data;</li>
        <li>Interfering with the integrity or performance of the System;</li>
        <li>Using the System for any activity that violates existing laws or EHC policies.</li>
      </ul>

 
      <h2 className="text-xl font-semibold mt-6 mb-2">6. Data Privacy and Protection</h2>
      <p className="text-slate-700 mb-3 leading-loose">
        All data collected and processed through the System are governed by EHC’s{" "}
        <Link to="/privacy" className="underline hover:opacity-80">
          Privacy Policy
        </Link>{" "}
        and the Data Privacy Act of 2012 (RA 10173). By using the System, patients and healthcare staff consent to
        the lawful collection and processing of their information as outlined in said policy.
      </p>

  
      <h2 className="text-xl font-semibold mt-6 mb-2">7. Intellectual Property Rights</h2>
      <p className="text-slate-700 mb-3 leading-loose">
        All components, designs, trademarks, databases, and documentation within the System are the
        exclusive property of Esperanza Health Center. Unauthorized reproduction, modification, or distribution of
        any part of the System is strictly prohibited without prior written consent from EHC.
      </p>


      <h2 className="text-xl font-semibold mt-6 mb-2">8. Limitation of Liability</h2>
      <p className="text-slate-700 mb-3 leading-loose">EHC shall not be held liable for any direct, indirect, or consequential damages resulting from:</p>
      <ul className="list-disc pl-8 text-slate-700 mb-3 leading-relaxed space-y-2">
        <li>Errors or omissions in user-provided data;</li>
        <li>Unauthorized access caused by user negligence;</li>
        <li>Temporary unavailability or malfunction of the System;</li>
        <li>Events beyond EHC’s reasonable control, such as technical failures or force majeure incidents.</li>
      </ul>


      <h2 className="text-xl font-semibold mt-6 mb-2">9. Amendments to the Terms</h2>
      <p className="text-slate-700 mb-3 leading-loose">
        EHC reserves the right to revise or update these Terms of Service at any time without prior notice. Users
        are encouraged to review the Terms periodically. Continued use of the System following the publication of
        revisions constitutes acceptance of the updated Terms.
      </p>

      
      <h2 className="text-xl font-semibold mt-6 mb-2">10. Contact Information</h2>
      <p className="text-slate-700 mb-3 leading-loose">
        For questions, feedback, or concerns related to these Terms, patients may contact:
        <br />
        <span className="inline-block">
          <em>esperanzahc@gmail.com</em> or <em>DPO Email</em>
        </span>
        <br />
        <span className="inline-block">
          Esperanza Health Center, <em>286 Teresa Street, Old Sta. Mesa, Manila</em>
        </span>
      </p>


        {/* MAY BE UPDATED TO THE LATEST DATE TOS IS REVISED */}
      <p className="text-sm text-slate-500 mt-6">Last updated: October 2025</p>
    </div>
  );
}
