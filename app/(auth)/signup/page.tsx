"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a PNG, JPG, GIF, or WebP image.");
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File too large. Maximum size is 5MB.");
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const onSubmit = async (data: SignUpInput) => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) throw signUpError;

      // Create user in database
      if (authData.user) {
        let avatarUrl: string | undefined = undefined;

        // Upload avatar if provided
        if (avatarFile) {
          const formData = new FormData();
          formData.append("file", avatarFile);

          // Use public endpoint for signup (user is not authenticated yet)
          const uploadResponse = await fetch("/api/upload/avatar/public", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            avatarUrl = uploadData.url;
          } else {
            // Log error but don't fail signup
            console.error("Failed to upload avatar:", await uploadResponse.text());
          }
        }

        const response = await fetch("/api/auth/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: authData.user.id,
            email: authData.user.email,
            name: data.name,
            image: avatarUrl,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create user profile");
        }
      }

      // Show email verification message
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-5xl" style={{ color: "var(--primary)" }}>
              ✓
            </div>

            <h2 className="mt-6 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              Check your email
            </h2>

            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>

            <div className="mt-6">
              <Link href="/login" className="font-medium" style={{ color: "var(--primary)" }}>
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <Image src="/images/study-buddy.png" alt="Study Buddy logo" width={250} height={100} className="w-48 h-60" />
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Or{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--primary)" }}>
              sign in to your account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                Profile Picture (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    border: "2px solid var(--border)",
                  }}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl" style={{ color: "var(--text-muted)" }}>
                      👤
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" id="avatar-upload" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" onChange={handleAvatarChange} className="hidden" />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-block px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-300"
                    style={{
                      backgroundColor: "var(--surface-secondary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    Choose Image
                  </label>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                        // Reset the file input value to allow re-selecting the same file
                        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = '';
                        }
                      }}
                      className="ml-2 text-sm cursor-pointer"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Remove
                    </button>
                  )}
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    PNG, JPG, GIF or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Full name
              </label>
              <input
                {...register("name")}
                id="name"
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Email address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm pr-10"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Confirm password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm pr-10"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

