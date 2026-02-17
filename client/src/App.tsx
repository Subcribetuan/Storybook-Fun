import { Switch, Route, Link, useLocation } from "wouter";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Star, BookOpen, Music, Heart, Sparkles, Wand2, ArrowLeft, ArrowRight, Play, Sun, Cloud, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState, useRef } from "react";

// --- Types ---
interface Story {
  id: number;
  title: string;
  description: string;
  color: string;
  iconColor: string;
  image: string;
  pages?: string[];
}

// --- Mock Data ---
const STORIES: Story[] = [
  {
    id: 1,
    title: "The Brave Little Toaster",
    description: "A tiny toaster goes on a big adventure to find its best friend.",
    color: "bg-orange-100",
    iconColor: "text-orange-500",
    image: "https://images.unsplash.com/photo-1585842828005-5da96860d5c8?w=800&q=80",
    pages: [
      "Once upon a time, in a cozy kitchen, lived a brave little toaster named Toastie.",
      "One sunny morning, Toastie realized the bread bin was empty! 'Oh no!' he beeped.",
      "He decided to go on an adventure to the Bakery across the street. He hopped off the counter.",
      "He traveled through the living room, dodging the sleeping cat and the toy trucks.",
      "Finally, he found the bakery and returned with the fluffiest bread ever! The End."
    ]
  },
  {
    id: 2,
    title: "Moon's Pyjamas",
    description: "The moon needs to find the perfect outfit for sleeping in the sky.",
    color: "bg-indigo-100",
    iconColor: "text-indigo-500",
    image: "https://images.unsplash.com/photo-1532153955177-f59af40d6472?w=800&q=80",
    pages: [
      "The Moon was getting very sleepy, yawning big wide yawns that made the stars twinkle.",
      "But he couldn't find his favorite star-patterned pyjamas anywhere!",
      "He asked the passing comet, 'Have you seen my sleeping cap?' The comet zoomed past.",
      "The clouds whispered, 'Look behind the Milky Way!'",
      "There they were! The Moon put on his pyjamas, fluffed his cloud pillow, and drifted to sleep."
    ]
  },
  {
    id: 3,
    title: "The Dancing Giraffe",
    description: "Gerald creates a new dance move that surprises the whole jungle.",
    color: "bg-yellow-100",
    iconColor: "text-yellow-500",
    image: "https://images.unsplash.com/photo-1541689221361-ad95003448dc?w=800&q=80",
    pages: [
      "Gerald the Giraffe had very long legs and a very long neck.",
      "Everyone said giraffes can't dance because they are too clumsy.",
      "But Gerald had a rhythm in his heart. He started to sway his neck.",
      "Then he started to tap his hooves. Tap, tap, tap!",
      "Suddenly, he was doing the Jungle Jive! Everyone cheered, 'Go Gerald!'"
    ]
  },
  {
    id: 4,
    title: "Ocean's Secret Party",
    description: "Deep under the sea, the fish are planning a surprise birthday bash.",
    color: "bg-cyan-100",
    iconColor: "text-cyan-500",
    image: "https://images.unsplash.com/photo-1582967788606-a171f1080ca8?w=800&q=80",
    pages: [
      "Down in the deep blue sea, a secret was bubbling among the coral reef.",
      "It was the Great Whale's birthday! The crabs were baking a sand-cake.",
      "The jellyfish brought the glowing lights, and the dolphins practiced their birthday song.",
      "When the Whale arrived, everyone shouted 'SURPRISE!'",
      "The Whale was so happy, he splashed water everywhere and they danced all night."
    ]
  },
];

// --- Custom Cursor ---
function MagicCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden md:block"
      style={{ x: cursorXSpring, y: cursorYSpring }}
    >
      <Wand2 className="w-8 h-8 text-primary fill-primary/20 rotate-12" />
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute -top-2 -right-2"
      >
        <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-200" />
      </motion.div>
    </motion.div>
  );
}

// --- Components ---

function Hero() {
  const { toast } = useToast();
  
  const handleInteraction = () => {
    toast({
      title: "✨ Magic in progress!",
      description: "This feature is coming soon to the kingdom.",
      duration: 3000,
    });
  };

  return (
    <div className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-primary/20 mb-8 shadow-sm hover:scale-105 transition-transform cursor-pointer">
            <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-200" />
            <span className="text-primary font-bold tracking-wide text-sm uppercase">Magical Stories for Kids</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-display font-extrabold text-primary mb-6 tracking-tighter drop-shadow-sm leading-none">
            Wonder<span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-400">Tales</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground font-hand max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover a world where toasters talk, moons wear pyjamas, and giraffes dance!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-full text-xl font-bold h-16 px-8 bg-primary hover:bg-primary/90 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <Play className="mr-2 w-6 h-6 fill-current" /> Start Reading
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full text-xl font-bold h-16 px-8 border-2 hover:bg-white/50"
              onClick={handleInteraction}
            >
              Meet Characters
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Decorative Background Elements */}
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-20 left-[10%] text-yellow-400 opacity-60">
        <Sun size={80} fill="currentColor" className="text-yellow-200" />
      </motion.div>
      <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-40 right-[15%] text-accent opacity-60">
        <Cloud size={100} fill="currentColor" className="text-white" />
      </motion.div>
      <div className="absolute bottom-10 left-[20%] text-primary/20 animate-pulse">
        <Star size={40} fill="currentColor" />
      </div>
      <div className="absolute top-1/3 right-[5%] text-secondary/30 rotate-12">
        <Music size={50} />
      </div>
    </div>
  );
}

function StoryCard({ story, index }: { story: Story; index: number }) {
  const [, setLocation] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -12, rotate: index % 2 === 0 ? 1 : -1 }}
      className="group cursor-pointer h-full"
      onClick={() => setLocation(`/story/${story.id}`)}
    >
      <div className={`h-full rounded-[2rem] overflow-hidden border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-300 bg-white flex flex-col relative`}>
        <div className="h-64 overflow-hidden relative">
          <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${story.color}`} />
          <img 
            src={story.image} 
            alt={story.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-sm group-hover:rotate-12 transition-transform">
            <BookOpen className={`w-6 h-6 ${story.iconColor}`} />
          </div>
          
          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-full">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </div>
        </div>
        
        <div className="p-8 flex-1 flex flex-col relative z-10">
          <h3 className={`text-3xl font-display font-bold mb-3 group-hover:text-primary transition-colors leading-tight`}>
            {story.title}
          </h3>
          <p className="text-muted-foreground font-hand text-xl mb-6 flex-1 line-clamp-3">
            {story.description}
          </p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">5 min read</span>
            <span className={`text-lg font-bold ${story.iconColor} group-hover:underline decoration-wavy underline-offset-4`}>
              Read Now →
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedGrid() {
  const { toast } = useToast();
  return (
    <div className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800">
          <span className="text-primary">Featured</span> Stories
        </h2>
        <Button 
          variant="ghost" 
          className="hidden md:flex text-xl font-hand text-muted-foreground hover:text-primary"
          onClick={() => toast({ title: "More stories coming soon!", description: "Our writers are dreaming up new adventures." })}
        >
          View All Stories →
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
        {STORIES.map((story, i) => (
          <StoryCard key={story.id} story={story} index={i} />
        ))}
      </div>
    </div>
  );
}

function StoryReader({ params }: { params: { id: string } }) {
  const story = STORIES.find(s => s.id === Number(params.id));
  const [page, setPage] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (!story) return <div className="p-20 text-center text-2xl font-hand">Story not found!</div>;

  const totalPages = story.pages?.length || 1;

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const playAudio = () => {
    toast({
      title: "Audio Playing",
      description: "Imagine a soft voice reading this story...",
      duration: 3000,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
    >
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="rounded-full h-12 w-12 p-0 hover:bg-white hover:text-primary border-2 border-transparent hover:border-primary/20"
        >
          <X size={24} />
        </Button>
      </div>

      <div className="w-full max-w-5xl aspect-[4/3] md:aspect-[16/9] bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative ring-8 ring-white/50">
        {/* Book Spine Effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200 to-white z-10 hidden md:block" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 z-10 hidden md:block shadow-inner" />

        {/* Left Page (Image) */}
        <div className="flex-1 bg-gray-50 relative overflow-hidden group border-b md:border-b-0 md:border-r border-gray-100">
          <img 
            src={story.image} 
            alt={story.title} 
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" 
          />
          <div className={`absolute inset-0 opacity-20 ${story.color}`} />
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-xl shadow-lg md:hidden">
             <p className="font-hand text-lg text-center leading-relaxed">
               {story.pages ? story.pages[page] : story.description}
             </p>
          </div>
        </div>

        {/* Right Page (Text) */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white relative hidden md:flex">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="flex justify-between items-center mb-6">
               <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">Page {page + 1} of {totalPages}</span>
               <Heart className="w-6 h-6 text-red-200 hover:text-red-500 hover:fill-current cursor-pointer transition-colors" />
            </div>
            
            <h3 className="text-2xl lg:text-4xl font-hand leading-relaxed text-gray-800 mb-8 selection:bg-primary/20">
              {story.pages ? story.pages[page] : story.description}
            </h3>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-auto pt-8 border-t border-gray-100">
             <Button 
              variant="outline" 
              onClick={handlePrev} 
              disabled={page === 0}
              className="rounded-full h-14 w-14 p-0 border-2 hover:border-primary hover:text-primary"
            >
              <ArrowLeft size={24} />
            </Button>

            <Button 
              variant="ghost" 
              className="rounded-full h-14 w-14 p-0 text-primary hover:bg-primary/10"
              onClick={playAudio}
            >
              <Volume2 size={28} />
            </Button>

            <Button 
              onClick={handleNext} 
              disabled={page === totalPages - 1}
              className="rounded-full h-14 w-14 p-0 bg-primary hover:bg-primary/90 text-white shadow-lg hover:scale-105 transition-transform"
            >
              <ArrowRight size={24} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Controls (Visible only on small screens) */}
      <div className="md:hidden flex items-center gap-4 mt-6">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={page === 0}
          className="rounded-full h-12 w-12 bg-white/80"
        >
          <ArrowLeft size={20} />
        </Button>
        <span className="font-display font-bold text-white bg-black/20 px-4 py-1 rounded-full">{page + 1} / {totalPages}</span>
        <Button 
          onClick={handleNext} 
          disabled={page === totalPages - 1}
          className="rounded-full h-12 w-12 bg-primary text-white"
        >
          <ArrowRight size={20} />
        </Button>
      </div>
    </motion.div>
  );
}

function Navigation() {
  const { toast } = useToast();
  
  const handleNavClick = (item: string) => {
    toast({
      title: `Exploring ${item}`,
      description: "This magical section is under construction by our elves.",
    });
  };

  return (
    <nav className="fixed top-0 w-full z-40 bg-white/70 backdrop-blur-xl border-b border-white/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform duration-300">
              <Sparkles size={28} className="fill-white/20" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-800 group-hover:text-primary transition-colors">WonderTales</span>
          </div>
        </Link>
        
        <div className="hidden md:flex gap-2">
          {["Stories", "Characters", "Parents", "About"].map((item) => (
            <Button 
              key={item} 
              variant="ghost" 
              className="rounded-full font-bold text-lg px-6 h-12 hover:bg-white hover:shadow-sm"
              onClick={() => handleNavClick(item)}
            >
              {item}
            </Button>
          ))}
          <Button 
            className="ml-2 rounded-full bg-secondary text-secondary-foreground font-bold text-lg px-8 h-12 hover:bg-secondary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            onClick={() => handleNavClick("Club")}
          >
            Join Club
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-[url('/bg-texture.png')] bg-repeat bg-[length:400px_400px]">
      <Navigation />
      <Hero />
      <FeaturedGrid />
      
      {/* Playful Footer */}
      <footer className="bg-white/80 backdrop-blur-lg py-20 border-t border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
        
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h3 className="text-3xl font-display font-bold text-primary mb-8">Keep the Magic Alive!</h3>
          
          <div className="flex justify-center gap-6 mb-12">
            {[
              { icon: Music, color: "bg-purple-100 text-purple-600" },
              { icon: Star, color: "bg-yellow-100 text-yellow-600" },
              { icon: Heart, color: "bg-pink-100 text-pink-600" },
              { icon: Cloud, color: "bg-blue-100 text-blue-600" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.2, rotate: 10 }}
                className={`p-4 ${item.color} rounded-full cursor-pointer shadow-sm`}
              >
                <item.icon size={28} />
              </motion.div>
            ))}
          </div>
          
          <p className="font-hand text-xl text-muted-foreground">
            Made with <Heart className="inline w-6 h-6 text-red-400 mx-1 fill-current animate-pulse" /> for little explorers everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster />
      <MagicCursor />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/story/:id" component={StoryReader} />
        <Route>
          <div className="min-h-screen flex items-center justify-center bg-background bg-[url('/bg-texture.png')]">
            <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-[3rem] shadow-xl border-4 border-white max-w-lg mx-4">
              <div className="inline-block p-6 bg-red-100 rounded-full text-red-500 mb-6">
                 <Cloud size={48} />
              </div>
              <h1 className="text-6xl font-display font-bold text-primary mb-4">Oops!</h1>
              <p className="text-2xl font-hand text-muted-foreground mb-8">
                This page is hiding in a magical castle. We couldn't find it!
              </p>
              <Link href="/">
                <Button size="lg" className="rounded-full text-xl font-bold h-14 px-8 w-full">Go Home</Button>
              </Link>
            </div>
          </div>
        </Route>
      </Switch>
    </>
  );
}

export default App;
