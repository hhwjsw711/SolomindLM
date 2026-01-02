import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, FileText } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  transcript?: string;
  title?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, transcript, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && duration) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">{title || 'Audio Overview'}</h3>
        <div className="flex gap-2">
          {transcript && (
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title={showTranscript ? 'Hide transcript' : 'Show transcript'}
            >
              <FileText className="w-4 h-4" />
            </button>
          )}
          <a
            href={audioUrl}
            download
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Download audio"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          style={{ accentColor: 'hsl(var(--primary))' }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={togglePlay}
          className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button
          onClick={changePlaybackRate}
          className="px-3 py-1 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          title="Change playback speed"
        >
          {playbackRate}x
        </button>
      </div>

      {/* Transcript */}
      {showTranscript && transcript && (
        <div className="border-t border-border pt-4">
          <h4 className="font-semibold text-sm mb-2">Transcript</h4>
          <div className="max-h-60 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {transcript}
          </div>
        </div>
      )}
    </div>
  );
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
