import { useState } from 'react';
import { GamePage } from './components/GamePage';
import { SongSelect } from './components/SongSelect';
import { SongDetail } from './components/SongDetail';
import { ResultPage } from './components/ResultPage';
import { LandingPage } from './components/LandingPage';
import { ModeSelectPage } from './components/ModeSelectPage';
import { EditorPage } from './components/EditorPage';
import type { Song } from './types/game';

type Screen = 'LANDING' | 'MODE_SELECT' | 'EDITOR' | 'SELECT' | 'DETAIL' | 'GAME' | 'RESULT';

function App() {
  const [screen, setScreen] = useState<Screen>('LANDING');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setScreen('DETAIL');
  };

  return (
    <div className="w-full h-full bg-black overflow-hidden">
      {screen === 'LANDING' && (
        <LandingPage onSkip={() => setScreen('MODE_SELECT')} />
      )}

      {screen === 'MODE_SELECT' && (
        <ModeSelectPage
          onSelectGame={() => setScreen('SELECT')}
          onSelectEditor={() => setScreen('EDITOR')}
        />
      )}

      {screen === 'EDITOR' && (
        <EditorPage onBack={() => setScreen('MODE_SELECT')} />
      )}

      {screen === 'SELECT' && (
        <SongSelect onSelect={handleSongSelect} />
      )}

      {screen === 'DETAIL' && selectedSong && (
        <SongDetail
          song={selectedSong}
          onStart={() => setScreen('GAME')}
          onBack={() => setScreen('SELECT')}
        />
      )}

      {screen === 'GAME' && selectedSong && (
        <GamePage
          onBack={() => setScreen('SELECT')}
          onEnd={() => setScreen('RESULT')}
        />
      )}

      {screen === 'RESULT' && selectedSong && (
        <ResultPage
          song={selectedSong}
          onBack={() => setScreen('SELECT')}
        />
      )}
    </div>
  );
}

export default App;
