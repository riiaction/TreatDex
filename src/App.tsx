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
  const [taskBeingEdited, setTaskBeingEdited] = useState<any>(null);

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
    <div className="h-screen w-full bg-[#f9f9f9] flex justify-center text-gray-900 font-sans overflow-hidden">
      {/* Mobile container - to enforce mobile-first view even on desktop */}
      <div className="w-full max-w-md bg-white h-full flex flex-col relative shadow-2xl">
        {/* Header */}
        <header className="px-6 pt-4 pb-1 flex justify-between items-center z-10 bg-white">
          <div className="flex items-center gap-2">
            {/* Pokeball simple icon */}
            <div className="w-6 h-6 rounded-full bg-red-500 overflow-hidden relative border-2 border-black">
              <div className="h-1/2 bg-red-500"/>
              <div className="h-1/2 bg-white"/>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-black rounded-full"/>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black -translate-y-1/2"/>
            </div>
            <h1 className="font-extrabold text-xl tracking-tight">TreatDex</h1>
          </div>
          <button onClick={() => setIsMasterKeyModalOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <KeyRound size={20} />
          </button>
        </header>

        {/* Content Area */}
        {activeTab === "tasks" ? (
          <TaskList
            tasks={store.tasks}
            rewards={store.rewards}
            onToggleTask={store.toggleTaskCompletion}
            onToggleSubtask={store.toggleSubtaskCompletion}
            onAddNewClick={() => setIsTaskModalOpen(true)}
            onShowReward={handleShowReward}
            onEditTask={handleEditTaskClick}
            onDeleteTask={store.deleteTask}
          />
        ) : (
          <MapTab
            tasks={store.tasks}
            rewards={store.rewards}
            onShowReward={handleShowReward}
          />
        )}

        {/* Bottom Navigation */}
        <nav className="border-t border-gray-100 bg-white px-6 py-4 flex justify-around items-center z-30 pb-safe">
          <button
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === "tasks" ? "text-gray-900" : "text-gray-400"
            )}
            onClick={() => setActiveTab("tasks")}
          >
            <CheckSquare size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Tasks
            </span>
          </button>

          <button
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === "map" ? "text-gray-900" : "text-gray-400"
            )}
            onClick={() => setActiveTab("map")}
          >
            <MapIcon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Treats
            </span>
          </button>
        </nav>

        {/* Modals */}
        <TaskInputModal
          isOpen={isTaskModalOpen || !!taskBeingEdited}
          initialTask={taskBeingEdited}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskBeingEdited(null);
          }}
          onSave={handleSaveTask}
        />

        <MasterKeyModal
          isOpen={isMasterKeyModalOpen}
          onClose={() => setIsMasterKeyModalOpen(false)}
          rewards={store.rewards}
          onUpdateReward={store.updateReward}
          onAddReward={store.addReward}
          onDeleteReward={store.deleteReward}
          customMasterKey={store.customMasterKey}
          onUpdateMasterKey={store.setCustomMasterKey}
          onRemixRewards={store.remixRewards}
        />

        <RewardModal
          isOpen={!!selectedRewardToReview}
          onClose={() => setSelectedRewardToReview(null)}
          reward={selectedRewardToReview?.reward || null}
          task={selectedRewardToReview?.task || null}
        />
      </div>
    </div>
  );
}
