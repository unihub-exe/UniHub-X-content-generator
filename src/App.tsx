"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Sparkles, Flame, Star, Bell, Plus, MoreVertical } from "lucide-react";

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

  const saveApiKey = (key: string) => {
    localStorage.setItem("unihub_gemini_key", key);
    setApiKey(key);
  };

  const generateDailyMatrix = async () => {
    if (!apiKey) {
      setError("Please add your Gemini API Key first!");
      setShowKeyInput(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    const systemPrompt = "You are an expert growth hacker and startup copywriter building in public for 'UniHub' (domain: try-unihub.click). UniHub is a platform for events and communities. It handles everything: RSVP management, ticketing, crowd control, and coordination. Target Audiences: University student organizers, local event promoters, developers setting up hackathons, gaming hosts coordinating D&D/board game nights, communities tracking meetups, and individuals planning weddings or private ticketed parties. Generate exactly 4 funny, punchy, self-aware, highly engaging posts for X (Twitter) tailored to specific daily time slots. Must reference 'try-unihub.click' naturally. Must be under 260 characters. Avoid generic marketing speak. Use witty, relatable, modern conversational humor. Return ONLY a valid JSON array matching this TypeScript type: Array<{ timeSlot: 'Morning' | 'Mid-day' | 'Evening' | 'Late Night', category: string, text: string }>";

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google API Error: ${errorData?.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      
      // Mobile-friendly safe JSON cleaning without dangerous regex literal blocks
      let cleanJson = rawText.trim();
      if (cleanJson.startsWith("```json")) cleanJson = cleanJson.slice(7);
      if (cleanJson.startsWith("```")) cleanJson = cleanJson.slice(3);
      if (cleanJson.endsWith("```")) cleanJson = cleanJson.slice(0, -3);
      cleanJson = cleanJson.trim();

      const parsed: Array<{ timeSlot: "Morning" | "Mid-day" | "Evening" | "Late Night"; category: string; text: string }> = JSON.parse(cleanJson);

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

    if (updatedPublished.length === posts.length && posts.length > 0) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      localStorage.setItem("unihub_streak_count", nextStreak.toString());
    }
  };

  const getCardStyles = (timeSlot: string) => {
    switch (timeSlot) {
      case "Morning":
        return {
          bg: "bg-[#FDECA6]",
          rotation: "rotate-1",
          tape: "bg-white/60 w-20 h-6 -top-3 rotate-2",
          doodle: "you got this\n=)",
        };
      case "Mid-day":
        return {
          bg: "bg-[#D8C4FE]",
          rotation: "-rotate-1",
          tape: "bg-[#1E1E1E] w-16 h-7 -top-3 -rotate-2",
          doodle: "x x\n \\_/",
        };
      case "Evening":
        return {
          bg: "bg-[#BFFCC6]",
          rotation: "rotate-0",
          tape: "bg-[#80E487] w-24 h-6 -top-3 rotate-1",
          doodle: "chaos\nbut make it\nprofessional  *",
        };
      case "Late Night":
      default:
        return {
          bg: "bg-[#FDFDFD]",
          rotation: "rotate-1",
          tape: "bg-[#1E1E1E] w-16 h-6 -top-3 rotate-1",
          doodle: "go to\nsleep  z Z\n      z",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-gray-900 font-sans relative overflow-hidden flex justify-center py-10 px-4 md:px-8 selection:bg-black selection:text-white">
      {/* Dynamic injection of the font to maintain full self-containment */}
      <link href="[https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap](https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap)" rel="stylesheet" />
      
      {/* Decorative right-side dot pattern background style */}
      <div 
        className="absolute top-0 right-0 w-32 h-full opacity-50 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#d1d5db 2px, transparent 2px)",
          backgroundSize: "24px 24px"
        }}
      ></div>

      <div className="max-w-4xl w-full relative z-10 space-y-12">
        
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black tracking-tighter">UNiHUB</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-black transition-colors">
              <Bell size="{22}" strokeWidth="{2.5}"/>
            </button>
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md"
            >
              <Plus size="{22}" strokeWidth="{3}"/>
            </button>
          </div>
        </header>

        {/* Developer configuration drop down block */}
        {showKeyInput && (
          <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 transition-all">
            <h3 className="font-bold text-sm mb-2">Configuration</h3>
            <input
              type="password"
              placeholder="Paste Gemini API Key here"
              defaultValue={apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
            {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          </div>
        )}

        {/* Dashboard Greeting Header block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight flex items-baseline gap-3">
              Good morning, <span className="text-5xl md:text-6xl -mb-2" style={{ fontFamily: "'Caveat', cursive" }}>mimi</span> <span className="text-4xl">👋</span>
            </h1>
            <p className="text-gray-500 text-lg mt-3">Your automated social content matrix is ready.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-gray-100 shadow-sm font-bold text-sm">
              <Flame className="text-orange-500 fill-orange-500" size="{18}"/>
              <span>{streak} DAY STREAK</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-gray-100 shadow-sm font-bold text-sm text-green-600">
              <Star className="fill-green-600" size="{18}"/>
              <span>{totalXp} XP</span>
            </div>
          </div>
        </div>

        {/* Matrix primary trigger controls layout section */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <button
            onClick={generateDailyMatrix}
            disabled={isLoading}
            className="bg-black hover:bg-gray-900 text-white rounded-3xl p-6 flex items-center justify-between w-full md:w-[320px] shadow-xl shadow-black/10 transition-transform active:scale-95 disabled:opacity-80"
          >
            <div className="text-left">
              <span className="block text-lg font-medium leading-tight">Generate Today's<br />Expanded Matrix</span>
            </div>
            <Sparkles ""} "animate-spin" : ? className="{isLoading" size="{28}"/>
          </button>

          <div className="flex-1 bg-white/60 backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-3 text-sm font-medium text-gray-500">
              <span>Today's Progress</span>
              <span>{publishedIds.length} / {posts.length || 4}</span>
            </div>
            <div className="flex gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full flex-1 ${i < publishedIds.length * 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix Card Skeuomorphic Dynamic Container Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 pt-4">
          {posts.length === 0 && !isLoading && (
             <div className="col-span-2 text-center py-20 text-gray-400 text-3xl" style={{ fontFamily: "'Caveat', cursive" }}>
               Click the black button to brew some content...
             </div>
          )}

          {posts.map((post) => {
            const styles = getCardStyles(post.timeSlot);
            const charCount = post.text.length;
            const isPublished = publishedIds.includes(post.id);

            return (
              <div
                key={post.id}
                className={`relative ${styles.bg} ${styles.rotation} p-8 pb-6 rounded-sm shadow-xl shadow-black/5 flex flex-col min-h-[380px] transition-all hover:scale-[1.02] ${isPublished ? 'opacity-60' : ''}`}
              >
                {/* Tape accent mimic decoration element */}
                <div className={`absolute left-1/2 -translate-x-1/2 ${styles.tape} shadow-sm backdrop-blur-sm z-10`}></div>

                {/* Card contextual informational metadata row */}
                <div className="flex justify-between items-start mb-6 mt-2">
                  <div className="space-y-3">
                    <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                      {post.timeSlot}
                    </span>
                    <h3 className="text-[15px] font-medium text-gray-900">
                      # {post.category}
                    </h3>
                  </div>
                  <span className="bg-green-100/80 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200/50">
                    +{post.xpValue} XP
                  </span>
                </div>

                {/* Main Text Content */}
                <p className={`text-[17px] leading-relaxed text-gray-900 flex-1 font-medium ${isPublished ? 'line-through opacity-70' : ''}`}>
                  {post.timeSlot === "Mid-day" ? `"${post.text}"` : post.text}
                </p>

                {/* Inline styled hand drawn cursive doodle graphics element */}
                <div className="h-20 flex items-center justify-end pr-4 text-gray-700 opacity-80">
                  <pre className="text-2xl leading-tight transform -rotate-6" style={{ fontFamily: "'Caveat', cursive" }}>
                    {styles.doodle}
                  </pre>
                </div>

                {/* Card action controls interaction elements */}
                <div className="flex items-center justify-between mt-4 text-gray-800">
                  <span className="text-xs font-bold">
                    {charCount} / 280
                  </span>

                  <div className="flex items-center gap-4">
                    {post.timeSlot === "Late Night" && (
                      <button 
                        onClick={() => togglePublished(post.id)}
                        className="bg-black text-white text-[11px] font-bold px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
                      >
                        {isPublished ? "Undo" : "Mark Dispatched"}
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(post.id, post.text)}
                      className="hover:text-black transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedId === post.id ? <Check size="{18}" strokeWidth="{2.5}"/> : <Copy size="{18}" strokeWidth="{2.5}"/>}
                    </button>
                    
                    <button className="hover:text-black transition-colors">
                      <MoreVertical size="{18}" strokeWidth="{2.5}"/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Accent Handwriting Slogan Graphic Section */}
        <div className="pt-16 pb-10 flex justify-center items-center gap-6 relative">
           <div className="absolute left-1/4 bottom-16 opacity-70">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                 <path d="M12 3v18M3 12h18M6.5 6.5l11 11M6.5 17.5l11-11" />
              </svg>
           </div>
           
           <p className="text-4xl text-black relative inline-block" style={{ fontFamily: "'Caveat', cursive" }}>
             Automate the chaos. Get your life back.
             <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-yellow-400 rotate-1"></span>
           </p>
           
           <Sparkles className="fill-black text-black rotate-12 mt-4" size="{24}"/>
        </div>

      </div>
    </div>
  );
            }
      
