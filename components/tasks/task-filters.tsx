"use client";

import { Filter } from "lucide-react";

interface TaskFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
}

export default function TaskFilters({ statusFilter, priorityFilter, onStatusChange, onPriorityChange }: TaskFiltersProps) {
  return (
    <div className="rounded-lg shadow p-4 mb-6" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Filter size={18} style={{ color: "var(--text-secondary)" }} />
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority-filter" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Priority
          </label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            <option value="all">All Priorities</option>
            <option value="2">High</option>
            <option value="1">Medium</option>
            <option value="0">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

