import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Onboarding } from './components/Onboarding';
import { Home } from './pages/Home';
import { Activities } from './pages/Activities';
import { CameraSetup } from './pages/CameraSetup';
import { GameScreen } from './pages/GameScreen';
import { Results } from './pages/Results';
import { Progress } from './pages/Progress';
import { About } from './pages/About';
import { storageService } from './services/storageService';

function App() {
  const [onboarded, setOnboarded] = useState(storageService.isOnboarded());

  return (
    <BrowserRouter>
      {!onboarded && <Onboarding onComplete={() => setOnboarded(true)} />}
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/setup/:activityType" element={<CameraSetup />} />
          <Route path="/play/:activityType" element={<GameScreen />} />
          <Route path="/results/:activityType" element={<Results />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
