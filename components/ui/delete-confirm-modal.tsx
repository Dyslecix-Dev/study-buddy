interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, description, confirmText = "Delete", cancelText = "Cancel" }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-300 cursor-pointer">
            {cancelText}
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-300 cursor-pointer">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

