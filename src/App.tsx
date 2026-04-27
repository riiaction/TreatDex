import React, { useState } from "react";
import { useAppStore } from "./store";
import { TaskList } from "./components/TaskList";
import { MapTab } from "./components/MapTab";
import { TaskInputModal } from "./components/TaskInputModal";
import { RewardModal } from "./components/RewardModal";
import { MasterKeyModal } from "./components/MasterKeyModal";
import { Plus, Map as MapIcon, CheckSquare, KeyRound } from "lucide-react";
import { cn } from "./utils";
import { Reward, Task } from "./types";

export default function App() {
  const store = useAppStore();

  const [activeTab, setActiveTab] = useState<"tasks" | "map">("tasks");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMasterKeyModalOpen, setIsMasterKeyModalOpen] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState<task |="" null="">(null);

  const [selectedRewardToReview, setSelectedRewardToReview] = useState<{
    task: Task;
    reward: Reward;
  } | null>(null);

  const handleShowReward = (task: Task, reward: Reward) => {
    setSelectedRewardToReview({ task, reward });
  };

  const handleEditTaskClick = (task: Task) => {
    setTaskBeingEdited(task);
  };

  const handleSaveTask = (
    title: string,
    deadline: string | null,
    subtasks: string[],
    tags: any[],
  ) => {
    if (taskBeingEdited) {
      store.editTask(taskBeingEdited.id, title, deadline, subtasks, tags);
    } else {
      store.addTask(title, deadline, subtasks, tags);
    }
  };

  return (
    <div classname="h-screen w-full bg-[#f9f9f9] flex justify-center text-gray-900 font-sans overflow-hidden">
      {/* Mobile container - to enforce mobile-first view even on desktop */}
      <div classname="w-full max-w-md bg-white h-full flex flex-col relative shadow-2xl">
        {/* Header */}
        <header classname="px-6 pt-4 pb-1 flex justify-between items-center z-10 bg-white">
          <div classname="flex items-center gap-2">
            {/* Pokeball simple icon */}
            <div classname="w-6 h-6 rounded-full bg-red-500 overflow-hidden relative border-2 border-black">
              <div classname="h-1/2 bg-red-500"/>
              <div classname="h-1/2 bg-white"/>
              <div classname="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-black rounded-full"/>
              <div classname="absolute top-1/2 left-0 right-0 h-0.5 bg-black -translate-y-1/2"/>
            </div>
            <h1 classname="font-extrabold text-xl tracking-tight">TreatDex</h1>
          </div>
          <button onclick="{()" ==""> setIsMasterKeyModalOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <keyround size="{20}"/>
          </button>
        </header>

        {/* Content Area */}
        {activeTab === "tasks" ? (
          <tasklist tasks="{store.tasks}" rewards="{store.rewards}" ontoggletask="{store.toggleTaskCompletion}" ontogglesubtask="{store.toggleSubtaskCompletion}" onaddnewclick="{()" ==""> setIsTaskModalOpen(true)}
            onShowReward={handleShowReward}
            onEditTask={handleEditTaskClick}
            onDeleteTask={store.deleteTask}
          />
        ) : (
          <maptab tasks="{store.tasks}" rewards="{store.rewards}" onshowreward="{handleShowReward}"/>
        )}

        {/* Bottom Navigation */}
        <nav classname="border-t border-gray-100 bg-white px-6 py-4 flex justify-around items-center z-30 pb-safe">
          <button classname="{cn(" "flex="" flex-col="" items-center="" gap-1="" transition-colors",="" activetab="==" "tasks"="" ?="" "text-gray-900"="" :="" "text-gray-400",="" )}="" onclick="{()" ==""> setActiveTab("tasks")}
          >
            <checksquare size="{24}"/>
            <span classname="text-[10px] font-bold uppercase tracking-wider">
              Tasks
            </span>
          </button>

          <button classname="{cn(" "flex="" flex-col="" items-center="" gap-1="" transition-colors",="" activetab="==" "map"="" ?="" "text-gray-900"="" :="" "text-gray-400",="" )}="" onclick="{()" ==""> setActiveTab("map")}
          >
            <mapicon size="{24}"/>
            <span classname="text-[10px] font-bold uppercase tracking-wider">
              Treats
            </span>
          </button>
        </nav>

        {/* Modals */}
        <taskinputmodal isopen="{isTaskModalOpen" ||="" !!taskbeingedited}="" initialtask="{taskBeingEdited}" onclose="{()" ==""> {
            setIsTaskModalOpen(false);
            setTaskBeingEdited(null);
          }}
          onSave={handleSaveTask}
        />

        <masterkeymodal isopen="{isMasterKeyModalOpen}" onclose="{()" ==""> setIsMasterKeyModalOpen(false)}
          rewards={store.rewards}
          onUpdateReward={store.updateReward}
          onAddReward={store.addReward}
          onDeleteReward={store.deleteReward}
          customMasterKey={store.customMasterKey}
          onUpdateMasterKey={store.setCustomMasterKey}
          onRemixRewards={store.remixRewards}
        />

        <rewardmodal isopen="{!!selectedRewardToReview}" onclose="{()" ==""> setSelectedRewardToReview(null)}
          reward={selectedRewardToReview?.reward || null}
          task={selectedRewardToReview?.task || null}
        />
      </div>
    </div>
  );
}
