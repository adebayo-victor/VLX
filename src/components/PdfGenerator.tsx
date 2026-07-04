import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  ArrowLeft,
  Sparkles,
  Layers,
  Printer,
  ExternalLink,
  Code,
  Download,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Scale,
  CreditCard,
  Briefcase,
  Award,
  ListOrdered,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DocumentFormData, DocumentType } from "../types";

interface PdfGeneratorProps {
  onBack: () => void;
}

export default function PdfGenerator({ onBack }: PdfGeneratorProps) {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState<Partial<DocumentFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View state: 'editor' | 'viewer'
  const [viewState, setViewState] = useState<'editor' | 'viewer'>('editor');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [templates, setTemplates] = useState<{ styleName: string; html: string; subkey: number }[]>([]);
  const [selectedSubkey, setSelectedSubkey] = useState<number>(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const docTypesList = [
    { id: "letter" as DocumentType, label: "Official Letter", icon: FileText, color: "text-blue-600 bg-blue-50" },
    { id: "agreement" as DocumentType, label: "Legal Agreement", icon: Scale, color: "text-indigo-600 bg-indigo-50" },
    { id: "memo" as DocumentType, label: "Internal Memo", icon: BookOpen, color: "text-purple-600 bg-purple-50" },
    { id: "receipt" as DocumentType, label: "Payment Receipt", icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
    { id: "report" as DocumentType, label: "Business Report", icon: FileCheck, color: "text-teal-600 bg-teal-50" },
    { id: "proposal" as DocumentType, label: "Project Proposal", icon: Briefcase, color: "text-amber-600 bg-amber-50" },
    { id: "certificate" as DocumentType, label: "Certificate of Award", icon: Award, color: "text-rose-600 bg-rose-50" },
    { id: "list" as DocumentType, label: "Structured List", icon: ListOrdered, color: "text-sky-600 bg-sky-50" },
  ];

  const handleTypeSelect = (type: DocumentType) => {
    setSelectedType(type);
    setFormData({ document_type: type });
    setError(null);
  };

  const handleInputChange = (field: keyof DocumentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/pdf-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const result = await response.json();
      if (result.response === "successful" && result.key) {
        // Fetch full templates using key
        const tplResponse = await fetch(`/api/doc-templates/${result.key}`);
        if (!tplResponse.ok) throw new Error("Failed to retrieve generated templates");
        const tplData = await tplResponse.json();

        setTemplates(tplData.templates.map((t: any, idx: number) => ({ ...t, subkey: idx })));
        setGeneratedKey(result.key);
        setSelectedSubkey(0);
        setViewState("viewer");
      } else {
        throw new Error("Invalid response format received from backend");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate document. Please verify your Gemini API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (!iframeRef.current) return;
    try {
      iframeRef.current.contentWindow?.focus();
      iframeRef.current.contentWindow?.print();
    } catch (e) {
      console.error("Print failed:", e);
      // Fallback: open in new tab and trigger print
      const blob = new Blob([templates[selectedSubkey].html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, "_blank");
      if (w) {
        w.onload = () => {
          w.print();
        };
      }
    }
  };

  const handleOpenInTab = () => {
    const blob = new Blob([templates[selectedSubkey].html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([templates[selectedSubkey].html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedType}_${templates[selectedSubkey].styleName.toLowerCase().replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Set iframe height dynamically based on scaling or content window
  const activeTemplateHtml = templates[selectedSubkey]?.html || "";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* View State Router */}
      <AnimatePresence mode="wait">
        {viewState === "editor" ? (
          <motion.div
            key="editor-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            {/* Top Back Nav */}
            <button
              onClick={onBack}
              className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-vlx-l transition duration-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Dashboard
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display">
                  AI-Powered PDF & Document Maker
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  Generate beautiful, professional, fully laid-out documents. AI crafts three gorgeous stylistic options in real-time.
                </p>
              </div>
            </div>

            {/* Step 1: Selector Cards */}
            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-800 mb-4 uppercase tracking-wider">
                1. Select Document Type
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {docTypesList.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`p-4 rounded-xl border text-left transition duration-200 flex flex-col justify-between h-28 cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/15 shadow-sm"
                          : "border-gray-150 hover:border-indigo-200 hover:bg-gray-50 bg-white"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${type.color} shrink-0 w-fit`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-800 leading-tight">
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Adaptive Form details */}
            {selectedType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden"
              >
                <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 capitalize flex items-center">
                      <Sparkles className="w-4 h-4 text-indigo-500 mr-1.5" />
                      Form Fields: {selectedType} layout
                    </h3>
                    <p className="text-xs text-gray-500">Provide the required values below. Gemini AI writes details and formats elegantly.</p>
                  </div>
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-xs text-indigo-600 hover:underline cursor-pointer"
                  >
                    Clear Choice
                  </button>
                </div>

                <form onSubmit={handleGenerate} className="p-6 md:p-8 space-y-5">
                  {/* LETTER FORM */}
                  {selectedType === "letter" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sender's Address</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 10 Marina Blvd, Lagos"
                          onChange={(e) => handleInputChange("letter_sender_address", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Receiver's Address</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. HR Manager, TechCorp Ltd"
                          onChange={(e) => handleInputChange("letter_receiver_address", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Receiver's Salutation/Gender</label>
                        <input
                          type="text"
                          placeholder="e.g. Mr. / Ms. / Dr. / Dear Sir,"
                          onChange={(e) => handleInputChange("letter_receiver_gender", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Letter Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Letter of Introduction / Offer Acceptance"
                          onChange={(e) => handleInputChange("letter_title", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Body Prompt & Core Context</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="e.g. State that I am accepting the offer with starting date of July 15. Express appreciation for the opportunity..."
                          onChange={(e) => handleInputChange("letter_body_prompt", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sender's Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Victor Adebayo"
                          onChange={(e) => handleInputChange("letter_sender_name", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sender's Position</label>
                        <input
                          type="text"
                          placeholder="e.g. Lead Software Engineer"
                          onChange={(e) => handleInputChange("letter_position", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* MEMO FORM */}
                  {selectedType === "memo" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sender's Department/Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Operations Department"
                          onChange={(e) => handleInputChange("memo_sender_address", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Receiver/Group</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. All Medical Laboratory Staff"
                          onChange={(e) => handleInputChange("memo_receiver_address", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Salutation tone</label>
                        <input
                          type="text"
                          placeholder="e.g. Professional / Urgent Notice"
                          onChange={(e) => handleInputChange("memo_receiver_gender", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Memo Title / Subject</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Restructuring of Weekend Clinic Shifts"
                          onChange={(e) => handleInputChange("memo_title", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Memo Message / Directives</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Provide shift change guidelines, reasons for schedule changes, and dates of effect..."
                          onChange={(e) => handleInputChange("memo_body_prompt", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Memo Authorized Signee</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Medical Director"
                          onChange={(e) => handleInputChange("memo_sender_name", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reference Code / ID</label>
                        <input
                          type="text"
                          placeholder="e.g. MEMO/2026/04"
                          onChange={(e) => handleInputChange("memo_position", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* AGREEMENT FORM */}
                  {selectedType === "agreement" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parties Information (Names & Addresses)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Party A: Victor Adebayo (Lagos), Party B: TechLite Solutions (London)"
                          onChange={(e) => handleInputChange("agreement_parties_info", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date of Agreement</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 4th Day of July, 2026"
                          onChange={(e) => handleInputChange("agreement_date", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Terms, Covenants & Conditions</label>
                        <textarea
                          rows={5}
                          required
                          placeholder="Write the core clauses: Service delivery description, IP rights transfer, payment clauses, confidentiality rules..."
                          onChange={(e) => handleInputChange("agreement_terms", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* RECEIPT FORM */}
                  {selectedType === "receipt" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payer's Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          onChange={(e) => handleInputChange("receipt_payer_name", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Recipient / Issuing Agency</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. VLX Bookstore & Stationeries"
                          onChange={(e) => handleInputChange("receipt_receiver_name", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount Paid (₦ or $)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 45,000 NGN"
                          onChange={(e) => handleInputChange("receipt_amount_paid", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Method</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bank Transfer / Credit Card / Cash"
                          onChange={(e) => handleInputChange("receipt_payment_method", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Transaction Description / Items Purchased</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="e.g. 1x Advanced Biochemistry Textbook (₦35,000), 1x Medical Lab Coat (₦10,000)"
                          onChange={(e) => handleInputChange("receipt_description", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* REPORT FORM */}
                  {selectedType === "report" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Report's Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Q2 Medical Equipment Audit"
                          onChange={(e) => handleInputChange("report_report_title", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Author's Full Name / Department</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Inventory Audit Team"
                          onChange={(e) => handleInputChange("report_report_author", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Topic / Area of Coverage</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Clinical diagnostics stock count and machinery health status"
                          onChange={(e) => handleInputChange("report_report_topic", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date of Submission</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. July 4, 2026"
                          onChange={(e) => handleInputChange("report_submission_date", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Main Findings, Core Data & Summary</label>
                        <textarea
                          rows={5}
                          required
                          placeholder="Provide the core data tables or points, findings, inventory counts, anomalies, and recommendation conclusions..."
                          onChange={(e) => handleInputChange("report_report_body", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* PROPOSAL FORM */}
                  {selectedType === "proposal" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Proposal Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hospital Ward Digitalization Project"
                          onChange={(e) => handleInputChange("proposal_proposal_title", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Proposer Information (Company/Team Name)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. TechLite Digital Healthcare"
                          onChange={(e) => handleInputChange("proposal_proposer_info", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary Recipient</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Board of Trustees, University Hospital"
                          onChange={(e) => handleInputChange("proposal_recipient_info_1", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Secondary Recipient / Cc</label>
                        <input
                          type="text"
                          placeholder="e.g. Chief of Medicine Clinic"
                          onChange={(e) => handleInputChange("proposal_recipient_info_2", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Problem Statement / Needs</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Outpatient records are hand-written, causing 1.5 hour delays in emergency access..."
                          onChange={(e) => handleInputChange("proposal_problem", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Proposed Solution Outline</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Install secure cloud-hosted tablets running LiteEMR systems with immediate access..."
                          onChange={(e) => handleInputChange("proposal_solution", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estimated Cost / Budget Breakdown</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="e.g. Hardware purchase (₦1,200,000), cloud licensing (₦150,000/mo), Staff training (₦300,000)..."
                          onChange={(e) => handleInputChange("proposal_budget", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* CERTIFICATE FORM */}
                  {selectedType === "certificate" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Certificate Type/Heading</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Certificate of Excellence / Completion"
                          onChange={(e) => handleInputChange("certificate_certificate_type", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Recipient Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Grace Oloko"
                          onChange={(e) => handleInputChange("certificate_recipient_name", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reason / Citation</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. For outstanding academic performance in the College of Physics and Biology Shift and shifting focus..."
                          onChange={(e) => handleInputChange("certificate_certificate_reason", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date of Issue</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 4th Day of July, 2026"
                          onChange={(e) => handleInputChange("certificate_issue_date", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Authorized Issuer Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Samuel Wobo"
                          onChange={(e) => handleInputChange("certificate_issuer_name", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Issuer Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dean of Clinical Sciences"
                          onChange={(e) => handleInputChange("certificate_issuer_title", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* LIST FORM */}
                  {selectedType === "list" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">List Title / Styling Instructions</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Grade list of clinical lab technology semester students"
                          onChange={(e) => handleInputChange("list_prompt", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Raw List Data (one item per line or CSV)</label>
                        <textarea
                          rows={8}
                          required
                          placeholder="Grace Oloko, Physics, 19, Score: 85, Grade: A&#10;Daniel Adegoke, Chemistry, 20, Score: 78, Grade: B&#10;Favour Sam-Wobo, Biology, 18, Score: 92, Grade: A..."
                          onChange={(e) => handleInputChange("list_data", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Trigger */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-xl text-white font-bold tracking-wide flex items-center justify-center space-x-2 shadow-sm transition-all duration-200 cursor-pointer ${
                      isLoading
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>AI Generating Three Styled Templates...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-indigo-100" />
                        <span>Generate Custom Design Templates</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="viewer-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-[85vh]"
          >
            {/* Viewer Head Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4 shrink-0">
              <div>
                <button
                  onClick={() => setViewState("editor")}
                  className="inline-flex items-center text-xs font-bold text-indigo-600 hover:underline mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Return to Document Editor
                </button>
                <h2 className="text-xl font-extrabold text-gray-900 font-display">
                  Batch Viewer: <span className="text-indigo-600">{selectedType?.toUpperCase()}</span>
                </h2>
                <p className="text-xs text-gray-500">Document Key: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-700">{generatedKey}</code></p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save to PDF</span>
                </button>
                <button
                  onClick={handleOpenInTab}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Full Screen</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download HTML</span>
                </button>
              </div>
            </div>

            {/* Main Viewer Split View */}
            <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden min-h-0">
              {/* Left Sidebar Layout options */}
              <div className="w-full lg:w-72 shrink-0 space-y-3">
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center">
                    <Layers className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                    Styling Options
                  </h4>
                  <p className="text-[11px] text-gray-500">Select an alternate visual layout engineered by Gemini AI.</p>
                </div>

                <div className="space-y-2">
                  {templates.map((tpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSubkey(idx)}
                      className={`w-full p-4 text-left rounded-xl border transition-all duration-150 cursor-pointer ${
                        selectedSubkey === idx
                          ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/25 shadow-xs"
                          : "border-gray-100 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <span className="block text-xs text-gray-400 font-bold">LAYOUT #{idx + 1}</span>
                      <span className="block text-sm font-extrabold text-gray-800 mt-0.5">{tpl.styleName}</span>
                      <span className="block text-[11px] text-indigo-600 font-semibold mt-1">Ready to export</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Document Iframe container */}
              <div className="flex-1 bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-0">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">Interactive Print Preview</span>
                </div>
                <iframe
                  ref={iframeRef}
                  srcDoc={activeTemplateHtml}
                  className="w-full flex-1 border-0 bg-white"
                  title="Document Preview"
                  sandbox="allow-same-origin allow-scripts allow-modals"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
