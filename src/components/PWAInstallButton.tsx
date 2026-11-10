import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback instructions modal for browsers where prompt hasn't triggered
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        aria-label="Install Cotton Nest App"
        title="Install Cotton Nest app on your home screen"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 ${
          variant === 'navbar'
            ? 'text-[#8C2E46] bg-[#FDEAF0] hover:bg-[#F9D3DE] border border-[#FAD1DC]'
            : 'text-white bg-[#8C2E46] hover:bg-[#732438]'
        } ${className}`}
      >
        <Download className="w-3.5 h-3.5 shrink-0 text-[#8C2E46]" />
        <span className="truncate">Install App</span>
      </button>

      {/* Installation Guide Modal (for iOS or browsers requiring manual install) */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2420]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-[#DEC89B] space-y-4 text-[#2C2420]">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FDEAF0] text-[#8C2E46] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#2C2420]">Install Cotton Nest</h3>
                  <p className="text-[10px] text-[#7A6458]">Add to your Home Screen for fast access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-[#7A6458] hover:text-[#2C2420] rounded-full hover:bg-[#FAF7F2] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs text-[#6B5D55]">
                <p className="font-medium text-[#2C2420]">To install on iPhone or iPad:</p>
                <ol className="list-decimal list-inside space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE2D5]">
                  <li>
                    Tap the <strong className="text-[#2C2420]">Share</strong> icon at the bottom of Safari.
                  </li>
                  <li>
                    Scroll down and select <strong className="text-[#8C2E46]">Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong className="text-[#2C2420]">Add</strong> in the top right corner.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-[#6B5D55]">
                <p className="font-medium text-[#2C2420]">To install on Android or Desktop:</p>
                <ol className="list-decimal list-inside space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE2D5]">
                  <li>Open your browser options menu (⋮ or ⋯).</li>
                  <li>Tap <strong className="text-[#8C2E46]">Add to Home Screen</strong> or <strong className="text-[#8C2E46]">Install App</strong>.</li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-[#2C2420] text-white text-xs font-semibold rounded-xl hover:bg-[#382D28] transition-colors shadow-2xs"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
