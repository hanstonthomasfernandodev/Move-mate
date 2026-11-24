import { Shield } from 'lucide-react';

export function PrivacyNotice() {
  return (
    <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-start gap-3">
      <Shield className="w-5 h-5 text-success mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-text-primary mb-1">Privacy First</p>
        <p className="text-sm text-text-secondary leading-relaxed">
          Camera processing happens locally in your browser. MoveMate does not record or upload your camera video.
          Session performance data is stored only in your browser's local storage.
        </p>
      </div>
    </div>
  );
}
