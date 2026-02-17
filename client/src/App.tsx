import { Switch, Route, useLocation } from "wouter";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, Variants } from "framer-motion";
import { Star, Moon, BookOpen, ChevronRight, ArrowLeft, Heart, Sparkles, User, Play, Pause, Volume2, X, Music, Check, ArrowRight, Sun, Cloud, Wand2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stories } from "@/lib/stories";
import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

// --- Types ---
interface Story {
  id: number;
  title: string;
  category: string;
  readTime: string;
  emoji: string;
  color: string;
  pages: { text: string }[];
}

// --- Components ---

function MagicCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  
  // Smooth spring animation for cursor
  const springX = useSpring(0, { stiffness: 500, damping: 28 });
  const springY = useSpring(0, { stiffness: 500, damping: 28 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      springX.set(e.clientX - 16);
      springY.set(e.clientY - 16);
      
      const target = e.target as HTMLElement;
      // Check if hovering over clickable elements
      const clickable = target.closest('button, a, .cursor-pointer');
      setIsPointer(!!clickable);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [springX, springY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden md:block"
      style={{ x: springX, y: springY }}
    >
      <motion.div
        animate={{ scale: isPointer ? 1.5 : 1, rotate: isPointer ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Wand2 
          className={cn(
            "w-8 h-8 transition-colors duration-300 drop-shadow-lg", 
            isPointer ? "text-yellow-400 fill-yellow-200" : "text-primary/80 fill-primary/20"
          )} 
        />
      </motion.div>
      {isPointer && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-100 animate-spin-slow" />
        </motion.div>
      )}
    </motion.div>
  );
}

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

function StoryBookCard({ story, onClick, index }: { story: Story, onClick: () => void, index: number }) {
  // Use a predictable gradient based on story ID to ensure consistency
  const gradients = [
    "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600",
    "bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600",
    "bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600",
    "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500",
    "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600",
  ];
  
  const bgClass = gradients[story.id % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100, damping: 20 }}
      whileHover={{ y: -15, rotateZ: 2, scale: 1.05, zIndex: 10 }}
      onClick={onClick}
      className="group relative cursor-pointer perspective-1000"
    >
      {/* Book Shape */}
      <div className={cn(
        "relative h-[360px] w-full rounded-r-3xl rounded-l-lg overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 border-l-[12px] border-white/20",
        bgClass
      )}>
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('/paper-texture.png')]" />
        
        {/* Spine Effect */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/20 to-transparent z-10" />
        <div className="absolute left-[11px] top-0 bottom-0 w-[1px] bg-white/20 z-20" />
        
        {/* Decorative Light Orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-colors" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

        <div className="p-8 h-full flex flex-col relative z-20 text-white">
          <div className="flex justify-between items-start">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ type: "spring" }}
              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] border border-white/40"
            >
              {story.emoji}
            </motion.div>
            
            <div className="flex gap-2">
              {story.category === "bedtime" && <Moon className="text-white/90 drop-shadow-md" size={24} />}
              {story.category === "adventure" && <Sparkles className="text-white/90 drop-shadow-md" size={24} />}
              {story.category === "swimming" && <Cloud className="text-white/90 drop-shadow-md" size={24} />}
            </div>
          </div>
          
          <div className="mt-auto">
            <h3 className="text-3xl font-display font-bold leading-tight mb-4 drop-shadow-lg tracking-tight">
              {story.title}
            </h3>
            <div className="flex items-center gap-3 text-white/95 font-bold text-sm">
              <span className="bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 border border-white/10">
                <BookOpen size={16} />
                {story.readTime}
              </span>
              <span className="bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 border border-white/20 group-hover:bg-white group-hover:text-purple-600 transition-colors">
                Read <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full z-30 pointer-events-none" style={{ transitionDuration: '1s' }} />
      </div>
      
      {/* Pages Effect (Side View depth) */}
      <div className="absolute right-3 top-3 bottom-3 w-6 bg-white rounded-r-lg -z-10 shadow-lg group-hover:right-5 transition-all duration-300" />
      <div className="absolute right-2 top-2 bottom-2 w-6 bg-gray-200 rounded-r-lg -z-20 shadow-md group-hover:right-4 transition-all duration-300" />
    </motion.div>
  );
}

function Home() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const filteredStories = stories.filter(
    (s) => filter === "all" || s.category === filter
  );

  const handleMagic = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF69B4', '#00BFFF', '#9D5CFF'],
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

  return (
    <div className="min-h-screen bg-[#FFFBF0] relative overflow-hidden selection:bg-purple-200 selection:text-purple-900">
      {/* Background Map Image */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply transition-opacity duration-1000"
        style={{ backgroundImage: `url('/map-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FFFBF0] pointer-events-none" />
      
      {/* Floating Decor */}
      <div className="absolute top-20 left-10 text-yellow-400/60 pointer-events-none">
        <FloatingElement delay={0} duration={6}><Star size={64} fill="currentColor" /></FloatingElement>
      </div>
      <div className="absolute top-40 right-20 text-blue-300/60 pointer-events-none">
        <FloatingElement delay={1} duration={7} xOffset={20}><Moon size={84} fill="currentColor" /></FloatingElement>
      </div>
      <div className="absolute bottom-40 left-20 text-pink-300/60 pointer-events-none">
        <FloatingElement delay={2} duration={8} yOffset={-20}><Heart size={56} fill="currentColor" /></FloatingElement>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-16">
        <header className="flex flex-col xl:flex-row items-center justify-between mb-20 gap-8">
          <div className="text-center xl:text-left relative">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMagic}
              className="inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-md rounded-full border-2 border-purple-200 mb-6 shadow-sm hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 text-purple-500 group-hover:animate-spin" />
              <span className="text-purple-700 font-bold text-sm tracking-wide uppercase">The Magical Library</span>
            </motion.button>
            
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-800 leading-[0.9] tracking-tight drop-shadow-sm">
              Christopher & <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 animate-gradient-x">Benjamin's World</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-slate-500 font-body max-w-2xl mx-auto xl:mx-0 leading-relaxed">
              Pick a story to start your adventure. <br className="hidden md:block" />
              Brave knights, dancing giraffes, and sleepy moons await!
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 p-2 bg-white/60 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 w-full xl:w-auto">
            {["all", "bedtime", "adventure", "swimming", "breathing"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-4 rounded-2xl font-bold capitalize transition-all duration-300 text-lg flex items-center gap-2",
                  filter === f 
                    ? "bg-purple-600 text-white shadow-lg scale-105 shadow-purple-500/30" 
                    : "text-slate-500 hover:text-purple-600 hover:bg-white"
                )}
              >
                {f === "bedtime" && <Moon size={18} />}
                {f === "adventure" && <Sparkles size={18} />}
                {f === "swimming" && <Cloud size={18} />}
                {f}
              </button>
            ))}
          </div>
        </header>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-12 pb-32"
        >
          <AnimatePresence mode="popLayout">
            {filteredStories.map((story, i) => (
              <StoryBookCard 
                key={story.id} 
                story={story} 
                index={i} 
                onClick={() => setLocation(`/story/${story.id}`)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      
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
      colors: ['#FFD700', '#FF69B4', '#00BFFF', '#ffffff'],
      zIndex: 100,
      gravity: 0.6,
      scalar: 1.5,
      shapes: ['star', 'circle']
    });
  }, []);

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <PartyPopper size={64} className="text-yellow-500" />
      </div>
      <h2 className="text-5xl font-display font-bold text-slate-800 mb-4">You Did It!</h2>
      <p className="text-2xl text-slate-500 font-body mb-10 max-w-lg">
        You finished the story like a brave explorer! Time for a high five!
      </p>
      <div className="flex gap-4">
        <Button onClick={onRestart} size="lg" className="rounded-full h-16 px-10 text-xl font-bold shadow-xl bg-purple-600 hover:bg-purple-700 hover:scale-105 transition-all">
          Read Again
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline" size="lg" className="rounded-full h-16 px-10 text-xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50">
          Pick New Story
        </Button>
      </div>
    </div>
  );
}

const pageVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
    rotateY: direction > 0 ? 5 : -5
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
    rotateY: direction < 0 ? 5 : -5
  })
};

function StoryReader({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
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

  const currentPage = story.pages[page];
  const progress = ((page + 1) / totalPages) * 100;

  // Format Text
  const formattedText = currentPage.text.split('\n\n').map((paragraph, i) => {
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
          isDialogue && "font-bold text-slate-900 pl-6 border-l-4 border-purple-400 bg-purple-50/80 p-4 rounded-r-xl shadow-sm",
          isSoundEffect && "font-display text-4xl md:text-5xl text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 py-4 rotate-2 scale-110 origin-center"
        )}
      >
        {paragraph}
      </motion.p>
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
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
          <Music size={20} className="text-purple-500" />
          <span className="font-bold text-slate-600">Sound On</span>
        </Button>
      </div>

      {/* Book Container */}
      <div className="relative w-full max-w-6xl aspect-[4/5] md:aspect-[16/9] perspective-1000 z-20">
        <motion.div 
          className="w-full h-full bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-[12px] border-white relative ring-1 ring-slate-900/5"
          initial={{ rotateX: 10, scale: 0.9, opacity: 0 }}
          animate={{ rotateX: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          {isComplete && <StoryComplete onRestart={() => { setIsComplete(false); setPage(0); }} />}

          {/* Book Spine Center */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-gradient-to-r from-gray-300 to-gray-100 z-30 hidden md:block shadow-inner" />

          {/* Left Page (Visuals) */}
          <div className={cn(
            "hidden md:flex w-1/2 relative overflow-hidden p-12 flex-col justify-center items-center text-white bg-gradient-to-br",
            story.color.replace('from-', 'from-').replace('to-', 'to-')
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

            <div className="flex-1 p-8 md:p-16 overflow-y-auto custom-scrollbar relative overflow-x-hidden">
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
                     x: { type: "spring", stiffness: 300, damping: 30 },
                     opacity: { duration: 0.2 }
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

function App() {
  return (
    <>
      <MagicCursor />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/story/:id" component={StoryReader} />
      </Switch>
    </>
  );
}

export default App;
