"use client";

import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: number;
  completed: boolean;
  order: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
}

interface CalendarViewProps {
  tasks: Task[];
  onSelectEvent: (task: Task) => void;
}

export default function CalendarView({ tasks, onSelectEvent }: CalendarViewProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  // Convert tasks to calendar events
  const events: CalendarEvent[] = tasks
    .filter((task) => task.dueDate) // Only tasks with due dates
    .map((task) => ({
      id: task.id,
      title: task.title,
      start: new Date(task.dueDate!),
      end: new Date(task.dueDate!),
      resource: task,
    }));

  // Style events based on priority and completion status
  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    let backgroundColor = "#3b82f6"; // Default blue
    let opacity = task.completed ? 0.5 : 1;

    // Color by priority
    if (task.priority === 2) {
      backgroundColor = "#ef4444"; // High - red
    } else if (task.priority === 1) {
      backgroundColor = "#f59e0b"; // Medium - yellow/orange
    } else {
      backgroundColor = "#6b7280"; // Low - gray
    }

    return {
      style: {
        backgroundColor,
        opacity,
        borderRadius: "4px",
        border: "none",
        color: "white",
        fontSize: "0.875rem",
        textDecoration: task.completed ? "line-through" : "none",
      },
    };
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 10px 6px;
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
        }
        .rbc-today {
          background-color: #dbeafe;
        }
        .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        .rbc-event {
          padding: 2px 5px;
        }
        .rbc-event:focus {
          outline: 2px solid #3b82f6;
        }
        .rbc-toolbar {
          padding: 10px 0;
          margin-bottom: 10px;
        }
        .rbc-toolbar button {
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 6px 12px;
          background-color: white;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover {
          background-color: #f3f4f6;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .rbc-month-view,
        .rbc-time-view,
        .rbc-agenda-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        onSelectEvent={(event) => onSelectEvent(event.resource)}
        eventPropGetter={eventStyleGetter}
        views={["month", "week", "day", "agenda"]}
        popup
      />
    </div>
  );
}

