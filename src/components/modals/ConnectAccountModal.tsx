import { X } from 'lucide-react';

interface Props {
  url: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectAccountModal({ url, isOpen, onClose }: Props) {
  if (!isOpen || !url) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-[2px]">
      <div className="flex-1 flex flex-col bg-white md:rounded-t-2xl md:m-4 md:mb-0 overflow-hidden md:shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-[15px] font-bold text-gray-900">Connect Account</h2>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1"
            >
              Open in new tab
            </a>
            <button
              id="btn-close-connect-modal"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <iframe
          src={url}
          title="Connect bank account"
          className="flex-1 w-full border-0"
          allow="payment; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
