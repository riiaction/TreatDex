import React, { useState, useEffect, useRef } from "react";
import { Calendar, Plus, X, Tag } from "lucide-react";
import { cn, INSPO_COLORS, getTagColor, getTagText } from "../utils";
import { format, isSameYear } from "date-fns";
import { Task, CustomTag } from "../types";
import { TaskCalendar } from "./TaskCalendar";

interface TaskInputModalProps {
  isOpen: boolean;
  initialTask?: Task | null;
  onClose: () => void;
  onSave: (
    title: string,
    deadline: string | null,
    subtasks: string[],
    tags: (string | CustomTag)[],
  ) => void;
}

export function TaskInputModal({
  isOpen,
  initialTask,
  onClose,
  onSave,
}: TaskInputModalProps) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [tags, setTags] = useState<(string | CustomTag)[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(INSPO_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDeadline(
          initialTask.deadline ? new Date(initialTask.deadline) : null,
        );
        setSubtasks(initialTask.subtasks.map((st) => st.title));
        setTags(initialTask.tags || []);
      } else {
        setTitle("");
        setDeadline(null);
        setSubtasks([]);
        setTags([]);
      }
      setTagInput("");
      setShowColorPicker(false);
      setEditingTagIndex(null);
      setShowCalendar(false);
    }
  }, [isOpen, initialTask]);

  if (!isOpen) return null;

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const addSubtaskField = () => setSubtasks([...subtasks, ""]);

  const handleAddTagKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTagText = tagInput.trim();
      if (newTagText) {
        if (!tags.some((t) => getTagText(t) === newTagText)) {
          setTags([...tags, { text: newTagText, color: selectedColor }]);
        }
        setTagInput("");
        setShowColorPicker(false);
      }
    }
  };

  const removeTag = (tagToRemove: string | CustomTag) => {
    setTags(tags.filter((t) => getTagText(t) !== getTagText(tagToRemove)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(
      title,
      deadline ? deadline.toISOString() : null,
      subtasks.filter((st) => st.trim() !== ""),
      tags,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl my-auto relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {initialTask ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 relative" ref={calendarRef}>
            <div className="flex items-center w-full border-2 border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)] rounded-lg overflow-hidden transition-all bg-white relative">
              <input 
                type="text" 
                placeholder="Name your mission" 
                autoFocus 
                className="flex-1 text-lg placeholder-gray-400 border-none focus:ring-0 px-4 py-3 bg-transparent" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowCalendar(!showCalendar)}
                className="px-4 text-gray-500 hover:text-red-500 transition-colors border-l border-gray-100 h-full py-4 flex items-center justify-center"
              >
                <Calendar size={20}/>
              </button>
            </div>

            {showCalendar && (
              <div className="absolute right-0 top-[3.5rem] mt-1 z-[60] origin-top-right">
                <TaskCalendar 
                  selectedDate={deadline} 
                  onSelectDate={(d) => {
                    setDeadline(d);
                    setShowCalendar(false);
                  }}
                />
              </div>
            )}

            {deadline && (
              <div className="flex items-center gap-2 pl-1 mb-1">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                  <Calendar size={14} className="text-red-500"/>
                  <span className="text-sm font-semibold text-gray-600">
                    {isSameYear(deadline, new Date())
                      ? format(deadline, "MMM d")
                      : format(deadline, "MMM d, yyyy")}
                  </span>
                  <button type="button" onClick={() => setDeadline(null)} className="ml-2 text-gray-400 hover:text-red-500">
                    <X size={14}/>
                  </button>
                </div>
              </div>
            )}

            {subtasks.length === 0 && (
              <button type="button" onClick={addSubtaskField} className="flex items-center text-sm font-medium text-red-500 px-2 py-2 hover:bg-red-50 rounded-lg transition-colors mt-1">
                <Plus size={16} className="mr-1"/> Add Sub-task
              </button>
            )}
          </div>

          {subtasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sub-tasks</h3>
              {subtasks.map((st, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200"/>
                  {/* FIX 3: font-size set to 16px to prevent iOS auto-zoom on subtask input */}
                  <input 
                    type="text" 
                    placeholder={i === 0 ? "Break it down" : ""} 
                    className="w-full placeholder-gray-400 border-none focus:ring-0 p-2 bg-gray-50 rounded-lg" 
                    style={{ fontSize: '16px' }}
                    value={st} 
                    onChange={(e) => handleSubtaskChange(i, e.target.value)}
                  />
                  <button type="button" onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="p-1 text-gray-400 hover:text-red-500">
                    <X size={16}/>
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSubtaskField} className="text-xs font-bold text-gray-500 flex items-center mt-2 hover:text-gray-800 transition-colors pl-8">
                <Plus size={14} className="mr-1"/> Add
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-start space-x-3 text-gray-600 bg-gray-50 p-3 rounded-xl min-h-[50px]">
              <Tag size={20} className="text-red-500 flex-shrink-0 mt-1"/>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 items-center">
                  {tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className={cn(
                        "text-white px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer transition-transform",
                        editingTagIndex === i ? "ring-2 ring-gray-900 ring-offset-1 scale-105" : "hover:scale-105"
                      )} 
                      style={{ backgroundColor: getTagColor(tag) }} 
                      onClick={() => {
                        setEditingTagIndex(i);
                        setSelectedColor(getTagColor(tag));
                        setShowColorPicker(true);
                      }}
                    >
                      {getTagText(tag)}
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="text-white/80 hover:text-white ml-1">
                        <X size={12}/>
                      </button>
                    </span>
                  ))}
                  {/* FIX 3: font-size set to 16px to prevent iOS auto-zoom on tag input */}
                  <input 
                    type="text" 
                    placeholder={tags.length === 0 ? "Add tag" : ""} 
                    className="bg-transparent border-none focus:ring-0 font-medium w-[150px] flex-1 min-w-[100px] p-0"
                    style={{ fontSize: '16px' }}
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)}
                    onFocus={() => {
                      setShowColorPicker(true);
                      setEditingTagIndex(null);
                      setSelectedColor(INSPO_COLORS[0]);
                    }}
                    onKeyDown={handleAddTagKey}
                  />
                </div>
                {showColorPicker && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs font-bold text-gray-400 self-center mr-2">Color:</span>
                    {INSPO_COLORS.map((color) => (
                      <button 
                        key={color} 
                        type="button" 
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-transform",
                          selectedColor === color ? "border-gray-800 scale-110" : "border-transparent hover:scale-110"
                        )} 
                        style={{ backgroundColor: color }} 
                        onClick={() => {
                          setSelectedColor(color);
                          if (editingTagIndex !== null) {
                            const newTags = [...tags];
                            const tag = newTags[editingTagIndex];
                            newTags[editingTagIndex] = { text: getTagText(tag), color };
                            setTags(newTags);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 rounded-xl mt-6 transition-all shadow-md shadow-red-500/20 active:scale-[0.98]">
            {initialTask ? "Save Changes" : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
