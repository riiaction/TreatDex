import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  Map as MapIcon,
  Lock,
  Coffee,
  Gift,
  Link as LinkIcon,
  Navigation,
  Tag,
  Trash2,
  CheckSquare,
  X,
} from "lucide-react";
import {
  cn,
  getPokeballSprite,
  getPokemonSprite,
  getTagColor,
  getTagText,
} from "../utils";
import { Task, Reward } from "../types";
import { format, isToday, parseISO, isSameYear } from "date-fns";
import { motion, useAnimation, PanInfo, AnimatePresence } from "motion/react";
import { KANTO_POKEMON } from "../pokemonList";

interface TaskListProps {
  tasks: Task[];
  rewards: Reward[];
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddNewClick: () => void;
  onShowReward: (task: Task, reward: Reward) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({
  tasks,
  rewards,
  onToggleTask,
  onToggleSubtask,
  onAddNewClick,
  onShowReward,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  const [taskFilter, setTaskFilter] = useState<'all' | 'today' | 'tag'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTagsPanel, setShowTagsPanel] = useState(false);

  const todayTasks = tasks.filter(
    (t) => t.deadline && isToday(parseISO(t.deadline)),
  );
  
  const completedToday = todayTasks.filter((t) => t.completed).length;

  const progressSum = todayTasks.reduce((sum, t) => {
    if (t.completed) return sum + 1;
    if (t.subtasks && t.subtasks.length > 0) {
      const completedSubtasks = t.subtasks.filter((st) => st.completed).length;
      return sum + (completedSubtasks / t.subtasks.length) * 0.99;
    }
    return sum;
  }, 0);

  const progress =
    todayTasks.length === 0 ? 0 : (progressSum / todayTasks.length) * 100;

  const prevCompletedCount = useRef(completedToday);
  const prevProgress = useRef(progress);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let messageToShow: string | null = null;
    let shouldShow = false;

    if (prevProgress.current < 100 && progress === 100) {
      shouldShow = true;
      const texts = [
        "That's a wrap. You caught them all!",
        "All done! Your dedication is unmatched!",
      ];
      messageToShow = texts[Math.floor(Math.random() * texts.length)];
    } else if (prevProgress.current < 75 && progress >= 75 && progress < 100) {
      if (Math.random() > 0.5) {
        shouldShow = true;
        const texts = [
          "You're almost at the finish line!",
          "You're so close to catching them all!",
        ];
        messageToShow = texts[Math.floor(Math.random() * texts.length)];
      }
    } else if (prevProgress.current < 50 && progress >= 50 && progress < 75) {
      shouldShow = true;
      const texts = [
        "Amazing progress! You're halfway there",
        "You're crushing it! Keep going",
      ];
      messageToShow = texts[Math.floor(Math.random() * texts.length)];
    } else if (
      (prevCompletedCount.current === 0 && completedToday === 1) ||
      (prevCompletedCount.current === 1 && completedToday === 2)
    ) {
      if (Math.random() > 0.5) {
        shouldShow = true;
        const texts = [
          "You're on a roll! Keep it up",
          "You're off to a great start!",
        ];
        messageToShow = texts[Math.floor(Math.random() * texts.length)];
      }
    }

    if (shouldShow && messageToShow) {
      setToastMessage(messageToShow);
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);

      prevCompletedCount.current = completedToday;
      prevProgress.current = progress;
      return () => clearTimeout(timer);
    } else {
      prevCompletedCount.current = completedToday;
      prevProgress.current = progress;
    }
  }, [progress, completedToday]);

  const uniqueTagsMap = new Map();
  tasks.forEach((t) => {
    t.tags?.forEach((tag) => {
      const text = getTagText(tag);
      if (!uniqueTagsMap.has(text)) {
        uniqueTagsMap.set(text, tag);
      }
    });
  });
  const uniqueTagsArray = Array.from(uniqueTagsMap.values());
  const uniqueTagsCount = uniqueTagsArray.length;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });

  const filteredTasks = sortedTasks.filter(t => {
    if (taskFilter === 'today') {
      return t.deadline && isToday(parseISO(t.deadline));
    } else if (taskFilter === 'tag' && selectedTag) {
      return t.tags?.some(tag => getTagText(tag) === selectedTag);
    }
    return true; 
  });

  return (
    // FIX: Changed to flex-col so we can have scrollable content + fixed bottom bar
    <div className="flex-1 relative flex flex-col overflow-hidden">

      {/* Scrollable task list area — pb-32 gives space so last task isn't hidden behind the bar */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 pt-4 pb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button 
              onClick={() => {
                if (taskFilter === 'today') {
                  setTaskFilter('all');
                } else {
                  setTaskFilter('today');
                  setShowTagsPanel(false);
                }
              }}
              className={cn(
                "text-left p-4 rounded-2xl shadow-sm border flex flex-col transition-all cursor-pointer",
                taskFilter === 'today' ? "bg-red-50 border-red-200" : "bg-white border-gray-100 hover:border-red-100"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-2">
                  <CalendarIcon />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {todayTasks.length}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-500">Today</span>
            </button>
            <button 
              onClick={() => {
                if (uniqueTagsCount > 0) {
                  if (showTagsPanel) {
                    setShowTagsPanel(false);
                    if (taskFilter === 'tag') {
                      setTaskFilter('all');
                      setSelectedTag(null);
                    }
                  } else {
                    setShowTagsPanel(true);
                  }
                }
              }}
              className={cn(
                "text-left p-4 rounded-2xl shadow-sm border flex flex-col transition-all cursor-pointer",
                showTagsPanel || taskFilter === 'tag' ? "bg-teal-50 border-teal-200" : "bg-white border-gray-100 hover:border-teal-100",
                uniqueTagsCount === 0 && "hover:border-gray-100"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mb-2">
                  <Tag size={18} />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {uniqueTagsCount}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-500">Tags</span>
            </button>
          </div>

          {showTagsPanel && (
            <motion.div 
              initial={{ height: 0, opacity: 0, scale: 0.95 }} 
              animate={{ height: "auto", opacity: 1, scale: 1 }} 
              className="mb-6 p-4 pt-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-2 relative origin-top"
            >
               <button 
                 onClick={() => {
                   setShowTagsPanel(false);
                   setTaskFilter('all');
                   setSelectedTag(null);
                 }}
                 className="absolute top-2 right-2 p-1 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
               >
                 <X size={16} />
               </button>
               {uniqueTagsArray.length > 0 ? (
                 uniqueTagsArray.map((tag, i) => {
                    const text = getTagText(tag);
                    const isSelected = selectedTag === text;
                    return (
                      <button 
                        key={i} 
                        type="button" 
                        onClick={() => {
                           if (isSelected) {
                              setTaskFilter('all');
                              setSelectedTag(null);
                           } else {
                              setTaskFilter('tag');
                              setSelectedTag(text);
                           }
                        }}
                        className={cn(
                           "px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all",
                           isSelected ? "ring-[3px] ring-offset-2 ring-gray-300 scale-105" : "hover:scale-105"
                        )}
                        style={{ backgroundColor: getTagColor(tag), color: 'white' }}
                      >
                        {text}
                      </button>
                    )
                 })
               ) : (
                 <p className="text-sm text-gray-400">No tags available.</p>
               )}
            </motion.div>
          )}

          <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight mt-6">
            My Missions
          </h2>

          <div className="space-y-4 mb-4 mt-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <img src={getPokeballSprite()} className="w-12 h-12 mx-auto grayscale opacity-50 mb-3" alt="Empty"/>
                <p className="text-gray-500 font-medium">
                   {taskFilter === 'today' ? "No missions for today." : taskFilter === 'tag' ? "No missions with this tag." : "No missions yet."}
                </p>
                {taskFilter === 'all' && (
                  <button onClick={onAddNewClick} className="mt-3 text-red-500 font-semibold text-sm hover:underline">
                    Add the first task
                  </button>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  reward={rewards.find((r) => r.id === task.rewardId)}
                  onToggleTask={() => onToggleTask(task.id)}
                  onToggleSubtask={(stId) => onToggleSubtask(task.id, stId)}
                  onShowReward={() => {
                    const r = rewards.find((r) => r.id === task.rewardId);
                    if (r) {
                      onShowReward(task, r);
                    }
                  }}
                  onEditTask={() => onEditTask?.(task)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* FIX: Caught Today bar is now OUTSIDE the scrollable area so it never scrolls away */}
      <div className="px-6 pb-6 pt-2 bg-transparent pointer-events-none z-10 flex flex-col items-center">
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.3 }} 
              className="mb-2 bg-yellow-400 text-yellow-900 px-5 py-2.5 rounded-full text-sm font-medium shadow-md whitespace-nowrap text-center"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="w-full bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 pointer-events-auto relative pr-[4.5rem]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Caught Today
            </span>
            <span className="text-sm font-bold text-[#1daeb1]">
              {completedToday} / {todayTasks.length}
            </span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1daeb1] rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1" style={{ width: `${Math.max(progress, 5)}%` }}>
              {progress > 10 && (
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full"/>
              )}
            </div>
          </div>
          <button onClick={onAddNewClick} className="absolute top-1/2 -translate-y-1/2 right-4 w-9 h-9 bg-[#ed444a] hover:bg-red-600 active:bg-red-700 text-white rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20 pointer-events-auto">
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

    </div>
  );
}

const TaskItem: React.FC<{
  task: Task;
  reward?: Reward;
  onToggleTask: () => void;
  onToggleSubtask: (stId: string) => void;
  onShowReward: () => void;
  onEditTask?: () => void;
  onDelete: () => void;
}> = ({
  task,
  reward,
  onToggleTask,
  onToggleSubtask,
  onShowReward,
  onEditTask,
  onDelete,
}) => {
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete();
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div className="relative rounded-2xl mb-6">
      <div className="absolute inset-px bg-red-500 flex items-center justify-end px-6 rounded-2xl z-0">
        <Trash2 className="text-white" size={24} />
      </div>

      <motion.div 
        drag="x" 
        dragConstraints={{ left: 0, right: 0 }} 
        dragElastic={{ left: 0.5, right: 0 }} 
        dragDirectionLock 
        onDragEnd={handleDragEnd} 
        animate={controls} 
        whileTap={{ cursor: "grabbing" }} 
        className={cn(
          "relative rounded-2xl p-4 shadow-sm border transition-colors cursor-pointer w-full h-full z-10", 
          task.completed ? "border-[#1daeb1]/30 bg-[#e6f7f7]" : "bg-white border-gray-100 hover:border-[#1daeb1]/30" 
        )} 
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (onEditTask) onEditTask();
        }}
      >
        <div className="flex items-start gap-4">
          <button onClick={onToggleTask} className="mt-1 flex-shrink-0 text-gray-300 hover:text-[#1daeb1] transition-colors">
            {task.completed ? (
              <CheckCircle2 size={24} className="text-[#1daeb1]" />
            ) : (
              <Circle size={24} />
            )}
          </button>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={cn(
                "text-lg font-bold transition-all", 
                task.completed ? "line-through text-gray-500" : "text-gray-800" 
              )}>
                {task.title}
              </h3>

              {task.deadline && (
                <span className="px-2.5 py-1 bg-[#F1F5F9] text-[#64748B] rounded-full text-xs font-semibold whitespace-nowrap pt-[4px]">
                  {isSameYear(parseISO(task.deadline), new Date())
                    ? format(parseISO(task.deadline), "MMM d")
                    : format(parseISO(task.deadline), "MMM d, yyyy")}
                </span>
              )}

              {task.subtasks.length > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 rounded-md px-1.5 py-0.5 w-fit">
                  <div className="bg-gray-500 text-white rounded-[4px] w-[14px] h-[14px] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>
                    {task.subtasks.filter((st) => st.completed).length}/
                    {task.subtasks.length}
                  </span>
                </div>
              )}
            </div>

            {task.subtasks.length > 0 && (
              <div className="mt-3 space-y-2">
                {task.subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-2 group">
                    <button 
                      onClick={() => onToggleSubtask(st.id)}
                      className="text-gray-300 group-hover:text-[#1daeb1]/70"
                    >
                      {st.completed ? (
                        <CheckCircle2 size={18} className="text-[#1daeb1]/70" />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>
                    <span className={cn(
                      "text-sm", 
                      st.completed ? "text-gray-400 line-through" : "text-gray-600" 
                    )}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {task.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-md text-xs font-bold text-white shadow-sm flex items-center justify-center leading-none" style={{ backgroundColor: getTagColor(tag) }}>
                    {getTagText(tag)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center flex-shrink-0 ml-2 pt-1 cursor-pointer w-14 relative" onClick={(e) => {
              e.stopPropagation();
              if (task.completed) onShowReward();
            }}
          >
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-sm flex-shrink-0 overflow-hidden relative", 
              task.completed ? "bg-[#fdf3d0] border-2 border-[#facc15] p-[10%]" : "bg-gray-100 border-2 border-gray-100" 
            )}>
              <img 
                src={task.completed ? getPokemonSprite(reward ? reward.pokemonId : task.pokemonId) : getPokeballSprite()} 
                alt="Reward" 
                className={cn(
                  "object-contain transition-transform", 
                  task.completed ? "w-full h-full drop-shadow-sm" : "w-7 h-7 opacity-50 grayscale m-auto" 
                )} 
                style={{ imageRendering: "pixelated" }} 
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
