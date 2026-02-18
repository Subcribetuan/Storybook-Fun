import { Switch, Route, useLocation } from "wouter";
import { motion, AnimatePresence, useScroll, useTransform, Variants } from "framer-motion";
import { Star, Moon, BookOpen, ArrowLeft, Heart, Sparkles, User, Play, Pause, Volume2, X, Music, Check, ArrowRight, Sun, Cloud, PartyPopper, Search, Lock, LogOut, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stories as builtInStories } from "@/lib/stories";
import { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";
import { fetchCustomStories, createStory, deleteStory, dbStoryToAppStory, type DbStory } from "@/lib/supabase";

// --- All Stories Context (hardcoded + Supabase) ---
interface AllStoriesCtx {
  stories: Story[];
  refreshCustom: () => void;
}
const AllStoriesContext = createContext<AllStoriesCtx>({ stories: builtInStories as Story[], refreshCustom: () => {} });
function useAllStories() { return useContext(AllStoriesContext); }

// --- Read Tracking (localStorage) ---
const STORAGE_KEY = "wondertales-read-stories";

function getReadStories(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function markStoryRead(id: number) {
  const read = getReadStories();
  read.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(read)));
}

function toggleStoryRead(id: number): boolean {
  const read = getReadStories();
  if (read.has(id)) {
    read.delete(id);
  } else {
    read.add(id);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(read)));
  return read.has(id);
}

function useReadStories() {
  const [readSet, setReadSet] = useState<Set<number>>(() => getReadStories());

  const refresh = useCallback(() => setReadSet(getReadStories()), []);

  const markRead = useCallback((id: number) => {
    markStoryRead(id);
    refresh();
  }, [refresh]);

  const toggle = useCallback((id: number) => {
    toggleStoryRead(id);
    refresh();
  }, [refresh]);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  return { readSet, markRead, toggle, refresh };
}

// --- Auth (simple password gate) ---
const AUTH_KEY = "wondertales-authed";
// SHA-256 hash of the password — change by hashing your new password
const PASSWORD_HASH = "3cdf50e92f3d0967ce56132bba8432c0dac2034429ea108f5dac90a3d49db584";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function isAuthed(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true" || sessionStorage.getItem(AUTH_KEY) === "true";
}

function setAuthed(value: boolean, remember = false) {
  if (value) {
    if (remember) {
      localStorage.setItem(AUTH_KEY, "true");
    } else {
      sessionStorage.setItem(AUTH_KEY, "true");
    }
  } else {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
  }
}

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const hash = await hashPassword(password.trim());
    if (hash === PASSWORD_HASH) {
      setAuthed(true, remember);
      onSuccess();
    } else {
      setError(true);
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[#FFFBF0] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-amber-200 selection:text-amber-900">
      {/* Background decor */}
      <div className="absolute top-20 left-10 text-yellow-400/40 pointer-events-none">
        <FloatingElement delay={0} duration={6}><Star size={48} fill="currentColor" /></FloatingElement>
      </div>
      <div className="absolute top-32 right-16 text-amber-300/40 pointer-events-none">
        <FloatingElement delay={1} duration={7}><Moon size={64} fill="currentColor" /></FloatingElement>
      </div>
      <div className="absolute bottom-32 left-16 text-orange-300/40 pointer-events-none">
        <FloatingElement delay={2} duration={8}><Heart size={40} fill="currentColor" /></FloatingElement>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-sm"
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center shadow-sm">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-800 text-center mb-2">
          Welcome Back!
        </h1>
        <p className="text-sm text-slate-500 font-body text-center mb-8">
          Enter the magic password to open the storybook
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Magic password..."
              autoFocus
              className={cn(
                "w-full px-5 py-4 bg-white/80 backdrop-blur-md rounded-2xl border-2 focus:outline-none shadow-sm text-base font-body text-slate-700 placeholder:text-slate-400 pr-12 transition-colors",
                error ? "border-red-300 focus:border-red-400" : "border-amber-100 focus:border-amber-400"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none px-1">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-amber-300 text-amber-500 accent-amber-500 cursor-pointer"
            />
            <span className="text-sm text-slate-500 font-body">Remember me</span>
          </label>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 font-bold text-center"
            >
              Oops! That's not the magic word. Try again!
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full rounded-2xl h-14 text-lg font-bold shadow-lg bg-amber-500 hover:bg-amber-600 transition-all disabled:opacity-50"
          >
            {loading ? "Checking..." : "Open the Storybook"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// --- Types ---
interface Story {
  id: number;
  title: string;
  category: string;
  readTime: string;
  emoji: string;
  color: string;
  pages: { text: string }[];
  isCustom?: boolean;
  dbId?: number;
}

// --- Components ---

function FloatingElement({ children, delay = 0, duration = 4, yOffset = 10, xOffset = 0 }: any) {
  return (
    <motion.div
      animate={{ 
        y: [0, -yOffset, 0],
        x: [0, xOffset, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function StoryBookCard({ story, onClick, index, isRead, onToggleRead, onDelete }: { story: Story; onClick: () => void; index: number; isRead?: boolean; onToggleRead?: () => void; onDelete?: () => void }) {
  // Soft warm pastels that harmonize with #FFFBF0 cream background
  const pastels = [
    { bg: "bg-[#FFEDE1]", accent: "text-[#E8956A]", ring: "ring-[#FFDDCC]" }, // warm peach
    { bg: "bg-[#FFF3E0]", accent: "text-[#D4A053]", ring: "ring-[#FFE8C8]" }, // golden cream
    { bg: "bg-[#FFE8E0]", accent: "text-[#D4736A]", ring: "ring-[#FFDAD4]" }, // soft blush
    { bg: "bg-[#FFF5EB]", accent: "text-[#C49060]", ring: "ring-[#FFEBD4]" }, // sandy warm
    { bg: "bg-[#FFECD2]", accent: "text-[#CC8844]", ring: "ring-[#FFE0BB]" }, // apricot
  ];

  const palette = pastels[story.id % pastels.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 140, damping: 20 }}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className={cn(
        "relative h-[160px] md:h-[280px] w-full rounded-3xl overflow-hidden transition-all duration-300 ring-1",
        "shadow-[0_2px_12px_-4px_rgba(180,140,100,0.15)] hover:shadow-[0_8px_24px_-6px_rgba(180,140,100,0.25)]",
        palette.bg,
        palette.ring
      )}>
        {/* Soft inner glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/20 pointer-events-none" />

        {/* Delete Button (custom stories only) */}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute top-2 left-2 md:top-3 md:left-3 z-10 w-6 h-6 md:w-8 md:h-8 bg-red-400 hover:bg-red-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white transition-colors md:opacity-0 md:group-hover:opacity-100"
            title="Delete story"
          >
            <Trash2 size={12} className="text-white md:w-4 md:h-4" />
          </button>
        )}

        {/* Read Badge */}
        {isRead && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 md:top-3 md:right-3 z-10"
          >
            <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-400 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
              <Check size={14} className="text-white md:w-5 md:h-5" />
            </div>
          </motion.div>
        )}

        {/* Emoji */}
        <div className={cn("flex items-center justify-center pt-6 md:pt-10", isRead && "opacity-70")}>
          <motion.span
            whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-4xl md:text-6xl drop-shadow-sm select-none"
          >
            {story.emoji}
          </motion.span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
          <h3 className={cn("text-xs md:text-base font-display font-bold leading-snug line-clamp-2 mb-0.5 md:mb-1", isRead ? "text-slate-500" : "text-slate-700")}>
            {story.title}
          </h3>
          <div className="flex items-center gap-1.5">
            <BookOpen size={10} className={cn("md:w-3 md:h-3", palette.accent)} />
            <span className={cn("text-[10px] md:text-xs font-medium", palette.accent)}>{story.readTime}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const categoryMeta: Record<string, { icon: typeof Moon; label: string }> = {
  bedtime: { icon: Moon, label: "Bedtime" },
  "paw-patrol": { icon: Star, label: "Paw Patrol" },
  swimming: { icon: Cloud, label: "Swimming" },
  breathing: { icon: Heart, label: "Breathing" },
};

type FilterMode = "all" | "new" | "read";

function Home() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const { readSet, toggle } = useReadStories();
  const { toast } = useToast();
  const { stories, refreshCustom } = useAllStories();

  const handleMagic = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#F5A623', '#E8956A', '#D4A053'],
      zIndex: 200,
      gravity: 0.8,
      scalar: 1.2
    });
    toast({
      title: "✨ Magic Activated!",
      description: "You found the hidden sparkles!",
      duration: 3000,
    });
  };

  const searchFiltered = search.trim()
    ? stories.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    : null;

  const categories = useMemo(() => {
    const cats: string[] = [];
    stories.forEach((s) => { if (!cats.includes(s.category)) cats.push(s.category); });
    return cats;
  }, [stories]);

  const handleDeleteStory = async (story: Story) => {
    if (!story.isCustom || !story.dbId) return;
    if (!confirm(`Delete "${story.title}"?`)) return;
    try {
      await deleteStory(story.dbId);
      refreshCustom();
      toast({ title: "Story deleted", description: `"${story.title}" has been removed.` });
    } catch (e) {
      toast({ title: "Error deleting story", description: String(e) });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] relative overflow-x-clip selection:bg-amber-200 selection:text-amber-900">
      {/* Background Map Image */}
      <div
        className="fixed inset-0 opacity-15 pointer-events-none mix-blend-multiply transition-opacity duration-1000"
        style={{ backgroundImage: `url('/map-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      {/* Animated Background Gradients */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FFFBF0] pointer-events-none" />

      {/* Floating Decor */}
      <div className="absolute top-20 left-10 text-yellow-400/60 pointer-events-none">
        <FloatingElement delay={0} duration={6}><Star size={64} fill="currentColor" /></FloatingElement>
      </div>
      <div className="absolute top-40 right-20 text-amber-300/60 pointer-events-none">
        <FloatingElement delay={1} duration={7} xOffset={20}><Moon size={84} fill="currentColor" /></FloatingElement>
      </div>
      <div className="absolute bottom-40 left-20 text-orange-300/60 pointer-events-none">
        <FloatingElement delay={2} duration={8} yOffset={-20}><Heart size={56} fill="currentColor" /></FloatingElement>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => { setAuthed(false); window.location.reload(); }}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-amber-100 shadow-sm hover:shadow-md hover:bg-white transition-all group"
        title="Lock storybook"
      >
        <LogOut size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
      </button>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:py-16">
        {/* Header */}
        <header className="text-center mb-6 md:mb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMagic}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-md rounded-full border-2 border-amber-200 mb-4 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
          >
            <Sparkles className="w-5 h-5 text-amber-400 group-hover:animate-spin" />
            <span className="text-amber-700 font-bold text-sm tracking-wide uppercase">The Magical Library</span>
          </motion.button>

          <h1 className="text-3xl md:text-6xl font-display font-extrabold text-slate-800 leading-[0.95] tracking-tight drop-shadow-sm">
            Christopher & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 animate-gradient-x">Benjamin's World</span>
          </h1>
          <p className="mt-2 md:mt-4 text-sm md:text-xl text-slate-500 font-body max-w-2xl mx-auto leading-relaxed">
            Pick a story to start your adventure!
          </p>
        </header>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8 md:mb-12">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories..."
            className="w-full pl-11 pr-4 py-3 md:py-4 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-amber-100 focus:border-amber-400 focus:outline-none shadow-sm hover:shadow-md transition-all text-sm md:text-base font-body text-slate-700 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 transition-colors">
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {readSet.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-6 md:mb-10"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-500" />
                  Reading Progress
                </span>
                <span className="text-sm font-bold text-amber-600">
                  {readSet.size} / {stories.length} stories
                </span>
              </div>
              <div className="h-3 w-full bg-amber-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(readSet.size / stories.length) * 100}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                />
              </div>
              {readSet.size === stories.length && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-amber-600 font-bold mt-2 text-center"
                >
                  You've read every story! What a superstar!
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* Sticky Filter Bar — category tabs + read/new filter */}
        <div className="sticky top-0 z-30 py-3 -mx-6 px-6 bg-[#FFFBF0]/90 backdrop-blur-md space-y-2 mb-6 md:mb-10">
          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCat("all")}
              className={cn(
                "px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all shrink-0",
                selectedCat === "all"
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-white/80 text-slate-500 hover:bg-white hover:text-slate-700 border border-amber-100"
              )}
            >
              All ({stories.length})
            </button>
            {categories.map((cat) => {
              const meta = categoryMeta[cat];
              const Icon = meta?.icon;
              const count = stories.filter((s) => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={cn(
                    "px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all shrink-0 inline-flex items-center gap-1.5",
                    selectedCat === cat
                      ? "bg-amber-500 text-white shadow-md"
                      : "bg-white/80 text-slate-500 hover:bg-white hover:text-slate-700 border border-amber-100"
                  )}
                >
                  {Icon && <Icon size={14} />}
                  {meta?.label || cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Read / New Filter */}
          <div className="flex items-center justify-center gap-2">
            {([
              { key: "all" as FilterMode, label: "All" },
              { key: "new" as FilterMode, label: "New" },
              { key: "read" as FilterMode, label: "Read" },
            ]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-xs font-bold transition-all",
                  filter === f.key
                    ? "bg-slate-700 text-white shadow-sm"
                    : "bg-white/60 text-slate-400 hover:bg-white hover:text-slate-600 border border-slate-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        {searchFiltered ? (
          <div>
            <h2 className="text-lg font-display font-bold text-slate-600 mb-4">
              {searchFiltered.length} result{searchFiltered.length !== 1 ? "s" : ""} for "{search}"
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5 pb-32">
              {searchFiltered.map((story, i) => (
                <StoryBookCard key={story.id} story={story} index={i} onClick={() => setLocation(`/story/${story.id}`)} isRead={readSet.has(story.id)} onToggleRead={() => toggle(story.id)} onDelete={story.isCustom ? () => handleDeleteStory(story) : undefined} />
              ))}
            </div>
          </div>
        ) : (
          <div className="pb-20">
            {(() => {
              const catFiltered = selectedCat === "all" ? stories : stories.filter((s) => s.category === selectedCat);
              const displayed = filter === "all" ? catFiltered
                : filter === "new" ? catFiltered.filter((s) => !readSet.has(s.id))
                : catFiltered.filter((s) => readSet.has(s.id));

              if (displayed.length === 0) {
                return (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-4">{filter === "read" ? "📚" : "🎉"}</p>
                    <p className="text-lg text-slate-500 font-body">
                      {filter === "read" ? "No stories read yet. Pick one to start!" : filter === "new" ? "You've read all the stories! Amazing!" : "No stories in this category yet."}
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
                  {displayed.map((story, i) => (
                    <StoryBookCard key={story.id} story={story} index={i} onClick={() => setLocation(`/story/${story.id}`)} isRead={readSet.has(story.id)} onToggleRead={() => toggle(story.id)} onDelete={story.isCustom ? () => handleDeleteStory(story) : undefined} />
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Floating Add Story Button */}
      <motion.button
        onClick={() => setLocation("/add-story")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 w-14 h-14 md:w-16 md:h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-colors"
        title="Add a new story"
      >
        <Plus size={28} />
      </motion.button>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-0 pointer-events-none">
        <svg className="relative block w-[calc(133%+1.3px)] h-[150px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white opacity-40"></path>
             <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white" transform="translate(0, 20)"></path>
        </svg>
      </div>
    </div>
  );
}

function StoryComplete({ onRestart }: { onRestart: () => void }) {
  useEffect(() => {
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#F5A623', '#E8956A', '#ffffff'],
      zIndex: 100,
      gravity: 0.6,
      scalar: 1.5,
      shapes: ['star', 'circle']
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6 md:p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 md:w-32 md:h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-6 md:mb-8 animate-bounce">
        <PartyPopper className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />
      </div>
      <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-3 md:mb-4">You Did It!</h2>
      <p className="text-lg md:text-2xl text-slate-500 font-body mb-8 md:mb-10 max-w-lg">
        You finished the story like a brave explorer! Time for a high five!
      </p>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full max-w-xs md:max-w-none md:w-auto">
        <Button onClick={onRestart} size="lg" className="rounded-full h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl font-bold shadow-xl bg-amber-500 hover:bg-amber-600 hover:scale-105 transition-all w-full md:w-auto">
          Read Again
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline" size="lg" className="rounded-full h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 w-full md:w-auto">
          Pick New Story
        </Button>
      </div>
    </div>
  );
}

const pageVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  })
};

function StoryReader({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const { stories } = useAllStories();
  const story = stories.find((s) => s.id === Number(params.id));
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const totalPages = story?.pages.length || 0;

  if (!story) return null;

  const handleNext = () => {
    if (page < totalPages - 1) {
      setDirection(1);
      setPage(p => p + 1);
    } else {
      // Auto-mark as read when finishing the story
      markStoryRead(story.id);
      setIsComplete(true);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setDirection(-1);
      setPage(p => p - 1);
    }
  };

  const toggleSound = () => {
    toast({
      title: "Audio Enabled 🎵",
      description: "Imagine soft piano music playing...",
      duration: 2000,
    });
  };

  // Scroll to top on page change
  const textScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    textScrollRef.current?.scrollTo(0, 0);
  }, [page]);

  // Swipe gesture support
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only count as swipe if horizontal movement > 50px and more horizontal than vertical
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
  }, [page, totalPages]);

  const currentPage = story.pages[page];
  const progress = ((page + 1) / totalPages) * 100;

  // Format Text — split on any newline(s) for paragraph spacing
  const formattedText = currentPage.text.split(/\n+/).filter(p => p.trim()).map((paragraph, i) => {
    const isDialogue = paragraph.trim().startsWith('"');
    const isSoundEffect = paragraph === paragraph.toUpperCase() && paragraph.length < 50;

    return (
      <motion.p
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 + 0.3 }}
        className={cn(
          "mb-6 text-xl md:text-3xl leading-relaxed font-body text-slate-700",
          isDialogue && "font-bold text-slate-900 pl-6 border-l-4 border-amber-400 bg-amber-50/80 p-4 rounded-r-xl shadow-sm",
          isSoundEffect && "font-display text-4xl md:text-5xl text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 py-4 rotate-2 scale-110 origin-center"
        )}
      >
        {paragraph}
      </motion.p>
    );
  });

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className={cn("absolute inset-0 opacity-15 bg-gradient-to-br transition-colors duration-1000", story.color)} />
      <div className="absolute inset-0 opacity-40 bg-[url('/paper-texture.png')] mix-blend-multiply pointer-events-none" />

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <Button
          variant="secondary"
          onClick={() => setLocation("/")}
          className="rounded-full shadow-lg bg-white hover:bg-gray-50 h-14 w-14 p-0 border-2 border-slate-100 hover:scale-105 transition-transform"
        >
          <X size={24} className="text-slate-600" />
        </Button>

        {/* Progress Bar */}
        <div className="hidden md:flex flex-col items-center flex-1 mx-8 max-w-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Reading Progress</span>
          <div className="h-4 w-full bg-white rounded-full overflow-hidden shadow-inner border border-slate-200">
            <motion.div
              className={cn("h-full bg-gradient-to-r shadow-[0_0_10px_rgba(255,255,255,0.5)]", story.color)}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={toggleSound}
          className="rounded-full shadow-lg bg-white hover:bg-gray-50 h-14 px-6 border-2 border-slate-100 hover:scale-105 transition-transform gap-3 hidden md:flex"
        >
          <Music size={20} className="text-amber-500" />
          <span className="font-bold text-slate-600">Sound On</span>
        </Button>
      </div>

      {/* Book Container — fills viewport height on mobile, aspect-ratio on desktop */}
      <div className="relative w-full max-w-6xl h-[calc(100dvh-6rem)] md:h-auto md:aspect-[16/9] perspective-1000 z-20">
        <motion.div
          className="w-full h-full bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-[12px] border-white relative ring-1 ring-slate-900/5"
          initial={{ rotateX: 10, scale: 0.9, opacity: 0 }}
          animate={{ rotateX: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          {isComplete && <StoryComplete onRestart={() => { setIsComplete(false); setPage(0); }} />}

          {/* Mobile Progress Bar — thin bar at top of card */}
          <div className="md:hidden absolute top-0 left-0 right-0 h-1 bg-slate-200/50 z-40">
            <motion.div
              className={cn("h-full bg-gradient-to-r", story.color)}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            />
          </div>

          {/* Book Spine Center */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-gradient-to-r from-gray-300 to-gray-100 z-30 hidden md:block shadow-inner" />

          {/* Left Page (Visuals) */}
          <div className={cn(
            "hidden md:flex w-1/2 relative overflow-hidden p-12 flex-col justify-center items-center text-white bg-gradient-to-br",
            story.color
          )}>
            {/* Animated Patterns */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[url('/bg-texture.png')] opacity-10 mix-blend-overlay"
            />

            <div className="relative z-10 text-center">
              <motion.div
                key={page}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-[12rem] mb-8 filter drop-shadow-2xl"
              >
                {story.emoji}
              </motion.div>
              <motion.h2
                key={story.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-display font-bold mb-4 drop-shadow-lg px-4 leading-tight"
              >
                {story.title}
              </motion.h2>
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-lg font-bold border border-white/30 mt-6 shadow-lg">
                 Page {page + 1} of {totalPages}
              </div>
            </div>
          </div>

          {/* Right Page (Text) */}
          <div className="flex-1 bg-[#FFFBF0] relative flex flex-col h-full">
            {/* Mobile Header (Emoji) */}
            <div className="md:hidden p-6 pb-0 flex justify-center">
              <div className="text-6xl drop-shadow-md">{story.emoji}</div>
            </div>

            <div ref={textScrollRef} className="flex-1 p-8 md:p-16 overflow-y-auto custom-scrollbar relative overflow-x-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
               {/* Paper Texture Overlay */}
               <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply" style={{ backgroundImage: `url('/paper-texture.png')` }} />

               <AnimatePresence mode="wait" custom={direction}>
                 <motion.div
                   key={page}
                   custom={direction}
                   variants={pageVariants}
                   initial="enter"
                   animate="center"
                   exit="exit"
                   transition={{
                     x: { type: "spring", stiffness: 400, damping: 35 },
                     opacity: { duration: 0.15 },
                     scale: { duration: 0.2 }
                   }}
                   className="relative z-10 min-h-full flex flex-col justify-center origin-left"
                 >
                   {formattedText}
                 </motion.div>
               </AnimatePresence>
            </div>

            {/* Bottom Navigation Area */}
            <div className="p-6 md:p-8 bg-white border-t border-amber-100 flex justify-between items-center relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={page === 0}
                className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-amber-50 h-14 px-6 text-lg"
              >
                <ArrowLeft className="mr-2" size={24} /> Back
              </Button>

              <div className="md:hidden text-sm font-bold text-slate-400 uppercase tracking-widest">
                {page + 1} / {totalPages}
              </div>

              <Button
                size="lg"
                onClick={handleNext}
                className={cn(
                  "rounded-full h-16 px-10 shadow-xl hover:shadow-2xl hover:scale-105 transition-all bg-gradient-to-r text-white border-0 font-bold text-xl",
                  story.color
                )}
              >
                {page === totalPages - 1 ? (
                  <>Finish <Check className="ml-3" size={24} /></>
                ) : (
                  <>Next <ArrowRight className="ml-3" size={24} /></>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- Story Editor Page ---
const EMOJI_OPTIONS = ["📖","🌙","✨","🐾","🏁","🚀","💨","🐟","💦","🧸","🛡️","☁️","👾","🌕","🦁","🐻","🎪","🏰","🌊","🦋","🎈","🌈","⚡","🔥","❄️","🎵","🍎","🌻","🐢","🦊"];
const COLOR_OPTIONS = [
  { label: "Purple", value: "from-purple-500 to-pink-600" },
  { label: "Blue", value: "from-blue-500 to-indigo-600" },
  { label: "Orange", value: "from-orange-500 to-yellow-500" },
  { label: "Green", value: "from-emerald-400 to-teal-500" },
  { label: "Sky", value: "from-sky-400 to-blue-600" },
  { label: "Red", value: "from-red-500 to-rose-600" },
  { label: "Amber", value: "from-amber-400 to-orange-500" },
  { label: "Indigo", value: "from-indigo-500 to-purple-600" },
  { label: "Cyan", value: "from-cyan-400 to-blue-500" },
  { label: "Violet", value: "from-violet-600 to-indigo-600" },
];

function StoryEditor() {
  const [, setLocation] = useLocation();
  const { refreshCustom } = useAllStories();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("bedtime");
  const [emoji, setEmoji] = useState("📖");
  const [color, setColor] = useState("from-purple-500 to-pink-600");
  const [storyText, setStoryText] = useState("");
  const [saving, setSaving] = useState(false);

  // Auto-split text into pages (~150 words each, split at paragraph boundaries)
  const splitIntoPages = (text: string) => {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    if (paragraphs.length === 0) return [];
    const pages: string[] = [];
    let current = "";
    for (const para of paragraphs) {
      const currentWords = current.split(/\s+/).filter(Boolean).length;
      const paraWords = para.split(/\s+/).filter(Boolean).length;
      if (current && currentWords + paraWords > 150) {
        pages.push(current.trim());
        current = para;
      } else {
        current = current ? current + "\n\n" + para : para;
      }
    }
    if (current.trim()) pages.push(current.trim());
    return pages;
  };

  const previewPages = splitIntoPages(storyText);
  const canSave = title.trim() && storyText.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const pages = splitIntoPages(storyText);
      const totalWords = storyText.split(/\s+/).filter(Boolean).length;
      const readTime = `${Math.max(1, Math.round(totalWords / 200))} min`;

      await createStory({
        title: title.trim(),
        category,
        read_time: readTime,
        emoji,
        color,
        pages: pages.map(p => ({ text: p })),
      });
      refreshCustom();
      toast({ title: "Story saved!", description: "Your new story is now in the library." });
      setLocation("/");
    } catch (e) {
      toast({ title: "Error saving story", description: String(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FFFBF0] selection:bg-amber-200 selection:text-amber-900">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="rounded-full h-12 w-12 p-0">
            <ArrowLeft size={22} className="text-slate-500" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Add New Story</h1>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Story Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. The Dragon Who Loved Pancakes"
              className="w-full px-4 py-3 bg-white rounded-xl border-2 border-amber-100 focus:border-amber-400 focus:outline-none text-base font-body text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryMeta).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all",
                    category === key
                      ? "bg-amber-500 text-white shadow-md"
                      : "bg-white text-slate-500 border border-amber-100 hover:bg-amber-50"
                  )}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Cover Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all",
                    emoji === e ? "bg-amber-100 ring-2 ring-amber-400 scale-110" : "bg-white border border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Card Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-10 h-10 rounded-full bg-gradient-to-br transition-all",
                    c.value,
                    color === c.value ? "ring-2 ring-offset-2 ring-amber-400 scale-110" : "opacity-70 hover:opacity-100"
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Story Text */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Story Text</label>
            <p className="text-xs text-slate-400 mb-3">Paste or type your entire story. Use blank lines between paragraphs — it will be auto-split into pages (~150 words each).</p>
            <textarea
              value={storyText}
              onChange={e => setStoryText(e.target.value)}
              placeholder="Once upon a time..."
              rows={12}
              className="w-full px-4 py-3 bg-white rounded-xl border-2 border-amber-100 focus:border-amber-400 focus:outline-none text-sm font-body text-slate-700 placeholder:text-slate-400 resize-y"
            />
            {previewPages.length > 0 && (
              <p className="mt-2 text-xs text-slate-400 font-bold">
                Will be split into {previewPages.length} page{previewPages.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Preview */}
          {title.trim() && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Preview</label>
              <div className="w-36">
                <div className={cn("aspect-[3/4] rounded-2xl bg-gradient-to-br flex flex-col items-center justify-center p-3 text-white shadow-lg", color)}>
                  <span className="text-4xl mb-2">{emoji}</span>
                  <span className="text-xs font-bold text-center leading-tight line-clamp-2">{title}</span>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 pb-8">
            <Button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="w-full rounded-2xl h-14 text-lg font-bold shadow-lg bg-amber-500 hover:bg-amber-600 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Story"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [authed, setAuthed] = useState(() => isAuthed());
  const [customStories, setCustomStories] = useState<DbStory[]>([]);

  const loadCustom = useCallback(() => {
    fetchCustomStories().then(setCustomStories);
  }, []);

  useEffect(() => {
    if (authed) loadCustom();
  }, [authed, loadCustom]);

  const allStories = useMemo(() => {
    const custom = customStories.map(dbStoryToAppStory);
    return [...(builtInStories as Story[]), ...custom];
  }, [customStories]);

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />;
  }

  return (
    <AllStoriesContext.Provider value={{ stories: allStories, refreshCustom: loadCustom }}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/story/:id" component={StoryReader} />
        <Route path="/add-story" component={StoryEditor} />
      </Switch>
    </AllStoriesContext.Provider>
  );
}

export default App;
