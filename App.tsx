"use client";

import React, { useState } from "react";
import { Copy, Check, Clock, Hash, Zap, Sparkles, CheckCircle2 } from "lucide-react";

type Post = {
  id: number;
  text: string;
  timeSlot: "Morning" | "Mid-day" | "Evening" | "Late Night";
  category: "Organizers" | "Ticketing" | "Hobby Hosts" | "Hackathons" | "Socials" | "Event Goers";
};

const INITIAL_POSTS: Post[] = [
  // Morning - Focus: General Hosts & Casual Gatherings
  {
    id: 1,
    text: "Trying to coordinate a D&D session or board game night in a WhatsApp group chat is an extreme sport. 5 people say 'I'm down' then vanish into the shadow realm. Set a hard RSVP cap on try-unihub.click and let the real ones lock it in.",
    timeSlot: "Morning",
    category: "Hobby Hosts"
  },
  {
    id: 2,
    text: "If your local community, club, or fitness group is still using generic text blasts to announce meetups, half your crowd is missing it. Build a dedicated, clean event hub for your group at try-unihub.click 🎯",
    timeSlot: "Morning",
    category: "Organizers"
  },
  // Mid-day - Focus: Professional Events, Ticketing & Hackathons
  {
    id: 3,
    text: "Hosting a technical hackathon, pitch night, or workshop? Don't let your registrations get buried in a messy email chain or a boring flat form. Keep your dynamic schedule and RSVPs clean at try-unihub.click.",
    timeSlot: "Mid-day",
    category: "Hackathons"
  },
  {
    id: 4,
    text: "Promoters paying massive percentage transaction fees to corporate ticketing platforms just to host a local live gig... why? Keep your margins, manage your guest list, and own your crowd at try-unihub.click.",
    timeSlot: "Mid-day",
    category: "Ticketing"
  },
  // Evening - Focus: Socials & Large Event Goers
  {
    id: 5,
    text: "Managing wedding RSVPs or formal dinner invites on a chaotic, manual spreadsheet is how villains are born. Free registration, ticketed entry, or private RSVP—UniHub handles your guest lists smoothly. try-unihub.click 💍",
    timeSlot: "Evening",
    category: "Socials"
  },
  {
    id: 6,
    text: "The best events aren't the ones with the biggest corporate ad budget; they're the ones where the community actually interacts. From underground DJ sets to local art pop-ups, find your scene: try-unihub.click",
    timeSlot: "Evening",
    category: "Event Goers"
  },
  // Late Night - Focus: Community Building & FOMO Prevention
  {
    id: 7,
    text: "Unpopular opinion: The best friendships aren't made via social media algorithms; they're made at highly specific, chaotic game nights or niche meetups you stumbled into. Find your next core memory at try-unihub.click.",
    timeSlot: "Late Night",
    category: "Event Goers"
  },
  {
    id: 8,
    text: "If you are hosting a house party, an RSVP cap is your best friend. Don't let 50 random people show up to a 10-person apartment layout. Protect your space, manage your events cleanly: try-unihub.click 🕒",
    timeSlot: "Late Night",
    category: "Organizers"
  }
];

export default function UniHubContentBank() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [publishedIds, setPublishedIds] = useState<number[]>([]);

  const tabs = ["All", "Morning", "Mid-day", "Evening", "Late Night"];

  const filteredPosts =
    activeTab === "All"
      ? INITIAL_POSTS
      : INITIAL_POSTS.filter((post) => post.timeSlot === activeTab);

  const handleCopy = async (id: number, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePublished = (id: number) => {
    setPublishedIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Zap className="text-indigo-500" size={32} />
              UniHub Content Bank
            </h1>
            <p className="text-slate-400 mt-2">
              Cross-Platform Event Marketing Matrix
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle2 className="text-emerald-500" size={16} />
            <span className="text-emerald-400 font-medium">
              {publishedIds.length} Strategies Dispatched
            </span>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => {
            const charCount = post.text.length;
            const isOverLimit = charCount > 280;
            const isPublished = publishedIds.includes(post.id);

            return (
              <div
                key={post.id}
                className={`bg-slate-900 border rounded-xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  isPublished
                    ? "border-emerald-500/30 opacity-60 grayscale-[0.3]"
                    : "border-slate-800 hover:border-indigo-500/50"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                        <Clock size={14} />
                        {post.timeSlot}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                        <Hash size={14} />
                        {post.category}
                      </span>
                    </div>
                    {isPublished && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                        <CheckCircle2 size={14} />
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className={`leading-relaxed ${isPublished ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-300'}`}>
                    {post.text}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
                  <span
                    className={`text-xs font-medium ${
                      isOverLimit ? "text-red-400" : "text-slate-500"
                    }`}
                  >
                    {charCount} / 280
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublished(post.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        isPublished
                          ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {isPublished ? "Undo" : "Mark Sent"}
                    </button>
                    
                    <button
                      onClick={() => handleCopy(post.id, post.text)}
                      disabled={isPublished}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isPublished 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      }`}
                    >
                      {copiedId === post.id ? (
                        <>
                          <Check size={16} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} /> Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
         }
      
