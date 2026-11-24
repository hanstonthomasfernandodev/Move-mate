import { useState } from 'react';
import { Shield, Camera, Trash2, Info, Hand, Target, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { storageService } from '../services/storageService';
import { PrivacyNotice } from '../components/PrivacyNotice';

export function About() {
  const [showClearModal, setShowClearModal] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearData = () => {
    storageService.clearAllSessions();
    setShowClearModal(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="flex-1 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">About MoveMate</h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            An interactive motor coordination training experience powered by computer vision.
          </p>
        </div>

        {/* What is MoveMate */}
        <Card className="mb-6" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">What is MoveMate?</h2>
          </div>
          <p className="text-text-secondary leading-relaxed mb-4">
            MoveMate is a <strong className="text-text-primary">motor coordination training</strong> and 
            <strong className="text-text-primary"> performance assessment</strong> platform designed to help 
            children practice essential movement skills through interactive activities.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Using your laptop's built-in camera and AI-powered hand tracking, MoveMate creates engaging 
            activities that help practice hand-eye coordination, movement accuracy, reaction time, and 
            motor planning — all from a standard web browser.
          </p>
        </Card>

        {/* How it works */}
        <Card className="mb-6" padding="lg">
          <h2 className="text-xl font-bold text-text-primary mb-4">How It Works</h2>
          <div className="space-y-4">
            {[
              { icon: Camera, title: 'Camera Detection', desc: 'Your laptop camera captures hand movement in real-time using AI-powered MediaPipe technology.' },
              { icon: Hand, title: 'Fingertip Tracking', desc: 'The system identifies your index fingertip position and maps it to interactive activities.' },
              { icon: Target, title: 'Interactive Activities', desc: 'Respond to targets, follow paths, complete sequences, and catch moving objects.' },
              { icon: TrendingUp, title: 'Performance Measurement', desc: 'Track accuracy, reaction time, movement smoothness, and overall coordination scores.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-surface-darker rounded-lg flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-sm">{item.title}</h3>
                  <p className="text-text-secondary text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy */}
        <Card className="mb-6" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Privacy & Data</h2>
          </div>
          
          <div className="space-y-3 mb-6">
            {[
              { icon: '📹', text: 'Camera is used only for real-time hand tracking during activities' },
              { icon: '🚫', text: 'Camera video is never recorded, saved, or uploaded' },
              { icon: '🔒', text: 'All processing happens locally in your browser' },
              { icon: '📊', text: 'Performance data (scores, accuracy) may be stored in your browser\'s local storage' },
              { icon: '👤', text: 'No personal information is collected — no accounts, no emails, no names' },
              { icon: '🗑️', text: 'You can clear all stored data at any time using the button below' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg">{item.icon}</span>
                <p className="text-text-secondary text-sm">{item.text}</p>
              </div>
            ))}
          </div>
          
          <PrivacyNotice />
          
          <div className="mt-6">
            <Button
              variant="danger"
              onClick={() => setShowClearModal(true)}
            >
              <Trash2 className="w-4 h-4" />
              Clear My Data
            </Button>
            {cleared && (
              <p className="text-success text-sm mt-2 font-medium">✓ All data has been cleared.</p>
            )}
          </div>
        </Card>

        {/* Important Notice */}
        <Card className="mb-6 bg-warning/5 border-warning/20" padding="lg">
          <h2 className="text-lg font-bold text-text-primary mb-3">Important Notice</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            MoveMate is a <strong className="text-text-primary">training and performance-assessment aid</strong>. 
            It is <strong className="text-text-primary">not a medical diagnostic system</strong>. MoveMate does 
            not diagnose, treat, or assess any medical condition, including autism, ADHD, or neurological disorders.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed mt-3">
            All scores and metrics are intended for movement practice tracking and should not be used as clinical measurements.
          </p>
        </Card>

        {/* Technology */}
        <Card className="mb-6" padding="lg">
          <h2 className="text-xl font-bold text-text-primary mb-4">Technology</h2>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'MediaPipe', 'Recharts', 'Canvas API'].map(tech => (
              <span
                key={tech}
                className="px-3 py-1.5 bg-surface-darker text-text-secondary text-sm rounded-full font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 text-text-secondary text-sm">
          <p>MoveMate — Move. Practice. Improve.</p>
          <p className="mt-1 text-xs">
            Built with ❤️ for helping children develop movement skills.
          </p>
        </div>

        {/* Clear Modal */}
        <Modal
          open={showClearModal}
          onClose={() => setShowClearModal(false)}
          title="Clear All Data"
        >
          <p className="text-text-secondary mb-6">
            This will permanently delete all your session history and progress data. 
            This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearData}>
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
