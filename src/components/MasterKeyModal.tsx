import React, { useState } from "react";
import { Reward } from "../types";
import { PlacesInput } from "./PlacesInput";
import {
  X,
  Save,
  Plus,
  Link as LinkIcon,
  MapPin,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  Search,
  ExternalLink,
} from "lucide-react";
import { KANTO_POKEMON } from "../pokemonList";
import { getPokemonSprite, extractUrlTitle } from "../utils";

interface MasterKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: Reward[];
  onUpdateReward: (id: string, updates: Partial<Reward>) => void;
  onAddReward: (r: Omit<Reward, "id">) => void;
  onDeleteReward: (id: string) => void;
  customMasterKey: string;
  onUpdateMasterKey: (k: string) => void;
  onRemixRewards: () => void;
}

export function MasterKeyModal({
  isOpen,
  onClose,
  rewards,
  onUpdateReward,
  onAddReward,
  onDeleteReward,
  customMasterKey,
  onUpdateMasterKey,
  onRemixRewards,
}: MasterKeyModalProps) {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [oldKey, setOldKey] = useState("");
  const [newKey, setNewKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [showOldKey, setShowOldKey] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [showConfirmKey, setShowConfirmKey] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Sub-modal state for editing a pokemon reward
  const [selectedPokemon, setSelectedPokemon] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [editingReward, setEditingReward] = useState<Partial<Reward> | null>(
    null,
  );

  const [activeMasterTab, setActiveMasterTab] = useState<"pokedex" | "rewards">(
    "pokedex",
  );
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === customMasterKey) {
      setAuthenticated(true);
    } else {
      alert("Incorrect setup key.");
    }
  };

  const handleUpdateMasterKey = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess("");

    if (oldKey !== customMasterKey) {
      setUpdateError("Incorrect old setup key.");
      return;
    }
    if (newKey !== confirmKey) {
      setUpdateError("New setup keys do not match.");
      return;
    }
    if (!newKey.trim()) {
      setUpdateError("Setup key cannot be empty.");
      return;
    }

    onUpdateMasterKey(newKey.trim());
    setUpdateSuccess("Setup key successfully updated!");
    setTimeout(() => {
      setShowUpdateModal(false);
      setOldKey("");
      setNewKey("");
      setConfirmKey("");
      setUpdateSuccess("");
    }, 2000);
  };

  const closeAndReset = () => {
    setAuthenticated(false);
    setPassword("");
    setOldKey("");
    setNewKey("");
    setConfirmKey("");
    setShowUpdateModal(false);
    setSelectedPokemon(null);
    setEditingReward(null);
    setUpdateError("");
    setSearchQuery("");
    onClose();
  };

  const openRewardEditor = (pokemonId: number, pokemonName: string) => {
    const existing = rewards.find((r) => r.pokemonId === pokemonId);
    setSelectedPokemon({ id: pokemonId, name: pokemonName });
    if (existing) {
      setEditingReward(existing);
    } else {
      setEditingReward({
        type: "cafe",
        name: `${pokemonName} Reward`,
        content: "",
        url: "",
        pokemonId: pokemonId,
      });
    }
  };

  const handleSaveReward = async () => {
    if (!selectedPokemon || !editingReward) return;

    let finalReward = { ...editingReward };

    if (finalReward.type === "link" && finalReward.url) {
      if (
        !finalReward.name ||
        finalReward.name.trim() === "" ||
        finalReward.name === `${selectedPokemon.name} Reward` ||
        finalReward.name === finalReward.url
      ) {
        const title = await extractUrlTitle(finalReward.url);
        if (title) {
          finalReward.name = title;
        } else {
          finalReward.name = finalReward.url;
        }
      }
    }

    const isEmpty =
      !finalReward.name?.trim() &&
      !finalReward.content?.trim() &&
      !finalReward.url?.trim();

    if (finalReward.id) {
      if (isEmpty) {
        onDeleteReward(finalReward.id);
      } else {
        onUpdateReward(finalReward.id, finalReward);
      }
    } else {
      if (!isEmpty) {
        onAddReward(finalReward as Omit<Reward, "id">);
      }
    }
    setSelectedPokemon(null);
    setEditingReward(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
          <button onClick={closeAndReset} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 z-10">
            <X size={16} />
          </button>

          {!authenticated ? (
            <div className="py-10 text-center">
              <h2 className="text-2xl font-black mb-4">Setup Rewards</h2>
              <form onSubmit={handleLogin} className="space-y-4 max-w-xs mx-auto">
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-100 border border-transparent rounded-xl py-3 pl-4 pr-10 focus:border-gray-300 focus:outline-none focus:ring-0"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                  Unlock
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 overflow-y-hidden flex flex-col mt-4">
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                  <button onClick={() => setActiveMasterTab("pokedex")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMasterTab === "pokedex" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Pokedex
                  </button>
                  <button onClick={() => setActiveMasterTab("rewards")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMasterTab === "rewards" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Rewards
                  </button>
                </div>
                {activeMasterTab === "pokedex" && (
                  <button onClick={onRemixRewards} className="bg-[#1daeb1]/10 text-[#1daeb1] hover:bg-[#1daeb1]/20 font-bold py-2 px-4 rounded-xl text-sm transition-colors">
                    Remix
                  </button>
                )}
              </div>

              {activeMasterTab === "pokedex" ? (
                <>
                  <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                      {rewards.length} / 151 Assigned
                    </p>
                    <div className="relative w-32 sm:w-40">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-8 pr-3 text-[16px] md:text-sm focus:border-[#1daeb1] focus:ring-1 focus:ring-[#1daeb1] focus:outline-none outline-none appearance-none focus:ring-inset" 
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto pr-2 flex-1 relative">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-10">
                      {KANTO_POKEMON.map((name, index) => {
                        const pokemonId = index + 1;
                        if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) {
                          return null;
                        }
                        const isAssigned = rewards.some(
                          (r) => r.pokemonId === pokemonId,
                        );

                        return (
                          <button key={pokemonId} onClick={() => openRewardEditor(pokemonId, name)}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                              isAssigned
                                ? "bg-[#1daeb1]/10 border-[#1daeb1]/30 hover:border-[#1daeb1]/50"
                                : "bg-white border-gray-100 hover:border-gray-300"
                            }`}
                          >
                            <img src={getPokemonSprite(pokemonId)} alt={name} className="w-12 h-12 object-contain scale-[1.3]" style={{ imageRendering: "pixelated" }} />
                            <span className="text-[10px] font-bold mt-2 text-center truncate w-full text-gray-700">
                              {name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                  <div className="space-y-4 flex-1 pr-2 pb-6">
                    {rewards.map((reward) => (
                      <div key={reward.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-4 focus-within:border-[#1daeb1] focus-within:bg-[#e6f7f7] transition-colors">
                        <div className="w-16 h-16 mx-auto sm:mx-0 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <img src={getPokemonSprite(reward.pokemonId)} className="w-12 h-12 object-contain scale-[1.2]" style={{ imageRendering: "pixelated" }} />
                        </div>
                        <div className="flex-1 space-y-2.5">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex flex-1 gap-2 relative">
                              {reward.type === "cafe" ? (
                                <PlacesInput 
                                  value={reward.name || ""} 
                                  onChange={(e) =>
                                    onUpdateReward(reward.id, {
                                      name: e.target.value,
                                    })
                                  }
                                  onSelectPlace={({ name, address, url, lat, lng }) => {
                                    onUpdateReward(reward.id, {
                                      name,
                                      content: address,
                                      url,
                                      lat,
                                      lng,
                                    });
                                  }}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[16px] md:text-sm font-bold focus:border-[#1daeb1] focus:ring-1 focus:ring-[#1daeb1] outline-none transition-colors appearance-none"
                                  placeholder="Name (e.g. Cafe)"
                                />
                              ) : (
                                <input type="text" value={reward.name || ""} onChange={(e) =>
                                    onUpdateReward(reward.id, {
                                      name: e.target.value,
                                    })
                                  }
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[16px] md:text-sm font-bold focus:border-[#1daeb1] focus:ring-1 focus:ring-[#1daeb1] outline-none transition-colors appearance-none"
                                  placeholder="Name (e.g. Cafe)"
                                />
                              )}
                              <button onClick={() => onDeleteReward(reward.id)}
                                className="p-2 sm:hidden text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <select value={reward.type} onChange={(e) => {
                                  const newType = e.target.value as any;
                                  const updates: Partial<Reward> = {
                                    type: newType,
                                  };
                                  if (
                                    newType === "link" &&
                                    reward.type === "cafe"
                                  ) {
                                    updates.name = "";
                                    updates.url = "";
                                    updates.content = "";
                                  }
                                  onUpdateReward(reward.id, updates);
                                }}
                                className="flex-1 sm:w-[100px] bg-white border border-gray-200 rounded-lg px-3 py-2 text-[16px] md:text-sm focus:border-[#1daeb1] focus:ring-1 focus:ring-[#1daeb1] outline-none appearance-none transition-colors"
                              >
                                <option value="cafe">Location</option>
                                <option value="link">Link</option>
                                <option value="text">Text</option>
                              </select>
                              <button onClick={() => onDeleteReward(reward.id)}
                                className="p-2 hidden sm:block text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {reward.type === "cafe" && (
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus-within:border-[#1daeb1] focus-within:ring-1 focus-within:ring-[#1daeb1] transition-colors">
                              <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                              <input type="text" value={reward.content || ""} onChange={(e) =>
                                  onUpdateReward(reward.id, {
                                    content: e.target.value,
                                  })
                                }
                                className="w-full bg-transparent border-none py-0 focus:outline-none text-[16px] md:text-sm"
                                placeholder="Location details"
                              />
                            </div>
                          )}

                          {(reward.type === "cafe" ||
                            reward.type === "link") && (
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus-within:border-[#1daeb1] focus-within:ring-1 focus-within:ring-[#1daeb1] transition-colors">
                              <LinkIcon size={14} className="text-gray-400 flex-shrink-0" />
                              <input type="text" value={reward.url || ""} onChange={(e) =>
                                  onUpdateReward(reward.id, {
                                    url: e.target.value,
                                  })
                                }
                                onBlur={async (e) => {
                                  if (reward.type === 'link' && e.target.value) {
                                    const title = await extractUrlTitle(e.target.value);
                                    if (title) {
                                      onUpdateReward(reward.id, { name: title });
                                    } else if (!reward.name || reward.name.trim() === '') {
                                      onUpdateReward(reward.id, { name: e.target.value });
                                    }
                                  }
                                }}
                                className="w-full bg-transparent border-none py-0 focus:outline-none text-[16px] md:text-sm text-gray-900"
                                placeholder="https://"
                              />
                              {reward.url && (
                                <a href={reward.url.startsWith('http') ? reward.url : `https://${reward.url}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1daeb1] transition-colors flex-shrink-0">
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => {
                      const usedPokemonIds = rewards.map((r) => r.pokemonId);
                      const allIds = Array.from(
                        { length: 151 },
                        (_, i) => i + 1,
                      );
                      const availablePokes = allIds.filter(
                        (id) => !usedPokemonIds.includes(id),
                      );
                      const nextPoke =
                        availablePokes.length > 0
                          ? availablePokes[
                              Math.floor(Math.random() * availablePokes.length)
                            ]
                          : Math.floor(Math.random() * 151) + 1;
                      onAddReward({
                        name: "New Custom Treat",
                        content: "",
                        type: "text",
                        pokemonId: nextPoke,
                      });
                    }}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-50 flex-shrink-0 transition-colors"
                  >
                    <Plus size={18} /> Add Reward
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 flex-shrink-0">
                <button onClick={() => setShowUpdateModal(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <KeyRound size={16} /> Update Setup Key
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Sub-Modal */}
      {selectedPokemon && editingReward && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
            <button onClick={() => setSelectedPokemon(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#1daeb1]/10 p-2 rounded-xl">
                <img src={getPokemonSprite(selectedPokemon.id)} alt={selectedPokemon.name} className="w-12 h-12 object-contain scale-[1.3]" style={{ imageRendering: "pixelated" }} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedPokemon.name}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">
                  Reward Name
                </label>
                <div className="flex gap-2">
                  {editingReward.type === "cafe" ? (
                    <PlacesInput 
                      value={editingReward.name || ""} 
                      onChange={(e) =>
                        setEditingReward({ ...editingReward, name: e.target.value })
                      }
                      onSelectPlace={({ name, address, url, lat, lng }) => {
                        setEditingReward({
                          ...editingReward,
                          name,
                          content: address,
                          url,
                          lat,
                          lng,
                        });
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:border-[#1daeb1] focus:ring-1 focus:ring-[#1daeb1] focus:outline-none transition-colors"
                    />
                  ) : (
                    <input type="text" value={editingReward.name || ""} onChange={(e) =>
                        setEditingReward({ ...editingReward, name: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:border-[#1daeb1] focus:ring-1 focus:ring-[#1daeb1] focus:outline-none transition-colors"
                    />
                  )}
                  {editingReward?.id && (
                    <button onClick={() => {
                        onDeleteReward(editingReward.id as string);
                        setSelectedPokemon(null);
                        setEditingReward(null);
                      }}
                      className="flex-none bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-xl transition-colors flex items-center justify-center"
                      title="Delete Reward"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">
                  Reward Type
                </label>
                <select value={editingReward.type || "cafe"} onChange={(e) => {
                    const newType = e.target.value as any;
                    const updates: Partial<Reward> = { type: newType };
                    if (newType === "link" && editingReward.type === "cafe") {
                      updates.name = "";
                      updates.url = "";
                      updates.content = "";
                    }
                    setEditingReward({ ...editingReward, ...updates });
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:border-[#1daeb1] focus:ring-1 focus:ring-[#1daeb1] focus:outline-none transition-colors appearance-none"
                >
                  <option value="cafe">Location</option>
                  <option value="link">Link</option>
                  <option value="text">Text</option>
                </select>
              </div>

              {editingReward.type === "cafe" && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={editingReward.content || ""} onChange={(e) =>
                        setEditingReward({
                          ...editingReward,
                          content: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:border-[#1daeb1] focus:ring-1 focus:ring-[#1daeb1] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {(editingReward.type === "cafe" ||
                editingReward.type === "link") && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">
                    Link
                  </label>
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="url" value={editingReward.url || ""} onChange={(e) =>
                        setEditingReward({
                          ...editingReward,
                          url: e.target.value,
                        })
                      }
                      onBlur={async (e) => {
                        if (editingReward.type === "link" && e.target.value) {
                          const title = await extractUrlTitle(e.target.value);
                          if (title) {
                            setEditingReward((prev) => prev ? { ...prev, name: title } : prev);
                          } else if (!editingReward.name || editingReward.name.trim() === "") {
                            setEditingReward((prev) => prev ? { ...prev, name: e.target.value } : prev);
                          }
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:border-[#1daeb1] focus:ring-1 focus:ring-[#1daeb1] focus:outline-none transition-colors text-[16px] md:text-sm"
                      placeholder="https://"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setSelectedPokemon(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleSaveReward} className="flex-1 bg-[#1daeb1] hover:bg-[#189699] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Key Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
            <button onClick={() => {
                setShowUpdateModal(false);
                setUpdateError("");
                setUpdateSuccess("");
                setOldKey("");
                setNewKey("");
                setConfirmKey("");
              }}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
            >
              <X size={16} />
            </button>
            <h2 className="text-xl font-black mb-6 flex gap-2 items-center">
              <KeyRound size={20} /> Update Setup Key
            </h2>

            <form onSubmit={handleUpdateMasterKey} className="space-y-4">
              <div className="relative">
                <input 
                  type={showOldKey ? "text" : "password"} 
                  placeholder="Old Setup Key" 
                  value={oldKey} 
                  onChange={(e) => setOldKey(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 pl-4 pr-10 text-[16px] md:text-sm focus:border-red-500 focus:outline-none focus:ring-0"
                  required
                />
                <button type="button" onClick={() => setShowOldKey(!showOldKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input 
                  type={showNewKey ? "text" : "password"} 
                  placeholder="New Setup Key" 
                  value={newKey} 
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 pl-4 pr-10 text-[16px] md:text-sm focus:border-red-500 focus:outline-none focus:ring-0"
                  required
                />
                <button type="button" onClick={() => setShowNewKey(!showNewKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input 
                  type={showConfirmKey ? "text" : "password"} 
                  placeholder="Confirm New Setup Key" 
                  value={confirmKey} 
                  onChange={(e) => setConfirmKey(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 pl-4 pr-10 text-[16px] md:text-sm focus:border-red-500 focus:outline-none focus:ring-0"
                  required
                />
                <button type="button" onClick={() => setShowConfirmKey(!showConfirmKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {updateError && (
                <p className="text-sm font-bold text-red-500 bg-red-50 p-2 rounded-lg text-center">
                  {updateError}
                </p>
              )}
              {updateSuccess && (
                <p className="text-sm font-bold text-green-600 bg-green-50 p-2 rounded-lg text-center">
                  {updateSuccess}
                </p>
              )}

              <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 mt-2 rounded-xl text-sm transition-colors">
                Update Key
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
