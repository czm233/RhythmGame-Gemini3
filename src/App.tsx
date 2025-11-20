import { useState } from 'react';
import { GamePage } from './components/GamePage';
import { SongSelect } from './components/SongSelect';
import { SongDetail } from './components/SongDetail';
import { ResultPage } from './components/ResultPage';
import type { Song } from './types/game';

type Screen = 'SELECT' | 'DETAIL' | 'GAME' | 'RESULT';

function App() {
  const [screen, setScreen] = useState<Screen>('SELECT');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setScreen('DETAIL');
  };

  return (
    <div className="w-full h-full bg-black overflow-hidden">
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
