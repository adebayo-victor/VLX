import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  ArrowLeft,
  Lock,
  Phone,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AnonymousMessage } from "../types";

interface AnonymousInboxProps {
  onBack: () => void;
}

export default function AnonymousInbox({ onBack }: AnonymousInboxProps) {
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [content, setContent] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Status state
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Error fetching anonymous messages:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setFormError("Please enter your secret message first!");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(false);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          phoneNumber: phoneNumber.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("Server failed to submit note");

      setFormSuccess(true);
      setContent("");
      setPhoneNumber("");

      await fetchMessages();

      // Clear success notification after 5s
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err: any) {
      setFormError(err.message || "Failed to deliver message anonymously.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back nav */}
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-vlx-l transition duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Dashboard
      </button>

      {/* Title */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display">
            Vicade's Anonymous Inbox
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Send highly secure, private messages directly to Vicade. Safe, end-to-end client-server transmission.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side Form card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 md:p-8 space-y-6">
            <div>
              {/* Rainbow Gradient Title to replicate the original app */}
              <h2 className="text-2xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-pink-500 font-display">
                  Vicade's anonymous messages
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">Send a private message to Vicade below.</p>
            </div>

            {/* Privacy Lock card */}
            <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl flex items-start space-x-3 text-purple-950 text-xs">
              <Lock className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">100% Client-Omitted Identity</p>
                <p className="text-purple-700 mt-0.5">
                  We omit cookies, user agent metadata, and browser footprints before saving to the server. Complete safety guaranteed.
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* WhatsApp Contact option */}
              <div>
                <label htmlFor="phoneNumber" className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  WhatsApp Number <span className="text-gray-400 font-normal ml-1">(Optional, for private reply)</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +234 813 639 0030"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white"
                />
              </div>

              {/* Message block */}
              <div>
                <label htmlFor="content" className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Write Your Anonymous Note
                </label>
                <textarea
                  id="content"
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message here. It's completely anonymous and private..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white"
                />
              </div>

              {/* Status block */}
              <AnimatePresence>
                {formSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-green-50 border border-green-100 text-green-800 text-xs rounded-lg flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Secret note delivered anonymously! Vicade will receive it shortly.</span>
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
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Note Anonymously</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Message List Board */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 md:p-8 flex flex-col h-[550px]">
          <div className="border-b pb-3 shrink-0 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-gray-800">Note Activity</h3>
              <p className="text-xs text-gray-400">Public log of incoming anonymous messages.</p>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              Messages: {messages.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                <span className="text-xs">Connecting to safe transmission lines...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 py-16 px-4">
                <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
                <span className="text-sm font-semibold">Inbox is clear</span>
                <span className="text-xs text-gray-400 mt-1">Be the first to submit a secret note to Vicade.</span>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="font-bold flex items-center">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 mr-1" />
                      Anonymous Note #{m.id}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    {m.content}
                  </p>
                  {m.phoneNumber && (
                    <span className="inline-flex items-center text-[10px] font-mono bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded">
                      Contact provided: {m.phoneNumber}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
