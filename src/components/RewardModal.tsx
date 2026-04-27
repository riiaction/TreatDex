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
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(reward.name + " " + reward.content)}`,
        "_blank",
      );
    }
  };

  const getIcon = () => {
    switch (reward.type) {
      case "cafe":
        return <coffee size="{24}" classname="text-amber-600"/>;
      case "link":
        return <link2 size="{24}" classname="text-blue-600"/>;
      default:
        return <star size="{24}" classname="text-purple-600"/>;
    }
  };

  return (
    <div classname="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      {/* Super basic confetti simulation using CSS animations would go here, maybe just standard scale-in for now */}

      <div classname="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-300">
        <button onclick="{onClose}" classname="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 z-10 w-8 h-8 flex items-center justify-center">
          <x size="{16}"/>
        </button>

        <div classname="text-center">
          <div classname="relative flex justify-center mb-6 mt-4">
            <div classname="absolute inset-0 bg-yellow-400 opacity-20 blur-2xl rounded-full w-32 h-32 mx-auto"/>
            <div classname="w-32 h-32 relative z-10 bg-white/80 rounded-full border-4 border-yellow-300 shadow-sm flex items-center justify-center overflow-hidden">
              <img src="{getPokemonSprite(reward.pokemonId)}" alt="Pokemon" classname="w-20 h-20 object-contain drop-shadow-xl animate-bounce-win hover:animate-bounce-short" style="{{" imagerendering:="" "pixelated"="" }}=""/>
            </div>
          </div>

          <h3 classname="text-2xl font-black text-gray-900 mb-1 tracking-tight">
            {KANTO_POKEMON[reward.pokemonId - 1]}
          </h3>

          <div classname="bg-gray-50 border border-gray-100 rounded-2xl p-5 mt-6 relative overflow-hidden text-left">
            <div classname="{`flex" ${reward.type="==" "text"="" ?="" "justify-center="" text-center="" w-full"="" :="" "items-start="" gap-3"}="" mb-2="" pt-1.5`}="">
              {reward.type !== "text" && (
                <div classname="p-2 bg-white rounded-full shadow-sm shrink-0">
                  {getIcon()}
                </div>
              )}
              {reward.type === "link" && reward.url ? (
                <a href="{reward.url}" target="_blank" rel="noopener noreferrer" classname="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors leading-tight items-center block self-center underline decoration-blue-200 underline-offset-4">
                  {reward.name}
                </a>
              ) : (
                <span classname="font-bold text-gray-900 text-lg self-center leading-tight">
                  {reward.name === "Mystery Treat" || reward.name === "Wild Card!" || reward.name === "Wild Card" ? "Wild Card" : reward.name}
                </span>
              )}
            </div>

            {reward.content && reward.type !== "link" && (
              <p classname="{`text-gray-500" text-sm="" mt-2="" font-medium="" ${reward.type="==" "text"="" ?="" "text-center"="" :="" ""}`}="">
                {reward.content}
              </p>
            )}

            {reward.type === "cafe" && (
              <button onclick="{handleOpenMap}" classname="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl font-semibold transition-transform active:scale-95">
                <mappin size="{18}"/> Open in Google Maps
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
