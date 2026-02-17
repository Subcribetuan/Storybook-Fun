import { Switch, Route, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Moon, Book, ChevronRight, ArrowLeft, Heart, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stories } from "@/lib/stories";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

// --- Components ---

function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 2}s`,
      opacity: Math.random() * 0.7 + 0.3,
    }));
  }, []);

  return (
    <div className="star-field">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            "--duration": star.duration,
            "--delay": star.delay,
            "--opacity": star.opacity,
          } as any}
        />
      ))}
    </div>
  );
}

function FilterPill({ active, label, onClick, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border",
        active
          ? "bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105"
          : "bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
      )}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}

function StoryCard({ story, onClick, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(story)}
      className="group relative overflow-hidden rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer backdrop-blur-sm"
    >
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br", story.color)} />
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg", story.color)}>
            {story.emoji}
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-900/50 text-xs font-medium text-slate-400 border border-slate-700/50">
            {story.readTime}
          </div>
        </div>
        
        <h3 className="text-xl font-display font-bold text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
          {story.title}
        </h3>
        
        <div className="flex items-center text-sm text-slate-400 group-hover:text-slate-300">
          Read Story <ChevronRight size={16} className="ml-1 opacity-50 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

function Home() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState("all");

  const filteredStories = stories.filter(
    (s) => filter === "all" || s.category === filter
  );

  return (
    <div className="min-h-screen pb-24 px-6 pt-16 max-w-2xl mx-auto relative z-10">
      <header className="mb-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Sparkles className="text-indigo-400 w-5 h-5" />
          </div>
          <span className="text-indigo-300 font-bold tracking-widest text-xs uppercase">Bedtime Stories</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl md:text-5xl font-display font-bold text-white mb-2 leading-tight text-glow"
        >
          Christopher & <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Benjamin's</span> Library
        </motion.h1>
      </header>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
        <FilterPill 
          active={filter === "all"} 
          label="All Stories" 
          onClick={() => setFilter("all")} 
          icon={Book}
        />
        <FilterPill 
          active={filter === "bedtime"} 
          label="Bedtime" 
          onClick={() => setFilter("bedtime")} 
          icon={Moon}
        />
        <FilterPill 
          active={filter === "adventure"} 
          label="Adventure" 
          onClick={() => setFilter("adventure")} 
          icon={Sparkles}
        />
      </div>

      <div className="grid gap-4">
        {filteredStories.map((story, i) => (
          <StoryCard 
            key={story.id} 
            story={story} 
            index={i}
            onClick={() => setLocation(`/story/${story.id}`)} 
          />
        ))}
      </div>
    </div>
  );
}

function ReadingView({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const story = stories.find((s) => s.id === Number(params.id));
  const [pageIndex, setPageIndex] = useState(0);

  if (!story) return null;

  const currentPage = story.pages[pageIndex];
  const progress = ((pageIndex + 1) / story.pages.length) * 100;

  const handleNext = () => {
    if (pageIndex < story.pages.length - 1) {
      setPageIndex(pageIndex + 1);
      window.scrollTo(0, 0);
    } else {
      setLocation("/");
    }
  };

  const handlePrev = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  // Format text to highlight dialogue and handle newlines
  const formattedText = currentPage.text.split('\n\n').map((paragraph, i) => {
    // Basic formatting for dialogue - simplistic check for quotes
    const isDialogue = paragraph.trim().startsWith('"');
    return (
      <p 
        key={i} 
        className={cn(
          "mb-6 text-xl md:text-2xl leading-relaxed text-slate-300 font-body",
          isDialogue && "text-white font-medium pl-4 border-l-4 border-indigo-500/50"
        )}
      >
        {paragraph}
      </p>
    );
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative z-10 bg-slate-900/90 backdrop-blur-md"
    >
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-800 z-50">
        <motion.div 
          className={cn("h-full bg-gradient-to-r", story.color)} 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
          <ArrowLeft size={24} />
        </Button>
        <span className="font-display font-bold text-slate-200 truncate max-w-[200px]">{story.title}</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full p-6 md:p-10 pb-32">
        <motion.div
          key={pageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {formattedText}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent z-40">
        <div className="max-w-2xl mx-auto flex gap-4 items-center justify-between">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handlePrev} 
            disabled={pageIndex === 0}
            className="rounded-full w-14 h-14 p-0 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30"
          >
            <ArrowLeft size={24} />
          </Button>

          <div className="text-slate-500 text-sm font-medium">
            {pageIndex + 1} / {story.pages.length}
          </div>

          <Button 
            size="lg" 
            onClick={handleNext}
            className={cn(
              "rounded-full h-14 px-8 text-lg font-bold shadow-lg transition-transform active:scale-95 bg-gradient-to-r text-white border-0",
              story.color
            )}
          >
            {pageIndex === story.pages.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function App() {
  return (
    <>
      <StarField />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/story/:id" component={ReadingView} />
      </Switch>
    </>
  );
}

export default App;
