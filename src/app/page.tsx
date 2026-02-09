'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { getTrack, getSnippet, DeezerTrack } from '@/lib/services/deezer';

// Game Constants
const TRIALS = [
  { level: 1, duration: 1, penalty: 1 },
  { level: 2, duration: 5, penalty: 3 },
  { level: 3, duration: 10, penalty: 5 },
  { level: 4, duration: 20, penalty: 10 },
  { level: 5, duration: 30, penalty: 15 },
];

type Step = 'LOBBY' | 'START_SCREEN' | 'DJ_CHOOSE' | 'GUESSING' | 'GAME_OVER';

export default function ClipCrush() {
  // Game Flow State
  const [step, setStep] = useState<Step>('LOBBY');
  const [teamA, setTeamA] = useState('npub1...team_a');
  const [teamB, setTeamB] = useState('npub1...team_b');
  const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A'); // The team currently GUESSING

  // Game Logic State
  const [balanceA, setBalanceA] = useState(30);
  const [balanceB, setBalanceB] = useState(30);
  const [trialIdx, setTrialIdx] = useState(0);
  const [targetTrack, setTargetTrack] = useState<DeezerTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentGuesserName = activeTeam === 'A' ? teamA : teamB;
  const currentDJName = activeTeam === 'A' ? teamB : teamA;

  // --- Actions ---

  const handleNewGame = () => setStep('START_SCREEN');

  const startRound = () => setStep('DJ_CHOOSE');

  const selectSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const track = await getTrack(searchQuery);
    if (track) {
      setTargetTrack(track);
      setTrialIdx(0);
      setStep('GUESSING');
      setSearchQuery('');
    } else {
      alert("Song not found!");
    }
    setLoading(false);
  };

  const playClip = async () => {
    if (!targetTrack) return;
    setLoading(true);
    const blob = await getSnippet(targetTrack.preview, TRIALS[trialIdx].duration);
    if (blob) {
      if (audioRef.current) audioRef.current.pause();
      const url = URL.createObjectURL(blob);
      audioRef.current = new Audio(url);
      audioRef.current.play();
    }
    setLoading(false);
  };

  const handleVerbalResult = (isCorrect: boolean) => {
    if (isCorrect) {
      // Reward if instant, otherwise just pass
      const reward = trialIdx === 0 ? 2 : 0;
      if (activeTeam === 'A') setBalanceA(prev => Math.min(30, prev + reward));
      else setBalanceB(prev => Math.min(30, prev + reward));
      
      alert(`Correct! Turn passes.`);
      endTurn();
    } else {
      const penalty = TRIALS[trialIdx].penalty;
      const newBalance = (activeTeam === 'A' ? balanceA : balanceB) - penalty;
      
      if (activeTeam === 'A') setBalanceA(newBalance);
      else setBalanceB(newBalance);

      if (newBalance <= 0) {
        setStep('GAME_OVER');
      } else if (trialIdx < 4) {
        setTrialIdx(prev => prev + 1);
      } else {
        alert("Out of trials! Turn passes.");
        endTurn();
      }
    }
  };

  const endTurn = () => {
    setActiveTeam(activeTeam === 'A' ? 'B' : 'A');
    setStep('START_SCREEN');
  };

  // --- Render Helpers ---

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 flex flex-col font-sans select-none">
      {/* Clip Crush Logo — electric purple, neon blue, hot pink + yellow highlight */}
      <div className="text-center py-8 flex flex-col items-center gap-4">
        <Image src="/logo.png" alt="Clip Crush" width={512} height={512} priority className="object-contain drop-shadow-[0_0_20px_rgba(176,38,255,0.4)]" />
        <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#b026ff] via-[#00d4ff] to-[#ff006e] drop-shadow-[0_0_30px_rgba(176,38,255,0.3)]">
        Every Second Counts.
        </h1>
      </div>

      {step === 'LOBBY' && (
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <button onClick={handleNewGame} className="bg-gradient-to-r from-[#b026ff] to-[#ff006e] text-white font-bold py-4 rounded-full text-xl shadow-[0_0_30px_rgba(176,38,255,0.4)] hover:shadow-[0_0_40px_rgba(255,0,110,0.5)] transition-shadow">
            New Game
          </button>
        </div>
      )}

      {step === 'START_SCREEN' && (
        <div className="flex-1 flex flex-col justify-center space-y-8 text-center">
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border-2 transition ${activeTeam === 'A' ? 'bg-[#b026ff]/20 border-[#b026ff] shadow-[0_0_20px_rgba(176,38,255,0.3)]' : 'bg-black/40 border-zinc-800'}`}>
                    <p className="text-xs uppercase font-bold text-[#ffe66d]">Team Pulse</p>
                    <p className="text-2xl font-black text-white">{balanceA}</p>
                </div>
                <div className={`p-4 rounded-xl border-2 transition ${activeTeam === 'B' ? 'bg-[#ff006e]/20 border-[#ff006e] shadow-[0_0_20px_rgba(255,0,110,0.3)]' : 'bg-black/40 border-zinc-800'}`}>
                    <p className="text-xs uppercase font-bold text-[#ffe66d]">Team Echo</p>
                    <p className="text-2xl font-black text-white">{balanceB}</p>
                </div>
            </div>
            <button onClick={startRound} className="bg-gradient-to-r from-[#00d4ff] to-[#b026ff] text-white py-6 rounded-2xl font-black text-2xl animate-pulse shadow-[0_0_30px_rgba(0,212,255,0.4)]">
                Start Round
            </button>
        </div>
      )}

      {step === 'DJ_CHOOSE' && (
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <h2 className="text-center text-xl font-bold text-[#ffe66d]">Choose a Song</h2>
          <form onSubmit={selectSong} className="flex flex-col gap-4">
            <input 
                autoFocus
                className="bg-black/50 p-4 rounded-xl text-lg border border-[#b026ff]/40 text-white placeholder:text-zinc-500 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition" 
                placeholder="Search Artist/Title..." 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
            <button disabled={loading} className="bg-[#ff006e] text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(255,0,110,0.3)] hover:shadow-[0_0_30px_rgba(255,0,110,0.5)] disabled:opacity-50 transition">
                {loading ? 'Fetching...' : 'Lock it in'}
            </button>
          </form>
        </div>
      )}

      {step === 'GUESSING' && (
        <div className="flex-1 flex flex-col justify-between py-10">
          <div className="text-center">
            <p className="text-[#ffe66d] uppercase font-black text-xs tracking-widest">Trial {trialIdx + 1} • -{TRIALS[trialIdx].penalty} PTS</p>
            <h2 className="text-2xl font-bold mt-2 text-white">Team {activeTeam} Guessing...</h2>
          </div>

          <button onClick={playClip} className="w-48 h-48 bg-gradient-to-r from-[#b026ff] to-[#00d4ff] text-white rounded-full mx-auto font-black text-3xl shadow-[0_0_50px_rgba(176,38,255,0.5)] hover:shadow-[0_0_60px_rgba(0,212,255,0.5)] transition-shadow border-2 border-white/20">
            PLAY
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleVerbalResult(false)} className="bg-[#ff006e]/90 text-white py-8 rounded-2xl font-black text-xl shadow-[0_0_20px_rgba(255,0,110,0.3)] hover:bg-[#ff006e] transition">INCORRECT</button>
            <button onClick={() => handleVerbalResult(true)} className="bg-[#00d4ff]/90 text-white py-8 rounded-2xl font-black text-xl shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:bg-[#00d4ff] transition">CORRECT</button>
          </div>
        </div>
      )}

      {step === 'GAME_OVER' && (
        <div className="flex-1 flex flex-col justify-center text-center space-y-6">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff006e] to-[#b026ff] drop-shadow-[0_0_30px_rgba(255,0,110,0.5)]">CRUSHED.</h1>
            <p className="text-xl text-[#ffe66d]">Team {activeTeam === 'A' ? 'B' : 'A'} Wins!</p>
            <button onClick={() => window.location.reload()} className="text-white/70 hover:text-[#ffe66d] underline opacity-80 hover:opacity-100 transition">Main Menu</button>
        </div>
      )}
    </main>
  );
}