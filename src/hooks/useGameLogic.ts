// src/hooks/useGameLogic.ts
import { useState, useRef } from 'react';
import { searchTracks, getSnippet, DeezerTrack } from '@/lib/services/deezer';

const TRIALS = [
  { level: 1, duration: 1, penalty: 1 },
  { level: 2, duration: 5, penalty: 3 },
  { level: 3, duration: 10, penalty: 5 },
  { level: 4, duration: 20, penalty: 10 },
  { level: 5, duration: 30, penalty: 15 },
];

export type Step = 'LOBBY' | 'START_SCREEN' | 'DJ_CHOOSE' | 'SONG_RESULTS' | 'GUESSING' | 'GAME_OVER';

export function useGameLogic() {
  const [step, setStep] = useState<Step>('LOBBY');
  const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A');
  const [balanceA, setBalanceA] = useState(30);
  const [balanceB, setBalanceB] = useState(30);
  const [trialIdx, setTrialIdx] = useState(0);
  const [targetTrack, setTargetTrack] = useState<DeezerTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DeezerTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tracks = await searchTracks(searchQuery);
    setSearchResults(tracks);
    setStep('SONG_RESULTS');
    setLoading(false);
  };

  const confirmSong = (track: DeezerTrack) => {
    setTargetTrack(track);
    setSearchResults([]);
    setSearchQuery('');
    setTrialIdx(0);
    setStep('GUESSING');
  };

  const backToSearch = () => {
    setSearchResults([]);
    setStep('DJ_CHOOSE');
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
      const reward = trialIdx === 0 ? 2 : 0;
      if (activeTeam === 'A') setBalanceA(prev => Math.min(30, prev + reward));
      else setBalanceB(prev => Math.min(30, prev + reward));
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
        endTurn();
      }
    }
  };

  const endTurn = () => {
    setActiveTeam(activeTeam === 'A' ? 'B' : 'A');
    setStep('START_SCREEN');
  };

  return {
    step, setStep,
    activeTeam,
    balanceA, balanceB,
    trialIdx,
    searchQuery, setSearchQuery,
    searchResults,
    loading,
    selectSong, confirmSong, backToSearch,
    playClip, handleVerbalResult
  };
}