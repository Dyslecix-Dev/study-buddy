import { ReactNode, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  isIconOnly?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  iconPosition = "left",
  isIconOnly = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  // Size styles
  const sizeStyles = {
    sm: isIconOnly ? "p-1.5" : "px-3 py-1.5 text-sm",
    md: isIconOnly ? "p-2" : "px-4 py-2 text-sm",
    lg: isIconOnly ? "p-3" : "px-6 py-3 text-base",
  };

  // Variant styles
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    info: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]",
  };

  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";

  // Combine all styles
  const buttonStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${className}`;

  // Icon size based on button size
  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  // Render loading spinner
  const LoadingSpinner = () => (
    <Loader2 size={iconSize[size]} className="animate-spin" />
  );

  // Render icon
  const renderIcon = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (icon) {
      return <span className="inline-flex items-center">{icon}</span>;
    }
    return null;
  };

  return (
    <button
      className={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {iconPosition === "left" && renderIcon()}
      {!isIconOnly && children}
      {iconPosition === "right" && !isLoading && renderIcon()}
    </button>
  );
}
