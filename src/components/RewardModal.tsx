import React, { useEffect, useState } from "react";
import { Reward, Task } from "../types";
import { getPokemonSprite } from "../utils";
import {
  X,
  MapPin,
  ExternalLink,
  Coffee,
  Star,
  Link2,
  Heart,
} from "lucide-react";
import { KANTO_POKEMON } from "../pokemonList";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
  task: Task | null;
}

export function RewardModal({
  isOpen,
  onClose,
  reward,
  task,
}: RewardModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !reward || !task) return null;

  const handleOpenMap = () => {
    if (reward.url) {
      window.open(reward.url, "_blank");
    } else if (reward.type === "cafe") {
      const query = encodeURIComponent(`${reward.name} ${reward.content || ""}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
  };

  const getIcon = () => {
    switch (reward.type) {
      case "cafe":
        return <Coffee size={24} className="text-amber-600" />;
      case "link":
        return <Link2 size={24} className="text-blue-600" />;
      default:
        return <Star size={24} className="text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 z-10 w-8 h-8 flex items-center justify-center"
        >
          <X size={16} />
        </button>

        <div className="text-center">
          {/* Pokemon Sprite Section */}
          <div className="relative flex justify-center mb-6 mt-4">
            <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-2xl rounded-full w-32 h-32 mx-auto" />
            <div className="w-32 h-32 relative z-10 bg-white/80 rounded-full border-4 border-yellow-300 shadow-sm flex items-center justify-center overflow-hidden">
              <img 
                src={getPokemonSprite(reward.pokemonId)} 
                alt="Pokemon" 
                className="w-20 h-20 object-contain drop-shadow-xl" 
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
            {KANTO_POKEMON[reward.pokemonId - 1]}
          </h3>

          {/* Reward Details Box */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mt-6 relative overflow-hidden text-left">
            <div className={`flex items-center gap-3 mb-2 pt-1.5 ${reward.type === "text" ? "justify-center text-center w-full" : ""}`}>
              {reward.type !== "text" && (
                <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
                  {getIcon()}
                </div>
              )}
              
              {reward.type === "link" && reward.url ? (
                <a 
                  href={reward.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors leading-tight underline decoration-blue-200 underline-offset-4"
                >
                  {reward.name}
                </a>
              ) : (
                <span className="font-bold text-gray-900 text-lg leading-tight">
                  {reward.name === "Mystery Treat" || reward.name === "Wild Card!" ? "Wild Card" : reward.name}
                </span>
              )}
            </div>

            {reward.content && reward.type !== "link" && (
              <p className={`text-gray-500 text-sm mt-2 font-medium ${reward.type === "text" ? "text-center" : ""}`}>
                {reward.content}
              </p>
            )}

            {reward.type === "cafe" && (
              <button 
                onClick={handleOpenMap} 
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl font-semibold transition-transform active:scale-95"
              >
                <MapPin size={18} /> Open in Google Maps
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
