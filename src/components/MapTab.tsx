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

// Declared outside to keep reference stable
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

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
  const [iconDataUrl, setIconDataUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const iconUrl = unlocked ? getPokemonSprite(reward.pokemonId) : getPokeballSprite();
    
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background circle
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, 2 * Math.PI);
    ctx.fillStyle = unlocked ? '#FFFBEB' : '#F9FAFB';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = unlocked ? '#FBBF24' : '#D1D5DB';
    ctx.stroke();

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      ctx.drawImage(img, 32 - 25, 32 - 25, 50, 50);
      setIconDataUrl(canvas.toDataURL());
    };
    img.onerror = () => {
      setIconDataUrl(canvas.toDataURL());
    };
    img.src = iconUrl;
  }, [reward.pokemonId, unlocked]);

  if (!iconDataUrl) return null;

  return (
    <MarkerF 
      position={{ lat: reward.lat!, lng: reward.lng! }} 
      icon={{ 
        url: iconDataUrl, 
        scaledSize: new window.google.maps.Size(64, 64), 
        anchor: new window.google.maps.Point(32, 32)
      }} 
      zIndex={unlocked ? 10 : 5} 
      onClick={() => {
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

  // FIX 1: Also collect unlocked location rewards for the list view
  const unlockedLocationRewards = locationRewards.filter((r) => isRewardUnlocked(r));

  // FIX 1: Combine both into one list — location treats first, then others
  const allUnlockedRewards = [...unlockedLocationRewards, ...unlockedNonLocationRewards];

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env?.VITE_MAPS_VIEW || (process.env as any).VITE_MAPS_VIEW || "",
    libraries,
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Map Section */}
      <div className="h-[45%] w-full relative z-0 shrink-0">
        {isLoaded ? (
          <GoogleMap 
            mapContainerStyle={mapContainerStyle} 
            center={defaultCenter} 
            zoom={15} 
            options={{ disableDefaultUI: true, zoomControl: false }}
          >
            <MarkerClustererF options={{ maxZoom: 16, gridSize: 20 }}>
              {(clusterer) => (
                <>
                  {locationRewards.map((reward) => {
                    const unlocked = isRewardUnlocked(reward);
                    const isHoverable = unlocked && !!reward.assignedTaskId;

                    return (
                      <CombinedMarker 
                        key={reward.id} 
                        reward={reward} 
                        unlocked={unlocked} 
                        clusterer={clusterer} 
                        isHoverable={isHoverable} 
                        onClick={() => {
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
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-400">
            Loading Map...
          </div>
        )}
        <div className="absolute top-4 left-4 z-[40] bg-white/90 backdrop-blur rounded-full px-4 py-2 font-black shadow-sm flex items-center gap-2 border border-gray-100">
          <div className="w-3 h-3 bg-red-500 rounded-full"/>
          PokéMap
        </div>
      </div>

      {/* Unlocked Rewards Section */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {/* FIX 1: Use allUnlockedRewards instead of only unlockedNonLocationRewards */}
        {allUnlockedRewards.length > 0 ? (
          <div className="space-y-4">
            {allUnlockedRewards.map((reward) => (
              <div 
                key={reward.id} 
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-gray-200 transition-colors" 
                onClick={() => {
                  if (reward.assignedTaskId) {
                    const task = tasks.find((t) => t.id === reward.assignedTaskId);
                    if (task) onShowReward(task, reward);
                  }
                }}
              >
                <div className="w-14 h-14 shrink-0 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <img src={getPokemonSprite(reward.pokemonId)} alt="Pokemon" className="w-10 h-10 object-contain drop-shadow-sm"/>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate">
                    {reward.name === "Mystery Treat" || reward.name === "Wild Card!" || reward.name === "Wild Card" ? "Wild Card" : reward.name}
                  </h3>
                  {reward.type !== "link" && reward.name !== "Mystery Treat" && reward.name !== "Wild Card!" && reward.name !== "Wild Card" && (
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                      <span className="text-sm font-medium truncate">
                        {reward.content}
                      </span>
                    </div>
                  )}
                </div>

                {/* External link button for regular link rewards */}
                {reward.type === "link" && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(reward.content || reward.url, "_blank");
                    }}
                    className="p-3 shrink-0 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors border border-gray-200"
                  >
                    <ExternalLink size={18}/>
                  </button>
                )}

                {/* FIX 1: Google Maps link button for location (cafe) rewards */}
                {reward.type === "cafe" && reward.lat !== undefined && reward.lng !== undefined && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps/search/?api=1&query=${reward.lat},${reward.lng}`, "_blank");
                    }}
                    className="p-3 shrink-0 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors border border-gray-200"
                  >
                    <ExternalLink size={18}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          // FIX 2: Added text-center and px-6 so empty state text is properly centered on mobile
          <div className="h-full flex flex-col items-center justify-center opacity-50 font-bold uppercase tracking-widest text-sm text-gray-400 text-center px-6">
            Complete a task to unlock your first treat
          </div>
        )}
      </div>
    </div>
  );
}
