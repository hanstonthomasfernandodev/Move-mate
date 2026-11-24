import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, BarChart3, TrendingUp, Shield, Sparkles, Hand } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PrivacyNotice } from '../components/PrivacyNotice';

export function Home() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Motor Training
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Build Better Movement Skills{' '}
            <span className="text-primary">Through Play</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            MoveMate uses your laptop camera to create simple interactive activities 
            that help practice hand-eye coordination, movement accuracy, and motor planning.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/activities">
              <Button size="lg">
                Start Training
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/activities">
              <Button variant="outline" size="lg">
                Explore Activities
              </Button>
            </Link>
          </div>
          
          {/* Hand visualization */}
          <div className="mt-16 relative">
            <div className="w-32 h-32 mx-auto bg-primary/5 rounded-full flex items-center justify-center">
              <Hand className="w-16 h-16 text-primary/40" />
            </div>
            <div className="absolute top-8 right-1/2 translate-x-16 w-6 h-6 bg-success rounded-full border-2 border-white shadow-lg" />
            <div className="absolute top-16 left-1/2 -translate-x-16 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
            <div className="absolute bottom-8 right-1/2 translate-x-10 w-5 h-5 bg-accent rounded-full border-2 border-white shadow-lg" />
          </div>
        </div>
      </section>
      
      {/* Feature Cards */}
      <section className="py-16 px-4 bg-white border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center" padding="lg">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Practice</h3>
              <p className="text-text-secondary">
                Interactive movement activities that make training fun and engaging.
              </p>
            </Card>
            
            <Card className="text-center" padding="lg">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Measure</h3>
              <p className="text-text-secondary">
                Track accuracy, reaction time, errors, and overall coordination.
              </p>
            </Card>
            
            <Card className="text-center" padding="lg">
              <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Progress</h3>
              <p className="text-text-secondary">
                See improvement across sessions with detailed progress tracking.
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: 1, title: 'Camera detects hand', desc: 'Your laptop camera captures hand movement' },
              { step: 2, title: 'AI identifies fingertip', desc: 'MediaPipe tracks your index fingertip' },
              { step: 3, title: 'Activity responds', desc: 'Interactive games respond to your movement' },
              { step: 4, title: 'Measures performance', desc: 'System tracks accuracy and coordination' },
              { step: 5, title: 'Track progress', desc: 'See your improvement over time' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                  {item.step}
                </div>
                <h4 className="font-semibold text-text-primary text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Why MoveMate */}
      <section className="py-16 px-4 bg-white border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-8">Why MoveMate?</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'No special hardware required',
              'Works with a laptop camera',
              'Simple to access and use',
              'Interactive training activities',
              'Quantifiable performance metrics',
              'Personalized difficulty levels',
              'Privacy-conscious design',
              'Progress tracking dashboard',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-success text-sm">✓</span>
                </div>
                <span className="text-text-primary text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Privacy */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-success" />
            <h2 className="text-2xl font-bold text-text-primary">Privacy First</h2>
          </div>
          <PrivacyNotice />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-border text-center">
        <p className="text-sm text-text-secondary">
          MoveMate — A motor coordination training platform powered by computer vision.
        </p>
        <p className="text-xs text-text-secondary mt-2">
          This is a training and performance-assessment aid. It is not a medical diagnostic system.
        </p>
      </footer>
    </div>
  );
}
