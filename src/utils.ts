import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CustomTag } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const INSPO_COLORS = [
  '#1daeb1', // Teal
  '#fbc62a', // Yellow
  '#ed444a', // Red
  '#ec81a1', // Pink
  '#4ab378', // Green
];

export function getTagColor(tag: string | CustomTag) {
  if (typeof tag === 'object' && tag.color) {
    return tag.color;
  }
  const text = typeof tag === 'object' ? tag.text : tag;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return INSPO_COLORS[Math.abs(hash) % INSPO_COLORS.length];
}

export function getTagText(tag: string | CustomTag) {
  return typeof tag === 'object' ? tag.text : tag;
}

// Pokemon API helper
export function getPokemonSprite(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function getPokeballSprite() {
  return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
}

export async function extractUrlTitle(url: string): Promise<string |="" null=""> {
  try {
    // For YouTube URLs, use noembed API to bypass CORS and bot protection
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          return data.title;
        }
      }
    }

    // For other URLs, use microlink
    const proxyUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.data && data.data.title) {
        let title = data.data.title;
        return title
          .trim()
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
      }
    }
    
    // Fallback if Microlink fails: try fetching with corsproxy.io as raw HTML
    const fallbackUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const fallbackResponse = await fetch(fallbackUrl);
    if (fallbackResponse.ok) {
      const text = await fallbackResponse.text();
      const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (match && match[1]) {
        return match[1]
          .trim()
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to extract title", error);
    return null;
  }
}

