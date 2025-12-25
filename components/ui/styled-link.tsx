import Link, { LinkProps } from "next/link";
import { ReactNode, AnchorHTMLAttributes } from "react";

export interface StyledLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary" | "secondary" | "navigation" | "button";
}

/**
 * Styled Link component with consistent hover effects
 *
 * Automatically includes:
 * - transition-colors duration-300
 * - cursor-pointer
 * - Proper hover states based on variant
 */
export default function StyledLink({
  href,
  children,
  className = "",
  variant = "default",
  ...props
}: StyledLinkProps) {
  // Base styles - always applied
  const baseStyles = "transition-colors duration-300 cursor-pointer";

  // Variant-specific styles
  const variantStyles = {
    // Default link - subtle hover
    default: "hover:opacity-70",

    // Primary colored link - matches your theme primary
    primary: "hover:opacity-80",

    // Secondary/muted link
    secondary: "hover:opacity-70",

    // Navigation menu items
    navigation: "hover:bg-[var(--surface-hover)]",

    // Button-styled link
    button: "hover:opacity-90",
  };

  // Combine all styles
  const linkStyles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <Link href={href} className={linkStyles} {...props}>
      {children}
    </Link>
  );
}
