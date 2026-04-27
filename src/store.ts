import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Task, Reward, INITIAL_CAFE_REWARDS } from "./types";

function getAvailablePokemonIds(usedIds: number[]): number[] {
  // Use first 151 pokemons (Gen 1)
  const allIds = Array.from({ length: 151 }, (_, i) => i + 1);
  return allIds.filter((id) => !usedIds.includes(id));
}

export function useAppStore() {
  const [tasks, setTasks] = useState<task[]>(() => {
    const saved = localStorage.getItem("cafedex_tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [rewards, setRewards] = useState<reward[]>(() => {
    const saved = localStorage.getItem("cafedex_rewards");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((r: any) => {
        const initial = INITIAL_CAFE_REWARDS.find((ir) => ir.name === r.name);
        if (initial && (!r.lat || !r.lng)) {
          return { ...r, lat: initial.lat, lng: initial.lng };
        }
        return r;
      });
    }
    // Initialize with default rewards
    return INITIAL_CAFE_REWARDS.map((r) => ({
      ...r,
      id: uuidv4(),
      assignedTaskId: undefined,
    }));
  });

  const [masterKeyMode, setMasterKeyMode] = useState(false);
  const [customMasterKey, setCustomMasterKey] = useState(() => {
    return localStorage.getItem("cafedex_masterkey") || "cafedex";
  });

  // Auto-repair orphaned tasks and rewards
  useEffect(() => {
    let tasksChanged = false;
    let rewardsChanged = false;

    let nextTasks = [...tasks];
    let nextRewards = [...rewards];

    for (let i = 0; i < nextTasks.length; i++) {
      const task = nextTasks[i];
      const rewardExists = nextRewards.some(r => r.id === task.rewardId);
      
      if (!rewardExists && task.pokemonId) {
        // Try to find an unassigned reward that matches the pokemonId
        const matchingRewardIndex = nextRewards.findIndex(r => r.pokemonId === task.pokemonId && !r.assignedTaskId);
        if (matchingRewardIndex !== -1) {
          const matchingReward = nextRewards[matchingRewardIndex];
          nextTasks[i] = { ...task, rewardId: matchingReward.id };
          nextRewards[matchingRewardIndex] = { ...matchingReward, assignedTaskId: task.id };
          tasksChanged = true;
          rewardsChanged = true;
        }
      }
    }

    if (tasksChanged) setTasks(nextTasks);
    if (rewardsChanged) setRewards(nextRewards);
  }, [tasks, rewards]);

  useEffect(() => {
    localStorage.setItem("cafedex_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("cafedex_rewards", JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem("cafedex_masterkey", customMasterKey);
  }, [customMasterKey]);

  const addTask = (
    title: string,
    deadline: string | null,
    subtaskTitles: string[],
    tags: string[] = [],
  ) => {
    // Find an unassigned reward
    const unassignedRewards = rewards.filter((r) => !r.assignedTaskId);
    let assignedReward =
      unassignedRewards.length > 0
        ? unassignedRewards[
            Math.floor(Math.random() * unassignedRewards.length)
          ]
        : null;

    let pokemonId = 1;
    let rewardId = "";

    if (assignedReward) {
      pokemonId = assignedReward.pokemonId;
      rewardId = assignedReward.id;
    } else {
      // Create a fallback text reward if all rewards are used
      const usedPokemonIds = rewards.map((r) => r.pokemonId);
      const availablePokes = getAvailablePokemonIds(usedPokemonIds);
      const nextPoke =
        availablePokes.length > 0
          ? availablePokes[Math.floor(Math.random() * availablePokes.length)]
          : Math.floor(Math.random() * 151) + 1;

      const fallbackReward: Reward = {
        id: uuidv4(),
        type: "text",
        name: "Wild Card",
        content: "Treat yourself to something nice!",
        pokemonId: nextPoke,
      };
      setRewards((prev) => [...prev, fallbackReward]);
      pokemonId = nextPoke;
      rewardId = fallbackReward.id;
    }

    const newTask: Task = {
      id: uuidv4(),
      title,
      completed: false,
      deadline: deadline || undefined,
      subtasks: subtaskTitles
        .filter((t) => t.trim())
        .map((t) => ({ id: uuidv4(), title: t, completed: false })),
      pokemonId,
      rewardId,
      createdAt: new Date().toISOString(),
      tags,
    };

    setTasks((prev) => [...prev, newTask]);

    // Mark reward as assigned
    setRewards((prev) =>
      prev.map((r) =>
        r.id === rewardId ? { ...r, assignedTaskId: newTask.id } : r,
      ),
    );
  };

  const editTask = (
    taskId: string,
    title: string,
    deadline: string | null,
    subtaskTitles: string[],
    tags: any[] = [],
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = subtaskTitles
            .filter((t) => t.trim())
            .map((subTitle) => {
              const existing = t.subtasks.find((st) => st.title === subTitle);
              if (existing) return existing;
              return { id: uuidv4(), title: subTitle, completed: false };
            });
          return {
            ...t,
            title,
            deadline: deadline || undefined,
            subtasks: updatedSubtasks,
            tags,
          };
        }
        return t;
      }),
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    // Optionally free up the reward
    setRewards((prev) =>
      prev.map((r) =>
        r.assignedTaskId === taskId ? { ...r, assignedTaskId: undefined } : r,
      ),
    );
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isCompleting = !t.completed;
          const subtasks = isCompleting
            ? t.subtasks.map((st) => ({ ...st, completed: true }))
            : t.subtasks;
          return { ...t, completed: isCompleting, subtasks };
        }
        return t;
      }),
    );
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const subtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st,
          );
          const allCompleted =
            subtasks.length > 0 && subtasks.every((st) => st.completed);
          return { ...t, subtasks, completed: allCompleted };
        }
        return t;
      }),
    );
  };

  const updateReward = (rewardId: string, updates: Partial<reward>) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, ...updates } : r)),
    );
  };

  const addReward = (reward: Omit<reward, "id"="">) => {
    const newId = uuidv4();
    let assignedTaskId: string | undefined = undefined;

    setTasks((prevTasks) => {
      const orphanedTask = prevTasks.find(
        (t) =>
          t.pokemonId === reward.pokemonId &&
          !rewards.some((r) => r.id === t.rewardId)
      );
      if (orphanedTask) {
        assignedTaskId = orphanedTask.id;
        return prevTasks.map((t) =>
          t.id === orphanedTask.id ? { ...t, rewardId: newId } : t
        );
      }
      return prevTasks;
    });

    setRewards((prev) => [...prev, { ...reward, id: newId, assignedTaskId }]);
  };

  const deleteReward = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
  };

  const remixRewards = () => {
    const allGen1Ids = Array.from({ length: 151 }, (_, i) => i + 1);
    for (let i = allGen1Ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allGen1Ids[i], allGen1Ids[j]] = [allGen1Ids[j], allGen1Ids[i]];
    }

    const newRewards = rewards.map((r, i) => {
      return { ...r, pokemonId: allGen1Ids[i % 151] };
    });
    setRewards(newRewards);

    setTasks((prev) =>
      prev.map((t) => {
        const updatedReward = newRewards.find((r) => r.id === t.rewardId);
        if (updatedReward) {
          return { ...t, pokemonId: updatedReward.pokemonId };
        }
        return t;
      }),
    );
  };

  return {
    tasks,
    rewards,
    masterKeyMode,
    setMasterKeyMode,
    customMasterKey,
    setCustomMasterKey,
    addTask,
    editTask,
    deleteTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    updateReward,
    deleteReward,
    addReward,
    remixRewards,
  };
}
