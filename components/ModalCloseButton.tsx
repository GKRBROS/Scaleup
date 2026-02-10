import { X } from "lucide-react";

export default function ModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute top-4 right-4 z-50 rounded-full bg-white/90 hover:bg-white shadow p-2 text-gray-900"
    >
      <X size={18} />
    </button>
  );
}
