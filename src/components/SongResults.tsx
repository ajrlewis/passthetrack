// src/components/SongResults.tsx
import Image from 'next/image';
import type { DeezerTrack } from '@/lib/services/deezer';

interface Props {
  results: DeezerTrack[];
  onSelect: (track: DeezerTrack) => void;
  onSearchAgain: () => void;
}

export function SongResults({ results, onSelect, onSearchAgain }: Props) {
  const playableTracks = results.filter((t) => t.preview);

  if (playableTracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <h2 className="text-center text-xl font-bold text-[#ffe66d]">No Songs Found</h2>
        <p className="text-zinc-400 text-center text-sm">
          We couldn&apos;t find any playable tracks. Try a different artist or song name.
        </p>
        <button
          onClick={onSearchAgain}
          className="w-full max-w-xs bg-gradient-to-r from-[#b026ff] to-[#ff006e] text-white py-4 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all"
        >
          Search Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-center text-xl font-bold text-[#ffe66d] mb-4">Pick a Song</h2>
      <p className="text-zinc-500 text-center text-xs mb-4">Select the track you want to use</p>

      <ul className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {playableTracks.map((track) => (
          <li key={track.id}>
            <button
              onClick={() => onSelect(track)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:bg-[#b026ff]/20 hover:border-[#b026ff]/40 transition-all text-left group"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                {track.album?.cover_medium ? (
                  <Image
                    src={track.album.cover_medium}
                    alt={track.title}
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 text-2xl" aria-hidden>
                    ♪
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate group-hover:text-[#ffe66d] transition-colors">
                  {track.title}
                </p>
                <p className="text-sm text-zinc-400 truncate">{track.artist.name}</p>
              </div>
              <span className="text-[10px] font-bold text-[#b026ff] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Select
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={onSearchAgain}
        className="mt-6 py-3 text-zinc-500 text-sm font-medium hover:text-white transition-colors"
      >
        ← Search again
      </button>
    </div>
  );
}
