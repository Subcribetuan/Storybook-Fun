import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sobgwoffvuwqprtxwndx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvYmd3b2ZmdnV3cXBydHh3bmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTA0MzMsImV4cCI6MjA4Njk4NjQzM30.AAAUqGCiatBiDA4mGCCnj1DB-Tg7HjpDMHkH5HxyhII";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface DbStory {
  id: number;
  title: string;
  category: string;
  read_time: string;
  emoji: string;
  color: string;
  pages: { text: string }[];
  created_at: string;
  updated_at: string;
}

// Auto-split a long page into ~150-word chunks at paragraph boundaries
function splitLongPage(text: string): string[] {
  // Normalize: treat single newlines as paragraph breaks too (join with \n\n)
  const paragraphs = text.split(/\n+/).filter(p => p.trim());
  if (paragraphs.length <= 1 && text.split(/\s+/).filter(Boolean).length <= 150) return [text];
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
}

// Convert DB story to app story format (matching the hardcoded story shape)
export function dbStoryToAppStory(s: DbStory) {
  // Auto-split any pages that are too long
  const splitPages = s.pages.flatMap(p => splitLongPage(p.text).map(t => ({ text: t })));
  return {
    id: s.id + 10000, // Offset IDs to avoid collision with hardcoded stories
    title: s.title,
    category: s.category,
    readTime: s.read_time,
    emoji: s.emoji,
    color: s.color,
    pages: splitPages,
    isCustom: true,
    dbId: s.id,
  };
}

export async function fetchCustomStories(): Promise<DbStory[]> {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to fetch stories:", error);
    return [];
  }
  return data || [];
}

export async function createStory(story: Omit<DbStory, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("stories")
    .insert(story)
    .select()
    .single();
  if (error) throw error;
  return data as DbStory;
}

export async function updateStory(id: number, story: Partial<Omit<DbStory, "id" | "created_at">>) {
  const { data, error } = await supabase
    .from("stories")
    .update({ ...story, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DbStory;
}

export async function deleteStory(id: number) {
  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
