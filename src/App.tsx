import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileSpreadsheet,
  FileText,
  HeartPulse,
  MessageSquare,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Bolt,
  Zap,
  Feather,
  ChevronRight,
  MessageCircle
} from "lucide-react";

// Imports from our modular components
import ExcelMaker from "./components/ExcelMaker";
import PdfGenerator from "./components/PdfGenerator";
import FeedbackHub from "./components/FeedbackHub";
import AnonymousInbox from "./components/AnonymousInbox";
import BookshopTeaser from "./components/BookshopTeaser";

type ActiveView = "dashboard" | "excel" | "pdf" | "feedback" | "messages" | "bookshop";

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  // Custom tool details card for dashboard grid
  const tools = [
    {
      id: "excel" as ActiveView,
      title: "AI-Powered Excel Maker",
      description: "Instantly compile structured worksheets from messy copy-pasted text using Gemini AI parsing.",
      icon: FileSpreadsheet,
      badge: "Available Now",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      accentBorder: "hover:border-emerald-500 hover:shadow-emerald-500/5",
      iconColor: "text-emerald-600 bg-emerald-50"
    },
    {
      id: "pdf" as ActiveView,
      title: "PDF Document Maker",
      description: "Generate letterheads, legal agreements, internal memos, reports, and certificates automatically.",
      icon: FileText,
      badge: "Available Now",
      badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
      accentBorder: "hover:border-indigo-500 hover:shadow-indigo-500/5",
      iconColor: "text-indigo-600 bg-indigo-50"
    },
    {
      id: "feedback" as ActiveView,
      title: "Student Feedback Hub",
      description: "Anonymously report campus problems, view a live public table of reports, and vote on solution suggestions.",
      icon: HeartPulse,
      badge: "Available Now",
      badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
      accentBorder: "hover:border-rose-500 hover:shadow-rose-500/5",
      iconColor: "text-rose-600 bg-rose-50"
    },
    {
      id: "messages" as ActiveView,
      title: "Anonymous Message Inbox",
      description: "Send secret, secure private notes directly to Vicade with optional WhatsApp return contact info.",
      icon: MessageSquare,
      badge: "Available Now",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      accentBorder: "hover:border-purple-500 hover:shadow-purple-500/5",
      iconColor: "text-purple-600 bg-purple-50"
    },
    {
      id: "bookshop" as ActiveView,
      title: "Alpha Bookshop",
      description: "Interactive smart study aids, custom audio lectures, and textbook summary generator coming soon.",
      icon: BookOpen,
      badge: "Teaser / Preview",
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
      accentBorder: "hover:border-amber-500 hover:shadow-amber-500/5",
      iconColor: "text-amber-600 bg-amber-50"
    }
  ];

  const pillars = [
    { title: "Fast", desc: "Near-instant processing times mean you spend less time waiting and more time working.", icon: Bolt, color: "text-red-500 bg-red-50" },
    { title: "Reliable", desc: "Enjoy 99.9% uptime and consistent, high-fidelity layouts on all devices.", icon: ShieldCheck, color: "text-blue-500 bg-blue-50" },
    { title: "Efficient", desc: "Intelligent workflows that cut down multi-step actions into single-button submissions.", icon: Zap, color: "text-emerald-500 bg-emerald-50" },
    { title: "Light", desc: "Zero bloat. A modern, clean off-white interface built for perfect legibility.", icon: Feather, color: "text-purple-500 bg-purple-50" }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-150 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <button
            onClick={() => setActiveView("dashboard")}
            className="flex items-center space-x-1.5 group cursor-pointer border-0 bg-transparent"
          >
            {/* Styled VLX Text from original HTML design guidelines */}
            <div className="text-3xl font-black tracking-tighter leading-none flex select-none">
              <span className="text-[#dc2626]">V</span>
              <span className="text-[#2563eb]">L</span>
              <span className="text-[#10b981]">X</span>
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">Tools</span>
          </button>

          {/* Quick link actions */}
          <nav className="flex space-x-6 text-sm font-semibold text-gray-600">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`hover:text-[#2563eb] transition cursor-pointer ${activeView === "dashboard" ? "text-[#2563eb]" : ""}`}
            >
              Portal
            </button>
            <button
              onClick={() => setActiveView("feedback")}
              className={`hover:text-[#2563eb] transition cursor-pointer ${activeView === "feedback" ? "text-[#2563eb]" : ""}`}
            >
              Feedback
            </button>
            <a
              href="https://wa.me/2348136390030"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 transition flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-1 text-emerald-500 fill-emerald-50" />
              <span>Support</span>
            </a>
          </nav>
        </div>
      </header>

      {/* CORE VIEW SHELL */}
      <main className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {activeView === "dashboard" && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* HERO BANNER SECTION */}
              <section className="relative overflow-hidden bg-white border-b border-gray-150 py-16 md:py-24">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/20 via-emerald-50/10 to-rose-50/10 opacity-70" />
                <div className="max-w-4xl mx-auto text-center px-4 relative z-10 space-y-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                    Empower Your Work with{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] via-indigo-600 to-[#10b981] font-display">
                      VLX Tools!
                    </span>
                  </h1>
                  <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                    Discover VLX Tools – your go-to web application for essential administrative, document, and study helpers, engineered for raw speed and efficiency.
                  </p>
                  <div className="pt-2 flex justify-center space-x-3">
                    <button
                      onClick={() => setActiveView("excel")}
                      className="px-6 py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm hover:shadow transition cursor-pointer"
                    >
                      Use AI Excel Maker
                    </button>
                    <button
                      onClick={() => setActiveView("pdf")}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition cursor-pointer"
                    >
                      Generate Documents
                    </button>
                  </div>
                </div>
              </section>

              {/* TOOLS GRID */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight font-display">
                    Our Specialized Tools
                  </h2>
                  <p className="text-gray-500 text-sm max-w-lg mx-auto">
                    Click any module below to launch the active utility on your screen.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setActiveView(tool.id)}
                        className={`p-6 rounded-2xl border border-gray-150 bg-white text-left transition-all duration-300 flex flex-col justify-between h-64 hover:shadow-md cursor-pointer group ${tool.accentBorder}`}
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-xl shrink-0 ${tool.iconColor}`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${tool.badgeColor}`}>
                              {tool.badge}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-gray-950 font-display">
                              {tool.title}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                              {tool.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center text-xs font-bold text-gray-400 group-hover:text-gray-700 transition mt-2">
                          <span>Open tool</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition duration-150" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* WHY CHOOSE PANELS */}
              <section className="bg-white border-t border-b border-gray-150 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight font-display">
                      Why Choose VLX Tools?
                    </h2>
                    <p className="text-gray-500 text-sm max-w-lg mx-auto">
                      Our foundation is built on the four pillars of modern professional office software.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pillars.map((p, idx) => {
                      const Icon = p.icon;
                      return (
                        <div
                          key={idx}
                          className="p-6 bg-gray-50/50 border border-gray-100 rounded-xl space-y-3"
                        >
                          <div className={`p-2.5 rounded-lg w-fit ${p.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className="font-extrabold text-gray-900 text-base">{p.title}</h4>
                          <p className="text-xs text-gray-500 leading-relaxed font-medium">{p.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeView === "excel" && (
            <motion.div
              key="excel-view"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
            >
              <ExcelMaker onBack={() => setActiveView("dashboard")} />
            </motion.div>
          )}

          {activeView === "pdf" && (
            <motion.div
              key="pdf-view"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
            >
              <PdfGenerator onBack={() => setActiveView("dashboard")} />
            </motion.div>
          )}

          {activeView === "feedback" && (
            <motion.div
              key="feedback-view"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
            >
              <FeedbackHub onBack={() => setActiveView("dashboard")} />
            </motion.div>
          )}

          {activeView === "messages" && (
            <motion.div
              key="messages-view"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
            >
              <AnonymousInbox onBack={() => setActiveView("dashboard")} />
            </motion.div>
          )}

          {activeView === "bookshop" && (
            <motion.div
              key="bookshop-view"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
            >
              <BookshopTeaser onBack={() => setActiveView("dashboard")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-150 py-8 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-center gap-4 text-xs font-medium text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} VLX Tools. Powered by{" "}
            <span className="font-bold text-[#2563eb] hover:underline">TechLite</span>. All rights
            reserved.
          </div>
          <div className="flex space-x-4">
            <button onClick={() => setActiveView("dashboard")} className="hover:text-gray-800">
              About Portal
            </button>
            <span>&middot;</span>
            <button onClick={() => setActiveView("feedback")} className="hover:text-gray-800">
              Campus Security
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
