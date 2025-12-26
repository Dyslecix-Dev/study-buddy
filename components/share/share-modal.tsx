"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "../ui/button";
import { X, Plus, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: "folder" | "deck" | "exam";
  contentId: string;
  contentName: string;
  itemCount: number;
}

export default function ShareModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentName,
  itemCount,
}: ShareModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [emails, setEmails] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep("input");
      setEmails([""]);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  const removeEmailField = (index: number) => {
    if (emails.length === 1) return; // Keep at least one field
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleNext = () => {
    // Validate emails
    const validEmails = emails.filter((email) => email.trim() !== "");

    if (validEmails.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of validEmails) {
      if (!emailRegex.test(email)) {
        toast.error(`Invalid email format: ${email}`);
        return;
      }
    }

    setStep("confirm");
  };

  const handleBack = () => {
    setStep("input");
  };

  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      const validEmails = emails.filter((email) => email.trim() !== "");

      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmails: validEmails,
          contentType,
          contentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to share");
      }

      // Show results
      const successCount = data.results?.length || 0;
      const errorCount = data.errors?.length || 0;

      if (successCount > 0) {
        toast.success(`Successfully shared with ${successCount} ${successCount === 1 ? "person" : "people"}`);
      }

      // Show individual errors
      if (data.errors && data.errors.length > 0) {
        for (const error of data.errors) {
          toast.error(`${error.email}: ${error.error}`);
        }
      }

      if (successCount > 0) {
        onClose();
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to share");
    } finally {
      setIsLoading(false);
    }
  };

  const getItemTypeLabel = () => {
    switch (contentType) {
      case "folder":
        return "notes";
      case "deck":
        return "flashcards";
      case "exam":
        return "questions";
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl relative"
        style={{ backgroundColor: "var(--surface)", zIndex: 100000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Share2 size={20} />
            Share {contentType}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-opacity-10 transition-colors"
            style={{ color: "var(--text-secondary)", backgroundColor: "transparent" }}
          >
            <X size={20} />
          </button>
        </div>

        {step === "input" && (
          <>
            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                Enter the email addresses of users you want to share with. They will need to approve before receiving
                the content.
              </p>
            </div>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="user@example.com"
                    className="flex-1 px-3 py-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: "var(--surface-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  {emails.length > 1 && (
                    <button
                      onClick={() => removeEmailField(index)}
                      className="p-2 rounded hover:bg-opacity-10 transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addEmailField}
              className="flex items-center gap-2 text-sm mb-4 px-3 py-2 rounded transition-all"
              style={{ color: "var(--primary)" }}
            >
              <Plus size={16} />
              Add recipient
            </button>

            <div className="flex justify-end space-x-3">
              <Button onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleNext} variant="primary">
                Next
              </Button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: "var(--surface-secondary)" }}>
              <h4 className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                You are about to share:
              </h4>
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {contentType.charAt(0).toUpperCase() + contentType.slice(1)}:
                </span>{" "}
                {contentName}
              </p>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  Contains:
                </span>{" "}
                {itemCount} {getItemTypeLabel()}
              </p>

              <h4 className="font-medium mb-2 mt-4" style={{ color: "var(--text-primary)" }}>
                With:
              </h4>
              <ul className="space-y-1">
                {emails
                  .filter((email) => email.trim() !== "")
                  .map((email, index) => (
                    <li key={index} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      • {email}
                    </li>
                  ))}
              </ul>
            </div>

            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Recipients will receive a notification and must approve before the content is added to their account.
            </p>

            <div className="flex justify-end space-x-3">
              <Button onClick={handleBack} variant="secondary" disabled={isLoading}>
                Back
              </Button>
              <Button onClick={handleConfirm} variant="primary" isLoading={isLoading}>
                Confirm & Share
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
