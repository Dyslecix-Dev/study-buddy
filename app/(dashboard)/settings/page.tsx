"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { getUserInitials, isDefaultAvatar } from "@/lib/avatar-utils";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      router.push("/login");
      return;
    }

    // Fetch user data
    const response = await fetch(`/api/users/${authUser.id}`);
    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
    }
    setLoading(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (PNG, JPG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload avatar');
      }

      const data = await response.json();

      // Update local user state
      setUser(prev => prev ? { ...prev, image: data.url } : null);
      toast.success('Avatar updated successfully!');

    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <DashboardNav />
        <LoadingSpinner message="Loading settings..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = getUserInitials(user.name, user.email);
  const hasDefaultAvatar = isDefaultAvatar(user.image);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
          Settings
        </h1>

        <div className="rounded-lg shadow p-6 mb-6" style={{ backgroundColor: "var(--surface)" }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Profile
          </h2>

          {/* Avatar Upload */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="relative w-32 h-32 rounded-full overflow-hidden group">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User avatar"}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl font-bold"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "#1a1a1a",
                    }}
                  >
                    {initials}
                  </div>
                )}

                {/* Overlay on hover */}
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <Camera className="text-white" size={32} />
                </div>
              </div>

              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                Profile Photo
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                {hasDefaultAvatar
                  ? "Add a profile photo to personalize your account"
                  : "Update your profile photo"}
              </p>
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "#1a1a1a",
                }}
              >
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                PNG, JPG, GIF or WebP. Max 5MB.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Name
                </label>
                <input
                  type="text"
                  value={user.name || ''}
                  disabled
                  className="w-full px-3 py-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                    cursor: "not-allowed",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                    cursor: "not-allowed",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
