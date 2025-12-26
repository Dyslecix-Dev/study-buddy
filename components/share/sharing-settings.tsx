"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock, Share2, Inbox, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "../ui/button";
import { formatDistanceToNow } from "date-fns";

interface ShareRequest {
  id: string;
  senderId: string;
  recipientEmail: string;
  recipientId: string | null;
  contentType: string;
  contentId: string;
  contentName: string;
  status: string;
  itemCount: number;
  createdAt: string;
  respondedAt: string | null;
  Sender?: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
  Recipient?: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
}

export default function SharingSettings() {
  const [received, setReceived] = useState<ShareRequest[]>([]);
  const [sent, setSent] = useState<ShareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchShareRequests();
  }, []);

  const fetchShareRequests = async () => {
    try {
      const response = await fetch("/api/share");
      if (response.ok) {
        const data = await response.json();
        setReceived(data.received || []);
        setSent(data.sent || []);
      }
    } catch (error) {
      console.error("Error fetching share requests:", error);
      toast.error("Failed to load share requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: "accept" | "reject" | "cancel") => {
    setProcessingIds((prev) => new Set(prev).add(requestId));

    try {
      const response = await fetch(`/api/share/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action}`);
      }

      toast.success(
        action === "accept"
          ? "Content successfully added to your account!"
          : action === "reject"
          ? "Share request rejected"
          : "Share request cancelled"
      );

      // Refresh the lists
      await fetchShareRequests();
    } catch (error) {
      console.error(`Error ${action}ing share request:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${action}`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleDelete = async (requestId: string) => {
    setProcessingIds((prev) => new Set(prev).add(requestId));

    try {
      const response = await fetch(`/api/share/${requestId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Share request deleted");
      await fetchShareRequests();
    } catch (error) {
      console.error("Error deleting share request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: "var(--quaternary)", text: "#1a1a1a" },
      accepted: { bg: "var(--secondary)", text: "#ffffff" },
      rejected: { bg: "#ef4444", text: "#ffffff" },
      cancelled: { bg: "var(--text-muted)", text: "#ffffff" },
    };

    const style = styles[status as keyof typeof styles] || styles.pending;

    return (
      <span
        className="px-2 py-1 rounded text-xs font-medium"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const pendingReceived = received.filter((r) => r.status === "pending");
  const historyReceived = received.filter((r) => r.status !== "pending");
  const pendingSent = sent.filter((s) => s.status === "pending");
  const historySent = sent.filter((s) => s.status !== "pending");

  if (loading) {
    return (
      <div className="text-center py-12">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
          style={{ color: "var(--primary)" }}
        />
        <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading sharing data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Incoming Shares */}
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: "var(--surface)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Inbox size={20} style={{ color: "var(--primary)" }} />
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Pending Shares
          </h2>
          {pendingReceived.length > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}
            >
              {pendingReceived.length}
            </span>
          )}
        </div>

        {pendingReceived.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
            No pending share requests
          </p>
        ) : (
          <div className="space-y-3">
            {pendingReceived.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-lg border"
                style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {request.contentName}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {request.contentType.charAt(0).toUpperCase() + request.contentType.slice(1)} • {request.itemCount}{" "}
                      {request.contentType === "folder"
                        ? "notes"
                        : request.contentType === "deck"
                        ? "flashcards"
                        : "questions"}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                  From {request.Sender?.email} •{" "}
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAction(request.id, "accept")}
                    variant="primary"
                    icon={<Check size={16} />}
                    iconPosition="left"
                    isLoading={processingIds.has(request.id)}
                    disabled={processingIds.has(request.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleAction(request.id, "reject")}
                    variant="danger"
                    icon={<X size={16} />}
                    iconPosition="left"
                    disabled={processingIds.has(request.id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Pending Shares */}
      {pendingSent.length > 0 && (
        <div className="rounded-lg shadow p-6" style={{ backgroundColor: "var(--surface)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} style={{ color: "var(--quaternary)" }} />
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Awaiting Response
            </h2>
          </div>

          <div className="space-y-3">
            {pendingSent.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-lg border flex justify-between items-start"
                style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}
              >
                <div className="flex-1">
                  <h3 className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {request.contentName}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Shared with {request.recipientEmail}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  onClick={() => handleAction(request.id, "cancel")}
                  variant="secondary"
                  disabled={processingIds.has(request.id)}
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sharing History */}
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: "var(--surface)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Share2 size={20} style={{ color: "var(--text-secondary)" }} />
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Sharing History
          </h2>
        </div>

        <div className="space-y-4">
          {/* Received History */}
          {historyReceived.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Received
              </h3>
              <div className="space-y-2">
                {historyReceived.map((request) => (
                  <div
                    key={request.id}
                    className="p-3 rounded border flex justify-between items-center"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {request.contentName}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        From {request.Sender?.email} •{" "}
                        {formatDistanceToNow(new Date(request.respondedAt || request.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      <button
                        onClick={() => handleDelete(request.id)}
                        disabled={processingIds.has(request.id)}
                        className="p-1 rounded hover:bg-opacity-10 transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent History */}
          {historySent.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Sent
              </h3>
              <div className="space-y-2">
                {historySent.map((request) => (
                  <div
                    key={request.id}
                    className="p-3 rounded border flex justify-between items-center"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {request.contentName}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        To {request.recipientEmail} •{" "}
                        {formatDistanceToNow(new Date(request.respondedAt || request.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      <button
                        onClick={() => handleDelete(request.id)}
                        disabled={processingIds.has(request.id)}
                        className="p-1 rounded hover:bg-opacity-10 transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {historyReceived.length === 0 && historySent.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
              No sharing history yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
