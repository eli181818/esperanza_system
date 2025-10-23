// PrivacyPolicy.jsx
// This file defines the Privacy Policy page for the Esperanza Health Center.

import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-transparent rounded-2xl shadow-sm mt-10">
      <h1 className="text-2xl md:text-4xl font-bold tracking-wide bg-gradient-to-r from-slate-800 via-teal-700 to-emerald-700 bg-clip-text text-transparent">
        GENERAL PRIVACY NOTICE
      </h1>

      <p className="text-slate-700 mt-6 mb-4 leading-loose">
        Esperanza Health Center (EHC) operates the kiosk-based Patient Registration and Pre-Checkup System,
        a system designed to facilitate the efficient registration and preliminary medical assessment of patients.
        This Privacy Policy explains how EHC collects, uses, stores, and protects personal and health-related
        information processed through the system. EHC is committed to ensuring the confidentiality,
        integrity, and availability of all data in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173),
        its Implementing Rules and Regulations, and other applicable laws of the Republic of the Philippines.
      </p>


      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information Collected</h2>
      <p className="text-slate-700 mb-3 leading-loose">
        The system collects and processes the following categories of information:
      </p>
      <ul className="list-disc pl-8 text-slate-700 mb-3 leading-relaxed space-y-2">
        <li>
          <strong>Personal Information:</strong> Full name, date of birth, gender, home address,
          contact number, and username.
        </li>
        <li>
          <strong>Biometric Information:</strong> Fingerprint data used for patient verification and authentication.
        </li>
        <li>
          <strong>Health Information:</strong> Basic vital signs such as temperature, pulse rate, and blood pressure.
        </li>
        <li>
          <strong>System-Generated Data:</strong> Unique patient identification numbers, timestamps, and audit logs associated with user activity.
        </li>
      </ul>
      <p className="text-slate-700 mb-3 leading-loose">
        The system does <strong>NOT</strong> collect cookies, browsing data, or analytics from external services.
      </p>


      <h2 className="text-xl font-semibold mt-6 mb-2">2. Purpose of Data Collection</h2>
      <p className="text-slate-700 mb-3 leading-loose">
        All personal, biometric, and health-related information collected by EHC shall be used solely for legitimate healthcare and administrative purposes, including but not limited to:
      </p>
      <ol className="list-decimal pl-8 text-slate-700 mb-3 leading-relaxed space-y-2">
        <li>Establishing and maintaining patient records for medical consultation.</li>
        <li>Verifying patient identity through biometric enrollment.</li>
        <li>Streamlining pre-checkup procedures and queue management.</li>
        <li>Facilitating accurate and efficient service delivery by healthcare staff.</li>
        <li>Complying with legal and regulatory obligations applicable to health institutions.</li>
      </ol>


      
      <h2 className="text-xl font-semibold mt-6 mb-2">3. Purpose of Processing</h2>
      <ol className="list-decimal pl-8 text-slate-700 space-y-2 leading-relaxed">
        <li>Establish and maintain patient records for medical consultation;</li>
        <li>Verify patient identity through biometric enrollment;</li>
        <li>Streamline pre-checkup procedures and queue management;</li>
        <li>Facilitate accurate and efficient service delivery by healthcare staff; and</li>
        <li>Comply with legal and regulatory obligations applicable to health institutions.</li>
      </ol>

      
      <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Retention and Storage</h2>
      <p className="text-slate-700 mb-3 leading-relaxed">
        All data collected through the Application are securely stored within EHC’s local database systems.
        Access to these records is restricted to authorized healthcare and administrative personnel only.
      </p>
      <p className="text-slate-700 mb-3 leading-relaxed">
        Personal and health information shall be retained only for as long as necessary to achieve its intended
        purpose or as required by law. Upon expiration of the retention period, data shall be securely deleted or
        anonymized in accordance with EHC’s data retention policy.
      </p>

      
      <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Sharing and Disclosure</h2>
      <p className="text-slate-700 mb-3 leading-relaxed">
        EHC does not sell, rent, or share personal data with external parties. Disclosure of personal or health
        information shall only occur under the following conditions:
      </p>
      <ul className="list-disc pl-8 text-slate-700 space-y-2 leading-relaxed">
        <li>When required by law, regulation, or court order;</li>
        <li>When necessary for legitimate internal operations and audits; and</li>
        <li>When authorized personnel require access to perform their official duties.</li>
      </ul>
      <p className="text-slate-700 mt-3 leading-relaxed">
        All disclosures are governed by strict confidentiality and data protection protocols.
      </p>

      
      <h2 className="text-xl font-semibold mt-6 mb-2">6. Security Measures</h2>
      <p className="text-slate-700 mb-3 leading-relaxed">
        EHC implements appropriate organizational, physical, and technical safeguards to protect personal and health
        data against unauthorized access, alteration, disclosure, or destruction. These measures include:
      </p>
      <ul className="list-disc pl-8 text-slate-700 space-y-2 leading-relaxed">
        <li>Encrypted biometric and health data storage;</li>
        <li>Secure authentication and access control mechanisms;</li>
        <li>Regular security audits and system maintenance; and</li>
        <li>Controlled data access limited to authorized staff members.</li>
      </ul>

      
      <h2 className="text-xl font-semibold mt-6 mb-2">7. Rights of Data Subjects</h2>
      <p className="text-slate-700 mb-3 leading-relaxed">
        Consistent with the Data Privacy Act of 2012, all data subjects whose information is processed through the
        system are entitled to the following rights:
      </p>
      <ol className="list-decimal pl-8 text-slate-700 space-y-2 leading-relaxed">
        <li><strong>Right to be informed</strong> – to know how and why their data are collected and processed;</li>
        <li><strong>Right to access</strong> – to obtain a copy of personal data upon written request;</li>
        <li><strong>Right to rectification</strong> – to correct inaccurate or outdated information;</li>
        <li><strong>Right to erasure or blocking</strong> – to request deletion of data under lawful grounds;</li>
        <li><strong>Right to object or withdraw consent</strong> – to restrict or discontinue data processing; and</li>
        <li><strong>Right to lodge a complaint</strong> – to file a grievance before the National Privacy Commission (NPC).</li>
      </ol>
      <p className="text-slate-700 mt-3 leading-relaxed">
        Requests may be submitted in writing to the Data Protection Officer (DPO) of EHC through the following contact details:
        <br />
        <em>esperanzahc@gmail.com or [Insert DPO Email]</em>
        <br />
        Esperanza Health Center, <em>286 Teresa Street, Old Sta. Mesa, Manila</em>
      </p>

      
      <h2 className="text-xl font-semibold mt-6 mb-2">8. Consent</h2>
      <p className="text-slate-700 mb-3 leading-relaxed">
        By registering or logging into the system, users acknowledge that they have read, understood, and voluntarily
        consent to the lawful processing of their personal and health information for the purposes described in this Policy.
      </p>

      
      <h2 className="text-xl font-semibold mt-6 mb-2">9. Policy Amendments</h2>
      <p className="text-slate-700 mb-3 leading-relaxed">
        EHC reserves the right to amend or update this Privacy Policy at any time to reflect legal, operational, or
        technological changes. Any revisions shall take effect upon posting within the system and shall bear the
        updated effective date.
      </p>

      
      <h2 className="text-xl font-semibold mt-6 mb-2">10. Effective Date and Contact</h2>
      <p className="text-slate-700 mb-3 leading-relaxed">
        This Policy is effective as of the date below. For clarifications, you may contact the EHC Data Protection Officer.
      </p>

      {/* MAY BE UPDATED TO THE LATEST DATE PRIVACY POLICY IS REVISED */}
      <p className="text-sm text-slate-500 mt-6">
        Last updated: October 2025
      </p>
    </div>
  );
}