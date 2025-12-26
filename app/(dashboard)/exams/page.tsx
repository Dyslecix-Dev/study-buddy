"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Plus, BookOpen, Edit, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ShareModal from "@/components/share/share-modal";

interface Exam {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  _count: {
    Question: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "",
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [examToShare, setExamToShare] = useState<{
    id: string;
    name: string;
    _count: { Question: number };
  } | null>(null);

  useEffect(() => {
    checkAuth();
    fetchExams();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams");
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter an exam name");
      return;
    }

    try {
      const url = editingExam ? `/api/exams/${editingExam.id}` : "/api/exams";
      const method = editingExam ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success(editingExam ? "Exam updated successfully" : "Exam created successfully");
        setShowForm(false);
        setEditingExam(null);
        setFormData({ name: "", description: "", color: "" });
        await fetchExams();
      } else {
        toast.error(responseData.error || "Failed to save exam");
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error("Failed to save exam");
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      description: exam.description || "",
      color: exam.color || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam? All questions will be deleted.")) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Exam deleted successfully");
        await fetchExams();
      } else {
        toast.error("Failed to delete exam");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam");
    }
  };

  const handleShare = (exam: Exam) => {
    setExamToShare(exam);
    setShareModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <DashboardNav />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Exams
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>Create and manage your practice exams</p>
          </div>
          <button
            onClick={() => {
              setEditingExam(null);
              setFormData({ name: "", description: "", color: "" });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer"
            style={{
              backgroundColor: showForm ? "var(--surface-secondary)" : "var(--primary)",
              color: showForm ? "var(--text-primary)" : "#1a1a1a",
            }}
          >
            <Plus size={20} />
            {showForm ? "Cancel" : "New Exam"}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-6 rounded-lg shadow" style={{ backgroundColor: "var(--surface)" }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              {editingExam ? "Edit Exam" : "Create New Exam"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="e.g., Midterm Exam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              <button type="submit" className="px-6 py-2 rounded-md font-medium cursor-pointer" style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}>
                {editingExam ? "Update Exam" : "Create Exam"}
              </button>
            </form>
          </div>
        )}

        {exams.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto mb-4" style={{ color: "var(--text-secondary)" }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              No exams yet
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>Create your first exam to start testing your knowledge</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <div key={exam.id} className="p-6 rounded-lg shadow hover:shadow-lg transition-shadow" style={{ backgroundColor: "var(--surface)" }}>
                <div className="flex justify-between items-start mb-4">
                  <Link href={`/exams/${exam.id}`} className="flex-1 transition-colors duration-300 cursor-pointer hover:opacity-80">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      {exam.name}
                    </h3>
                    {exam.description && (
                      <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                        {exam.description}
                      </p>
                    )}
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {exam._count.Question} question{exam._count.Question !== 1 ? "s" : ""}
                    </p>
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => handleShare(exam)} className="p-2 rounded hover:bg-opacity-10" style={{ color: "var(--text-secondary)" }} title="Share exam">
                      <Share2 size={18} />
                    </button>
                    <button onClick={() => handleEdit(exam)} className="p-2 rounded hover:bg-opacity-10" style={{ color: "var(--text-secondary)" }}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(exam.id)} className="p-2 rounded hover:bg-opacity-10" style={{ color: "#ef4444" }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <Link href={`/exams/${exam.id}`} className="block w-full text-center px-4 py-2 rounded-md transition-colors duration-300 cursor-pointer hover:opacity-90" style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}>
                  View Exam
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {shareModalOpen && examToShare && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setExamToShare(null);
          }}
          contentType="exam"
          contentId={examToShare.id}
          contentName={examToShare.name}
          itemCount={examToShare._count.Question}
        />
      )}
    </div>
  );
}

