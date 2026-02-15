export interface DeezerTrack {
    id: number;
    title: string;
    preview: string;
    artist: { name: string };
    album: { cover_medium: string };
  }
  
export async function searchTracks(query: string): Promise<DeezerTrack[]> {
    if (!query?.trim()) return [];

    try {
      const response = await fetch(`/api/deezer?q=${encodeURIComponent(query)}`);

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      if (!data.data || data.data.length === 0) return [];

      return data.data;
    } catch (error) {
      console.error("Error fetching tracks:", error);
      return [];
    }
  }

  export async function getTrack(query: string): Promise<DeezerTrack | null> {
    const tracks = await searchTracks(query);
    return tracks.length > 0 ? tracks[0] : null;
  }
  
  export async function getSnippet(previewUrl: string, seconds: number): Promise<Blob | null> {
    try {
      // Note: The preview URL itself might still trigger CORS. 
      // If it does, we'd need a similar proxy for the audio file.
      const response = await fetch(previewUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      const bitrate = 128000; 
      const bytesPerSecond = bitrate / 8;
      const endByte = seconds * bytesPerSecond;
  
      return new Blob([arrayBuffer.slice(0, endByte)], { type: 'audio/mpeg' });
    } catch (error) {
      console.error("Error creating snippet:", error);
      return null;
    }
  }