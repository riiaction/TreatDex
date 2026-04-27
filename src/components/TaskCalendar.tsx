import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  getDay,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "../utils";

interface TaskCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

export function TaskCalendar({
  selectedDate,
  onSelectDate,
}: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const endDate = monthEnd;

  const dateFormat = "MMMM yyyy";

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextYear = () => setCurrentMonth(addMonths(currentMonth, 12));
  const prevYear = () => setCurrentMonth(subMonths(currentMonth, 12));

  // Get days of the week starting from Monday
  const dayStartOffset = (getDay(monthStart) + 6) % 7;
  const blankDays = Array.from({ length: dayStartOffset }, (_, i) => i);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div classname="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 max-w-[280px] w-full mx-auto font-sans">
      <div classname="flex justify-between items-center mb-4 px-1">
        <div classname="flex gap-1 text-gray-500">
          <button type="button" onclick="{prevYear}" classname="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <chevronsleft size="{16}"/>
          </button>
          <button type="button" onclick="{prevMonth}" classname="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <chevronleft size="{16}"/>
          </button>
        </div>
        <div classname="font-bold text-[#4B6382] text-base">
          {format(currentMonth, dateFormat)}
        </div>
        <div classname="flex gap-1 text-gray-500">
          <button type="button" onclick="{nextMonth}" classname="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <chevronright size="{16}"/>
          </button>
          <button type="button" onclick="{nextYear}" classname="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <chevronsright size="{16}"/>
          </button>
        </div>
      </div>

      <div classname="grid grid-cols-7 gap-1 mb-1">
        {days.map((day, i) => (
          <div key="{day}" classname="text-center text-xs font-bold text-gray-900 pb-1">
            {day}
          </div>
        ))}
      </div>

      <div classname="grid grid-cols-7 gap-y-1 gap-x-1">
        {blankDays.map((_, i) => {
          const prevMonthEnd = endOfMonth(subMonths(monthStart, 1));
          const dateNum = prevMonthEnd.getDate() - blankDays.length + 1 + i;
          return (
            <div key="{`blank-${i}`}" classname="text-center p-1.5 text-xs text-[#A0AAB8] font-medium opacity-50">
              {dateNum}
            </div>
          );
        })}
        {monthDays.map((day) => {
          const isSelected = selectedDate
            ? isSameDay(day, selectedDate)
            : false;
          const isDayToday = isToday(day);
          return (
            <button type="button" key="{day.toString()}" onclick="{()" ==""> onSelectDate(isSelected ? null : day)}
              className={cn(
                "w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-xs font-medium transition-all group",
                isSelected
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : isDayToday
                  ? "bg-blue-50 text-blue-600 font-bold border border-blue-200"
                  : "text-[#4B6382] hover:bg-gray-100",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
