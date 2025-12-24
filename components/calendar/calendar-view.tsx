"use client";

import { Calendar, dateFnsLocalizer, View, Components } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { Tag } from "@/lib/tag-utils";
import TagBadge from "@/components/tags/tag-badge";

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
  startTime: Date | null;
  endTime: Date | null;
  priority: number;
  completed: boolean;
  order: number;
  Tag?: Tag[];
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
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

export default function CalendarView({ tasks, onSelectEvent, onSelectSlot }: CalendarViewProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  // Convert tasks to calendar events
  const events: CalendarEvent[] = tasks
    .filter((task) => task.dueDate || task.startTime) // Tasks with due dates or start times
    .map((task) => {
      // If task has startTime and endTime, use those
      if (task.startTime && task.endTime) {
        return {
          id: task.id,
          title: task.title,
          start: new Date(task.startTime),
          end: new Date(task.endTime),
          resource: task,
        };
      }
      // If task has only startTime, use it for both start and end
      if (task.startTime) {
        return {
          id: task.id,
          title: task.title,
          start: new Date(task.startTime),
          end: new Date(task.startTime),
          resource: task,
        };
      }
      // Fallback to dueDate
      return {
        id: task.id,
        title: task.title,
        start: new Date(task.dueDate!),
        end: new Date(task.dueDate!),
        resource: task,
      };
    });

  // Custom event component to show tags
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const task = event.resource;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-xs">{event.title}</span>
        {task.Tag && task.Tag.length > 0 && (
          <div className="flex flex-wrap gap-0.5">
            {task.Tag.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="inline-block px-1 py-0.5 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: tag.color || "#6b7280",
                  color: "white",
                  opacity: 0.9,
                }}
              >
                {tag.name}
              </span>
            ))}
            {task.Tag.length > 2 && <span className="text-[10px]">+{task.Tag.length - 2}</span>}
          </div>
        )}
      </div>
    );
  };

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
      backgroundColor = "#10b981"; // Low - green (different from completed gray)
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
    <div className="rounded-lg shadow p-4" style={{ backgroundColor: 'var(--surface)' }}>
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 10px 6px;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
          background-color: var(--surface);
        }
        .rbc-month-row {
          background-color: var(--background);
        }
        .rbc-day-bg {
          background-color: var(--background);
        }
        .rbc-date-cell {
          color: var(--text-primary);
        }
        .rbc-today {
          background-color: var(--primary-light);
        }
        .rbc-off-range {
          color: var(--text-tertiary);
        }
        .rbc-off-range-bg {
          background-color: var(--surface);
        }
        .rbc-event {
          padding: 2px 5px;
        }
        .rbc-event:focus {
          outline: 2px solid var(--primary);
        }
        .rbc-toolbar {
          padding: 10px 0;
          margin-bottom: 10px;
        }
        .rbc-toolbar button {
          color: var(--text-primary);
          border: 1px solid var(--border);
          padding: 6px 12px;
          background-color: var(--surface);
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover {
          background-color: var(--surface-hover);
        }
        .rbc-toolbar button.rbc-active {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .rbc-toolbar-label {
          color: var(--text-primary);
        }
        .rbc-month-view,
        .rbc-time-view,
        .rbc-agenda-view {
          border: 1px solid var(--border);
          border-radius: 8px;
          background-color: var(--background);
        }
        .rbc-time-header-content {
          border-left: 1px solid var(--border);
        }
        .rbc-time-content {
          border-top: 1px solid var(--border);
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid var(--border);
        }
        .rbc-time-slot {
          color: var(--text-secondary);
        }
        .rbc-label {
          color: var(--text-secondary);
        }
        .rbc-agenda-view table.rbc-agenda-table {
          border: 1px solid var(--border);
        }
        .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
          color: var(--text-primary);
        }
        .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
          color: var(--text-primary);
          border-bottom: 1px solid var(--border);
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
        onSelectSlot={onSelectSlot ? (slotInfo) => onSelectSlot({ start: slotInfo.start, end: slotInfo.end }) : undefined}
        eventPropGetter={eventStyleGetter}
        views={["month", "week", "day", "agenda"]}
        components={{
          event: EventComponent,
        }}
        selectable={!!onSelectSlot}
        popup
      />
    </div>
  );
}

