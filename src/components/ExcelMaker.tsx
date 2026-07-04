import React, { useState } from "react";
import { FileSpreadsheet, Sparkles, Download, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface ExcelMakerProps {
  onBack: () => void;
}

export default function ExcelMaker({ onBack }: ExcelMakerProps) {
  const [prompt, setPrompt] = useState("Product Name, SKU, Purchase Date, Price");
  const [rawData, setRawData] = useState(
    `Bought a new "Wireless Keyboard Pro" for 55.00 on 2025-08-15. SKU: KBD-99\nThe office chair, SKU CHR-003, was 189.99 on 08/16/2025.\nSubscription renewal for "Cloud Storage 1TB" was $9.99 on the 16th of August 2025.`
  );
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | "info" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !rawData.trim()) {
      setStatusMessage("Warning: Please fill in both the Prompt/Headers and Raw Data fields.");
      setStatusType("error");
      return;
    }

    setIsLoading(true);
    setStatusMessage("AI is parsing your unstructured text data into rows...");
    setStatusType("info");

    try {
      const response = await fetch("/api/excel-parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: rawData,
          prompt: includeHeaders ? `Headers: ${prompt}` : prompt,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      // Read as a blob for binary spreadsheet file
      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "VLX_Excel_Export.xlsx";

      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?(.+?)"?$/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      // Create download trigger
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatusMessage(`Success! Excel spreadsheet "${filename}" generated and downloaded successfully. 🎉`);
      setStatusType("success");
    } catch (error: any) {
      console.error(error);
      setStatusMessage(`Error: ${error.message || "Failed to process data. Please verify your Gemini API key configuration."}`);
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-vlx-l transition duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display">
            AI-Powered Excel Maker
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Instantly turn messy, raw, unstructured notes or copy-pasted text into structured Excel spreadsheets.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Target Columns / Prompt */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-semibold text-gray-800 mb-1.5">
              Specify Desired CSV Headers or Column Structure
            </label>
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Product Name, SKU, Purchase Date, Price"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition duration-150"
            />
            <p className="text-gray-400 text-xs mt-1.5">
              Type the exact column headers you want (comma-separated), or briefly describe the desired list layout.
            </p>
          </div>

          {/* Raw Text Input */}
          <div>
            <label htmlFor="rawData" className="block text-sm font-semibold text-gray-800 mb-1.5">
              Paste Unstructured Raw Data
            </label>
            <textarea
              id="rawData"
              rows={8}
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder="Paste unstructured notes, chat messages, lists, emails, or tables here..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition duration-150"
            />
            <p className="text-gray-400 text-xs mt-1.5">
              Pasted text can contain arbitrary sentences, price lists, SKU numbers, or paragraphs. Gemini AI extracts values intelligently!
            </p>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
            <input
              type="checkbox"
              id="includeHeaders"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
              className="w-4.5 h-4.5 text-emerald-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-emerald-500 focus:ring-2"
            />
            <label htmlFor="includeHeaders" className="text-sm font-medium text-emerald-800 cursor-pointer">
              Include defined headers as the first row of the exported spreadsheet
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-xl text-white font-bold tracking-wide flex items-center justify-center space-x-2 shadow-sm transition-all duration-200 cursor-pointer ${
              isLoading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] hover:shadow-md"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Processing Unstructured Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-emerald-100" />
                <span>Parse Raw Data & Download Excel</span>
              </>
            )}
          </button>
        </form>

        {/* Status Message Panel */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-6 py-4 border-t flex items-start space-x-3 ${
              statusType === "success"
                ? "bg-green-50 border-green-100 text-green-800"
                : statusType === "error"
                ? "bg-rose-50 border-rose-100 text-rose-800"
                : "bg-blue-50 border-blue-100 text-blue-800"
            }`}
          >
            {statusType === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            ) : statusType === "success" ? (
              <Download className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium leading-relaxed">{statusMessage}</p>
          </motion.div>
        )}
      </div>

      {/* Guide Card */}
      <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-2">
          How it Works:
        </h3>
        <ul className="space-y-2 text-sm text-gray-500 list-disc list-inside">
          <li>We pass your raw copy-pasted text along with the target column list to Gemini AI.</li>
          <li>The AI structures the text row-by-row, identifying dates, names, currency amounts, and items.</li>
          <li>The backend compiles this raw structured table directly into a standard Microsoft Excel binary (<code className="font-mono bg-white px-1.5 py-0.5 rounded border">.xlsx</code>) using SheetJS.</li>
          <li>Your download is trigger-ready in seconds, completely client-and-server clean!</li>
        </ul>
      </div>
    </div>
  );
}
