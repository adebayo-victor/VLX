import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  ArrowLeft,
  Sparkles,
  Shield,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FeedbackRecord } from "../types";

interface FeedbackHubProps {
  onBack: () => void;
}

export default function FeedbackHub({ onBack }: FeedbackHubProps) {
  // Lists
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [academicYear, setAcademicYear] = useState("");
  const [location, setLocation] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [solutionSuggestion, setSolutionSuggestion] = useState("");

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  // Status message
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/feedback");
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      }
    } catch (e) {
      console.error("Error fetching feedback:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicYear || !location || !problemDescription) {
      setFormError("Please fill out the Academic Year, Location, and Problem Description fields.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(false);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academic_year: academicYear,
          location,
          problem_description: problemDescription,
          solution_suggestion: solutionSuggestion,
        }),
      });

      if (!response.ok) throw new Error("Server failed to record feedback");

      setFormSuccess(true);
      // Reset form fields
      setAcademicYear("");
      setLocation("");
      setProblemDescription("");
      setSolutionSuggestion("");

      // Re-fetch records
      await fetchFeedbacks();

      // Clear success notification after 5s
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit. Please check your network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter logic
  const filteredFeedbacks = feedbacks.filter((item) => {
    // Search Term
    const searchString = [
      item.problem_description,
      item.solution_suggestion,
      item.academic_year,
      item.location,
    ]
      .join(" ")
      .toLowerCase();

    if (searchTerm && !searchString.includes(searchTerm.toLowerCase().trim())) {
      return false;
    }

    // Academic Year Filter
    if (filterYear && item.academic_year !== filterYear) {
      return false;
    }

    // Location Filter
    if (filterLocation && item.location !== filterLocation) {
      return false;
    }

    return true;
  });

  // Styles for badges
  const getYearBadgeClass = (year: string) => {
    if (year.includes("1") || year.includes("2")) return "bg-teal-50 text-teal-700 border-teal-100";
    if (year.includes("3") || year.includes("4")) return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Nav */}
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-vlx-l transition duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
          <HeartPulse className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display">
            Anonymous Student Feedback
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Report local college or campus problems anonymously and suggest solutions. Transparent governance for all students.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Submissions Form (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-800">Submit New Feedback</h2>
              <p className="text-xs text-gray-500 mt-0.5">Your submission is 100% private. We collect no IP or login information.</p>
            </div>

            {/* Privacy Alert */}
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3 text-emerald-800 text-xs">
              <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">100% Secure & Untraceable</p>
                <p className="text-emerald-700 mt-0.5">Names, accounts, and session data are omitted. Only form inputs are recorded on the server.</p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Academic Year select */}
              <div>
                <label htmlFor="academic_year" className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Academic Year
                </label>
                <select
                  id="academic_year"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white"
                >
                  <option value="">-- Select Your Year --</option>
                  <option value="Year 1">Year 1 (Pre-Clinical)</option>
                  <option value="Year 2">Year 2 (Pre-Clinical)</option>
                  <option value="Year 3">Year 3 (Clinical)</option>
                  <option value="Year 4">Year 4 (Clinical)</option>
                  <option value="Year 5+">Final Year / Intern / Other</option>
                </select>
              </div>

              {/* Location Radios */}
              <div>
                <span className="block text-xs font-bold text-gray-700 uppercase mb-2">Location</span>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center space-x-2.5 p-3 rounded-lg border text-sm font-semibold cursor-pointer transition ${
                      location === "On Campus"
                        ? "border-rose-500 bg-rose-50/30 text-rose-800"
                        : "border-gray-150 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="location"
                      value="On Campus"
                      checked={location === "On Campus"}
                      onChange={() => setLocation("On Campus")}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <span>On Campus</span>
                  </label>
                  <label
                    className={`flex items-center space-x-2.5 p-3 rounded-lg border text-sm font-semibold cursor-pointer transition ${
                      location === "Off Campus"
                        ? "border-rose-500 bg-rose-50/30 text-rose-800"
                        : "border-gray-150 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="location"
                      value="Off Campus"
                      checked={location === "Off Campus"}
                      onChange={() => setLocation("Off Campus")}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <span>Off Campus</span>
                  </label>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <label htmlFor="problem_description" className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Problem Description
                </label>
                <textarea
                  id="problem_description"
                  required
                  rows={4}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Be specific. E.g. The laboratory autoclave has been broken since Tuesday shift..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white"
                />
              </div>

              {/* Proposed Solution */}
              <div>
                <label htmlFor="solution_suggestion" className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Proposed Solution <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="solution_suggestion"
                  rows={3}
                  value={solutionSuggestion}
                  onChange={(e) => setSolutionSuggestion(e.target.value)}
                  placeholder="What is your suggested resolution? E.g. Request support contract repair..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white"
                />
              </div>

              {/* Feedback Success/Errors */}
              <AnimatePresence>
                {formSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-green-50 border border-green-100 text-green-800 text-xs rounded-lg flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Feedback submitted anonymously! Thank you for raising your voice.</span>
                  </motion.div>
                )}
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-lg flex items-center space-x-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>{formError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Submit Anonymous Report</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Admin Dashboard / List (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 md:p-8 flex flex-col h-[75vh]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 shrink-0">
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">Public Feedback Board</h2>
                <p className="text-xs text-gray-500 mt-0.5">Real-time status of reported campus grievances.</p>
              </div>
              <div className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1.5 rounded-full flex items-center space-x-2">
                <span>Total records: {feedbacks.length}</span>
                <span className="text-gray-300">|</span>
                <span className="text-rose-600">Showing: {filteredFeedbacks.length}</span>
              </div>
            </div>

            {/* FILTERS PANEL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 shrink-0">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              {/* Year Filter */}
              <div>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700"
                >
                  <option value="">All Academic Years</option>
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                  <option value="Year 5+">Year 5+ (Final/Intern)</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700"
                >
                  <option value="">All Locations</option>
                  <option value="On Campus">On Campus</option>
                  <option value="Off Campus">Off Campus</option>
                </select>
              </div>
            </div>

            {/* SCROLLABLE FEEDBACK LIST */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mb-2" />
                  <span className="text-sm">Fetching feedback data...</span>
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="h-full border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 py-16 px-4">
                  <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                  <span className="text-sm font-semibold text-gray-500">No matching feedback records</span>
                  <span className="text-xs text-gray-400 mt-1">Try tweaking your search term or filters.</span>
                </div>
              ) : (
                filteredFeedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 border border-gray-150 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-xs transition duration-200 space-y-3"
                  >
                    {/* Card Head */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs font-bold text-gray-400">REPORT ID: #{item.id}</span>
                        <div className="flex items-center space-x-1.5 text-xs text-gray-500 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex space-x-1.5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${getYearBadgeClass(item.academic_year)}`}>
                          {item.academic_year}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          item.location === "On Campus"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {item.location}
                        </span>
                      </div>
                    </div>

                    {/* Complaint block */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Reported Issue</span>
                      <p className="text-sm text-gray-800 font-medium leading-relaxed bg-rose-50/20 border border-rose-50 p-3 rounded-lg">
                        {item.problem_description}
                      </p>
                    </div>

                    {/* Resolution Suggestion block */}
                    {item.solution_suggestion && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Proposed Solution</span>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed bg-emerald-50/20 border border-emerald-50 p-3 rounded-lg">
                          {item.solution_suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
