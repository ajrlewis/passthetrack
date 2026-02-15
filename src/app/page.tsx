'use client';

import Image from 'next/image';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Lobby } from '@/components/Lobby';
import { StartScreen } from '@/components/StartScreen';
import { SongSelector } from '@/components/SongSelector';
import { SongResults } from '@/components/SongResults';
import { GameBoard } from '@/components/GameBoard';
import { GameOver } from '@/components/GameOver';

export default function ClipCrush() {
  const { 
    step, setStep, activeTeam, balanceA, balanceB, 
    trialIdx, searchQuery, setSearchQuery, searchResults, loading, 
    selectSong, confirmSong, backToSearch,
    playClip, handleVerbalResult 
  } = useGameLogic();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 flex flex-col font-sans select-none">
      {/* Persistent Header */}
      <div className="text-center py-8 flex flex-col items-center gap-4">
        <Image src="/logo.png" alt="Clip Crush" width={512} height={512} priority className="..." />
        <h1 className="title">Clip Crush</h1>
        <div className="space-y-2">
          <p className="text-[#ffe66d] font-bold tracking-[0.2em] uppercase text-sm">
            Every Second Counts.
          </p>
          <div className="h-1 w-12 bg-gradient-to-r from-[#b026ff] to-[#ff006e] mx-auto rounded-full" />
        </div>
      </div>

      {/* Step content: constrained width on desktop, full width on mobile */}
      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        {step === 'LOBBY' && <Lobby onStart={() => setStep('START_SCREEN')} />}

        {step === 'START_SCREEN' && (
          <StartScreen 
            balanceA={balanceA} 
            balanceB={balanceB} 
            activeTeam={activeTeam} 
            onStart={() => setStep('DJ_CHOOSE')} 
          />
        )}

        {step === 'DJ_CHOOSE' && (
          <SongSelector 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onSelect={selectSong} 
            loading={loading} 
          />
        )}

        {step === 'SONG_RESULTS' && (
          <SongResults 
            results={searchResults} 
            onSelect={confirmSong} 
            onSearchAgain={backToSearch} 
          />
        )}

        {step === 'GUESSING' && (
          <GameBoard 
            trialIdx={trialIdx} 
            activeTeam={activeTeam} 
            onPlay={playClip} 
            onResult={handleVerbalResult} 
          />
        )}

        {step === 'GAME_OVER' && <GameOver activeTeam={activeTeam} />}
      </div>
    </main>
  );
}