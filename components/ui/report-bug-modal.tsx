"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const bugReportSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

type BugReportFormData = z.infer<typeof bugReportSchema>;

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string | null;
}

export default function ReportBugModal({ isOpen, onClose, userEmail, userName }: ReportBugModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BugReportFormData>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      severity: "medium",
    },
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen || !mounted) return null;

  const onSubmit = async (data: BugReportFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/report-bug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userEmail,
          userName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit bug report");
      }

      toast.success("Bug report submitted successfully! Thank you for your feedback.");
      onClose();
      reset();
    } catch (error) {
      console.error("Error submitting bug report:", error);
      toast.error("Failed to submit bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 99999 }} onClick={handleBackdropClick}>
      <div className="rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl relative" style={{ backgroundColor: "var(--surface)", zIndex: 100000 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Report Bug
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
              Bug Title
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              placeholder="Brief description of the issue"
              className="w-full px-3 py-2 rounded-md text-sm"
              style={{
                backgroundColor: "var(--surface-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
              disabled={isSubmitting}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Severity */}
          <div>
            <label htmlFor="severity" className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
              Severity
            </label>
            <select
              id="severity"
              {...register("severity")}
              className="w-full px-3 py-2 rounded-md text-sm cursor-pointer"
              style={{
                backgroundColor: "var(--surface-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
              disabled={isSubmitting}
            >
              <option value="low">Low - Minor inconvenience</option>
              <option value="medium">Medium - Moderate impact</option>
              <option value="high">High - Major functionality affected</option>
              <option value="critical">Critical - App unusable</option>
            </select>
            {errors.severity && <p className="text-xs text-red-500 mt-1">{errors.severity.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Please describe what happened, what you expected to happen, and steps to reproduce..."
              rows={5}
              className="w-full px-3 py-2 rounded-md text-sm resize-none"
              style={{
                backgroundColor: "var(--surface-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 cursor-pointer"
              style={{
                color: "var(--text-primary)",
                backgroundColor: "var(--surface-secondary)",
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-secondary)")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 cursor-pointer"
              style={{
                backgroundColor: "var(--primary)",
                color: "#1a1a1a",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

