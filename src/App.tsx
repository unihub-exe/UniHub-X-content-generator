"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Clock, Hash, Sparkles, CheckCircle2, Flame, Trophy, Key, RefreshCw, AlertCircle, Zap } from "lucide-react";

type Post = {
  id: number;
  text: string;
  timeSlot: "Morning" | "Mid-day" | "Evening" | "Late Night";
  category: string;
  xpValue: number;
};

export default function UniHubContentBank() {
  // Key state management
  const [apiKey, setApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  
  // App states
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [publishedIds, setPublishedIds] = useState<number[]>([]);
  
  // Gamification metrics
  const [streak, setStreak] = useState<number>(0);
  const [totalXp, setTotalXp] = useState<number>(0);

  // Hydrate states from localStorage on initialization
  useEffect(() => {
    const savedKey = localStorage.getItem("unihub_gemini_key");
    const savedPosts = localStorage.getItem("unihub_cached_posts");
    const savedPublished = localStorage.getItem("unihub_published_ids");
    const savedStreak = localStorage.getItem("unihub_streak_count");
    const savedXp = localStorage.getItem("unihub_total_xp");

    if (savedKey) setApiKey(savedKey);
    if (savedPosts) setPosts(JSON.parse(savedPosts));
    if (savedPublished) setPublishedIds(JSON.parse(savedPublished));
    if (savedStreak) setStreak(parseInt(savedStreak, 10) || 0);
    if (savedXp) setTotalXp(parseInt(savedXp, 10) || 0);
  }, []);

  // Persist key to local state storage
  const saveApiKey = (key: string) => {
    localStorage.setItem("unihub_gemini_key", key);
    setApiKey(key);
    setShowKeyInput(false);
    setError(null);
  };

  // Generate new content via client-side fetch directly to Gemini API
  const generateDailyMatrix = async () => {
    if (!apiKey) {
      setError("Please add your Gemini API Key first!");
      setShowKeyInput(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    const systemPrompt = `
      You are an expert growth hacker and startup copywriter building in public for "UniHub" (domain: try-unihub.click). 
      UniHub is a platform for events and communities. It handles everything: RSVP management, ticketing, crowd control, and coordination.
      Target Audiences: University student organizers, local event promoters, developers setting up hackathons, gaming hosts coordinating D&D/board game nights, communities tracking meetups, and individuals planning weddings or private ticketed parties.
      
      Generate exactly 4 funny, punchy, self-aware, highly engaging posts for X (Twitter) tailored to specific daily time slots. 
      - Must reference 'try-unihub.click' naturally.
      - Must be under 260 characters.
      - Avoid generic marketing speak. Use witty, relatable, modern conversational humor (referencing group chat chaos, broken spreadsheets, venue confusion, FOMO).
      
      Return ONLY a valid JSON array matching this TypeScript type:
      Array<{ timeSlot: "Morning" | "Mid-day" | "Evening" | "Late Night", category: string, text: string }>
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      // --- THIS IS THE UPDATED FIX ---
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const googleError = errorData?.error?.message || response.statusText || "Unknown API Error";
        throw new Error(`Google API Error: ${googleError}`);
      }
      // -------------------------------

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      
      // Clean up markdown block wraps if present
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const parsed: Array<{ timeSlot: any; category: string; text: string }> = JSON.parse(cleanJson);

      const formattedPosts: Post[] = parsed.map((item, index) => ({
        id: Date.now() + index,
        text: item.text,
        timeSlot: item.timeSlot,
        category: item.category,
        xpValue: 25
      }));

      setPosts(formattedPosts);
      setPublishedIds([]);
      localStorage.setItem("unihub_cached_posts", JSON.stringify(formattedPosts));
      localStorage.setItem("unihub_published_ids", JSON.stringify([]));
      
      // Bump streak count on successful generation cycle
      const currentStreak = streak === 0 ? 1 : streak;
      setStreak(currentStreak);
      localStorage.setItem("unihub_streak_count", currentStreak.toString());

    } catch (err: any) {
      setError(err.message || "An unexpected generation anomaly occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (id: number, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePublished = (id: number) => {
    let updatedPublished: number[] = [];
    let xpBonus = 0;

    if (publishedIds.includes(id)) {
      updatedPublished = publishedIds.filter((pId) => pId !== id);
      xpBonus = -25;
    } else {
      updatedPublished = [...publishedIds, id];
      xpBonus = 25;
    }

    setPublishedIds(updatedPublished);
    localStorage.setItem("unihub_published_ids", JSON.stringify(updatedPublished));
    
    const nextXp = Math.max(0, totalXp + xpBonus);
    setTotalXp(nextXp);
    localStorage.setItem("unihub_total_xp", nextXp.toString());

    // Trigger streak milestone step adjustments if entire matrix goes live
    if (updatedPublished.length === posts.length && posts.length > 0) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      localStorage.setItem("unihub_streak_count", nextStreak.toString());
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-slate-100 p-4 md:p-8 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Playful Gamified SaaS Header */}
        <header className="bg-[#1f2937] border-b-4 border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center border-b-4 border-indigo-800 shadow-md transform -rotate-3 hover:rotate-0 transition-transform">
              <Zap className="text-amber-300 fill-amber-300" size={30} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">UniHub Marketing Desk</h1>
              <p className="text-sm font-semibold text-indigo-400">Automated Social Content Matrix</p>
            </div>
          </div>

          {/* Duolingo Style Progress Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-500/10 border-2 border-amber-500/30 px-3 py-1.5 rounded-xl font-bold text-amber-400 text-sm shadow-sm">
              <Flame size={18} className="fill-amber-500" />
              <span>{streak} DAY STREAK</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border-2 border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold text-emerald-400 text-sm shadow-sm">
              <Trophy size={18} className="fill-emerald-500" />
              <span>{totalXp} XP</span>
            </div>
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border-2 border-slate-600 text-slate-300 transition-colors"
              title="Configure API Key"
            >
              <Key size={18} />
            </button>
          </div>
        </header>

        {/* API Settings Dropdown Panel */}
        {showKeyInput && (
          <div className="bg-[#1f2937] border-2 border-indigo-500/40 rounded-2xl p-5 shadow-inner space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Key size={16} />
              <span>Gemini Developer Key Configuration</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Paste your API key here (AI Studio)"
                defaultValue={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-xs text-slate-400">Keys are kept strictly local to your device container sandbox.</p>
          </div>
        )}

        {/* Error Handling Alert Banner */}
        {error && (
          <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-400 text-sm font-semibold">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Master Generation Call to Action Control */}
        <div className="text-center">
          <button
            onClick={generateDailyMatrix}
            disabled={isLoading}
            className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 active:translate-y-1 text-white px-8 py-4 rounded-2xl font-black tracking-wide shadow-[0_4px_0_0_#4338ca] hover:shadow-[0_2px_0_0_#4338ca] transition-all flex items-center justify-center gap-3 border-2 border-indigo-400 mx-auto disabled:opacity-50 text-base"
          >
            {isLoading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>ASSEMBLING FRESH TACTICS...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="fill-indigo-200" />
                <span>GENERATE TODAY'S EXPANDED MATRIX</span>
              </>
            )}
          </button>
        </div>

        {/* Matrix Card Dynamic Presentation Interface */}
        {posts.length === 0 ? (
          <div className="bg-[#1f2937] border-4 border-dashed border-slate-700 rounded-3xl p-12 text-center space-y-4">
            <p className="text-slate-400 font-bold text-lg">No content loaded inside today's queue matrix.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Tap the generation engine above to synthesize unique content vectors targeted to multi-tier organizers using Gemini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => {
              const charCount = post.text.length;
              const isOverLimit = charCount > 280;
              const isPublished = publishedIds.includes(post.id);

              return (
                <div
                  key={post.id}
                  className={`bg-[#1f2937] border-2 border-b-8 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                    isPublished
                      ? "border-emerald-600/30 bg-[#1f2937]/40 opacity-50 shadow-none scale-[0.99]"
                      : "border-slate-700 shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                          <Clock size={12} />
                          {post.timeSlot}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                          <Hash size={12} />
                          {post.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        +{post.xpValue} XP
                      </span>
                    </div>

                    <p className={`text-[15px] font-medium leading-relaxed ${isPublished ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {post.text}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className={`text-xs font-mono font-bold ${isOverLimit ? "text-rose-400" : "text-slate-500"}`}>
                      {charCount} / 280
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublished(post.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-b-4 ${
                          isPublished
                            ? "bg-slate-800 border-slate-900 text-slate-400"
                            : "bg-emerald-600 border-emerald-800 text-white hover:bg-emerald-500"
                        }`}
                      >
                        {isPublished ? "Undo" : "Mark Dispatched"}
                      </button>

                      <button
                        onClick={() => handleCopy(post.id, post.text)}
                        disabled={isPublished}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black border-b-4 transition-all ${
                          isPublished
                            ? "bg-slate-800 text-slate-600 border-transparent cursor-not-allowed"
                            : "bg-indigo-500 border-indigo-700 hover:bg-indigo-400 text-white"
                        }`}
                      >
                        {copiedId === post.id ? <Check size={14} className="mx-auto" /> : <Copy size={14} className="mx-auto" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
               }disabled:opacity-50 text-base"
          >
            {isLoading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>ASSEMBLING FRESH TACTICS...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="fill-indigo-200" />
                <span>GENERATE TODAY'S EXPANDED MATRIX</span>
              </>
            )}
          </button>
        </div>

        {/* Matrix Card Dynamic Presentation Interface */}
        {posts.length === 0 ? (
          <div className="bg-[#1f2937] border-4 border-dashed border-slate-700 rounded-3xl p-12 text-center space-y-4">
            <p className="text-slate-400 font-bold text-lg">No content loaded inside today's queue matrix.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Tap the generation engine above to synthesize unique content vectors targeted to multi-tier organizers using Gemini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => {
              const charCount = post.text.length;
              const isOverLimit = charCount > 280;
              const isPublished = publishedIds.includes(post.id);

              return (
                <div
                  key={post.id}
                  className={`bg-[#1f2937] border-2 border-b-8 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                    isPublished
                      ? "border-emerald-600/30 bg-[#1f2937]/40 opacity-50 shadow-none scale-[0.99]"
                      : "border-slate-700 shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                          <Clock size={12} />
                          {post.timeSlot}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                          <Hash size={12} />
                          {post.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        +{post.xpValue} XP
                      </span>
                    </div>

                    <p className={`text-[15px] font-medium leading-relaxed ${isPublished ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {post.text}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className={`text-xs font-mono font-bold ${isOverLimit ? "text-rose-400" : "text-slate-500"}`}>
                      {charCount} / 280
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublished(post.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-b-4 ${
                          isPublished
                            ? "bg-slate-800 border-slate-900 text-slate-400"
                            : "bg-emerald-600 border-emerald-800 text-white hover:bg-emerald-500"
                        }`}
                      >
                        {isPublished ? "Undo" : "Mark Dispatched"}
                      </button>

                      <button
                        onClick={() => handleCopy(post.id, post.text)}
                        disabled={isPublished}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black border-b-4 transition-all ${
                          isPublished
                            ? "bg-slate-800 text-slate-600 border-transparent cursor-not-allowed"
                            : "bg-indigo-500 border-indigo-700 hover:bg-indigo-400 text-white"
                        }`}
                      >
                        {copiedId === post.id ? <Check size={14} className="mx-auto" /> : <Copy size={14} className="mx-auto" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
  }
                                                
