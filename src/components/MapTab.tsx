import React from "react";
import { Reward, Task } from "../types";
import { getPokeballSprite, getPokemonSprite } from "../utils";
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClustererF } from "@react-google-maps/api";
import { ExternalLink } from "lucide-react";

interface MapTabProps {
  tasks: Task[];
  rewards: Reward[];
  onShowReward: (task: Task, reward: Reward) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 22.2825,
  lng: 114.1526,
};

const libraries: "places"[] = ["places"];

const CombinedMarker: React.FC<{ 
  reward: Reward;
  unlocked: boolean;
  clusterer: any;
  isHoverable: boolean;
  onClick: () => void;
}> = ({ 
  reward, 
  unlocked, 
  clusterer, 
  isHoverable, 
  onClick 
}) => {
  const [iconDataUrl, setIconDataUrl] = React.useState<string |="" null="">(null);

  React.useEffect(() => {
    const iconUrl = unlocked ? getPokemonSprite(reward.pokemonId) : getPokeballSprite();
    
    // In order to not hit the security limits, create a canvas and combine background and image
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background circle (size 64x64, radius 30)
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, 2 * Math.PI);
    ctx.fillStyle = unlocked ? '#FFFBEB' : '#F9FAFB'; // Amber-50 vs Gray-50
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = unlocked ? '#FBBF24' : '#D1D5DB'; // Amber-400 vs Gray-300
    ctx.stroke();

    // Draw image (size 50x50). Pokeball and Pokemon all are size 50
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      ctx.drawImage(img, 32 - 25, 32 - 25, 50, 50);
      setIconDataUrl(canvas.toDataURL());
    };
    img.onerror = () => {
      // Fallback
      setIconDataUrl(canvas.toDataURL());
    };
    img.src = iconUrl;
  }, [reward.pokemonId, unlocked]);

  if (!iconDataUrl) return null;

  return (
    <markerf position="{{" lat:="" reward.lat!,="" lng:="" reward.lng!="" }}="" icon="{{" url:="" icondataurl,="" scaledsize:="" new="" window.google.maps.size(64,="" 64),="" anchor:="" new="" window.google.maps.point(32,="" 32),="" }}="" zindex="{unlocked" ?="" 10="" :="" 5}="" onclick="{()" ==""> {
        if (isHoverable) {
          onClick();
        }
      }}
      clusterer={clusterer}
    />
  );
};

export function MapTab({ tasks, rewards, onShowReward }: MapTabProps) {
  const isRewardUnlocked = (reward: Reward) => {
    if (!reward.assignedTaskId) return false;
    const task = tasks.find((t) => t.id === reward.assignedTaskId);
    return task?.completed || false;
  };

  const locationRewards = rewards.filter(
    (r) => r.type === "cafe" && r.lat !== undefined && r.lng !== undefined
  );
  
  const unlockedNonLocationRewards = rewards.filter(
    (r) => (r.type !== "cafe" || r.lat === undefined || r.lng === undefined) && isRewardUnlocked(r)
  );

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env.VITE_MAPS_VIEW || process.env.MapsView || "",
    libraries,
  });

  return (
    <div classname="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Map Section */}
      <div classname="h-[45%] w-full relative z-0 shrink-0">
        {isLoaded ? (
          <googlemap mapcontainerstyle="{mapContainerStyle}" center="{defaultCenter}" zoom="{15}" options="{{" disabledefaultui:="" true,="" zoomcontrol:="" false,="" }}="">
            <markerclustererf options="{{" maxzoom:="" 16,="" gridsize:="" 20="" }}="">
              {(clusterer) => (
                <>
                  {locationRewards.map((reward) => {
                    const unlocked = isRewardUnlocked(reward);
                    const iconUrl = unlocked
                      ? getPokemonSprite(reward.pokemonId)
                      : getPokeballSprite();

                    const isHoverable = unlocked && !!reward.assignedTaskId;

                    return (
                      <combinedmarker key="{reward.id}" reward="{reward}" unlocked="{unlocked}" clusterer="{clusterer}" ishoverable="{isHoverable}" onclick="{()" ==""> {
                          const task = tasks.find((t) => t.id === reward.assignedTaskId);
                          if (task) onShowReward(task, reward);
                        }}
                      />
                    );
                  })}
                </>
              )}
            </MarkerClustererF>
          </GoogleMap>
        ) : (
          <div classname="w-full h-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-400">
            Loading Map...
          </div>
        )}
        <div classname="absolute top-4 left-4 z-[40] bg-white/90 backdrop-blur rounded-full px-4 py-2 font-black shadow-sm flex items-center gap-2 border border-gray-100">
          <div classname="w-3 h-3 bg-red-500 rounded-full"/>
          PokéMap
        </div>
      </div>

      {/* Non-Location Unlocked Rewards Section */}
      <div classname="flex-1 overflow-y-auto p-6 pb-24">
        {unlockedNonLocationRewards.length > 0 ? (
          <div classname="space-y-4">
            {unlockedNonLocationRewards.map((reward) => (
              <div key="{reward.id}" classname="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-gray-200 transition-colors" onclick="{()" ==""> {
                  if (reward.assignedTaskId) {
                    const task = tasks.find((t) => t.id === reward.assignedTaskId);
                    if (task) onShowReward(task, reward);
                  }
                }}
              >
                <div classname="w-14 h-14 shrink-0 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <img src="{getPokemonSprite(reward.pokemonId)}" alt="Pokemon" classname="w-10 h-10 object-contain drop-shadow-sm"/>
                </div>
                <div classname="flex-1 min-w-0">
                  <h3 classname="font-bold text-gray-900 text-lg truncate">
                    {reward.name === "Mystery Treat" || reward.name === "Wild Card!" || reward.name === "Wild Card" ? "Wild Card" : reward.name}
                  </h3>
                  {reward.type !== "link" && reward.name !== "Mystery Treat" && reward.name !== "Wild Card!" && reward.name !== "Wild Card" && (
                    <div classname="flex items-center gap-1 text-gray-500 mt-1">
                      <span classname="text-sm font-medium truncate">
                        {reward.content}
                      </span>
                    </div>
                  )}
                </div>
                {reward.type === "link" && (
                  <button onclick="{(e)" ==""> {
                      e.stopPropagation();
                      window.open(reward.content || reward.url, "_blank");
                    }}
                    className="p-3 shrink-0 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors border border-gray-200"
                  >
                    <externallink size="{18}"/>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div classname="h-full flex flex-col items-center justify-center opacity-50 font-bold uppercase tracking-widest text-sm text-gray-400">
            Complete a task to unlock your first treat
          </div>
        )}
      </div>
    </div>
  );
}
