import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText?: string;
  variant?: "error" | "warning" | "info";
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  description,
  buttonText = "OK",
  variant = "info"
}: AlertModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const getButtonVariant = (): "danger" | "warning" | "primary" => {
    switch (variant) {
      case "error":
        return "danger";
      case "warning":
        return "warning";
      default:
        return "primary";
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 99999 }}>
      <div className="rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl relative" style={{ backgroundColor: "var(--surface)", zIndex: 100000 }}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
        <div className="flex justify-end">
          <Button onClick={onClose} variant={getButtonVariant()}>
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
