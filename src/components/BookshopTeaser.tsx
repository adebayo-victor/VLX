import React from "react";
import { ArrowLeft, BookOpen, PenTool, Flame, Compass, MessageCircle, HelpCircle } from "lucide-react";

interface BookshopTeaserProps {
  onBack: () => void;
}

export default function BookshopTeaser({ onBack }: BookshopTeaserProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
        <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display">
            Alpha Bookshop [AI-powered]
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Discover upcoming digital study portals, comprehensive textbooks, and blog builder helpers coming soon.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Main Bookshop Teaser Banner */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-md overflow-hidden text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-lg text-center md:text-left">
            <span className="inline-flex items-center rounded-full bg-amber-400/25 px-3 py-1 text-xs font-semibold text-amber-100 uppercase tracking-wide">
              📚 Coming Soon / Under Development
            </span>
            <h2 className="text-2xl font-extrabold font-display">
              Alpha Bookshop & Study Companion
            </h2>
            <p className="text-amber-100 text-sm leading-relaxed">
              "This is the bookshop without books, eheh."
              We are engineering a robust study companion that outputs personalized textbook guides, summaries, and automated voice audio lectures directly from standard syllabus prompts!
            </p>
          </div>
          <div className="p-5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl flex flex-col items-center justify-center space-y-3 shrink-0 text-center w-full md:w-56">
            <Flame className="w-10 h-10 text-amber-200 animate-pulse" />
            <span className="text-sm font-bold">Comprehensive Audio lectures & textbook guides</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase">In Active Dev</span>
          </div>
        </div>

        {/* Blog Builder Teaser */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-gray-150 rounded-2xl flex flex-col justify-between h-56 hover:shadow-xs transition">
            <div className="space-y-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-800">
                Blog Website Builder
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Publish a professional web presence or writing platform instantly from basic templates without writing a single line of frontend code.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 border px-2.5 py-1 rounded w-fit uppercase">
              Phase 3 Release
            </span>
          </div>

          <div className="p-6 bg-white border border-gray-150 rounded-2xl flex flex-col justify-between h-56 hover:shadow-xs transition">
            <div className="space-y-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-800">
                AI Diagnostics & Syllabus Companion
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Connect your medical or engineering courses directly to a smart companion that auto-tests your knowledge gaps with practice exams.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 border px-2.5 py-1 rounded w-fit uppercase">
              In Ideation Phase
            </span>
          </div>
        </div>

        {/* WhatsApp Consultation Action */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-gray-800 flex items-center justify-center sm:justify-start">
              <HelpCircle className="w-5 h-5 text-emerald-500 mr-1.5" />
              Got an Idea for a New Tool?
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              We are always building! Partner with us to add custom calculators, tools, or portals to the VLX suite.
            </p>
          </div>

          <a
            href="https://wa.me/2348136390030"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm tracking-wide flex items-center space-x-2 transition cursor-pointer shrink-0"
          >
            <MessageCircle className="w-5 h-5 fill-white text-emerald-500" />
            <span>Message on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
