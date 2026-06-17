import { ArrowLeft, Download, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatAudioTime, useAudioPlayer } from "../hooks/useAudioPlayer";
import { useResolvedAudioPlaybackUrl } from "../hooks/useResolvedAudioPlaybackUrl";

interface AudioPlayerProps {
  audioUrl: string;
  audioOverviewId?: string;
  transcript?: string;
  title?: string;
  onBack?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioOverviewId,
  transcript,
  title,
  onBack,
}) => {
  const { t } = useTranslation();
  const resolvedPlayback = useResolvedAudioPlaybackUrl(audioUrl, audioOverviewId);
  const audioSource = typeof resolvedPlayback === "string" ? resolvedPlayback : null;
  const {
    audioRef,
    canSeek,
    currentTime,
    cyclePlaybackRate,
    duration,
    error,
    isPlaying,
    playbackRate,
    seekTo,
    skipBy,
    togglePlay,
  } = useAudioPlayer(audioSource);
  const isResolving = resolvedPlayback === undefined;
  const isUnavailable = resolvedPlayback === null;
  const canPlay = !!audioSource && !error;

  return (
    <div className="h-full flex flex-col relative">
      {/* Mobile Back Button */}
      {onBack && (
        <div className="md:hidden flex items-center gap-2 p-4 border-b border-border bg-background/80 backdrop-blur-sm z-20 mb-4">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-secondary rounded-md transition-colors text-foreground flex items-center justify-center shrink-0"
            aria-label={t("audio.backToStudio")}
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
          </button>
          <span className="text-sm font-semibold text-foreground truncate">
            {title || t("audio.audioOverview")}
          </span>
        </div>
      )}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl p-4 space-y-4">
        {/* Loading state */}
        {isResolving && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
              <p className="text-sm text-muted-foreground">{t("audio.loadingAudio")}</p>
            </div>
          </div>
        )}

        {isUnavailable && (
          <p className="text-sm text-destructive text-center py-4">
            {t("audio.couldNotResolveUrl")}
          </p>
        )}

        {error && <p className="text-sm text-destructive text-center py-2">{error}</p>}

        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioSource ?? undefined} preload="metadata" />

        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <h3 className="font-bold text-foreground">{title || t("audio.audioOverview")}</h3>
          <div className="flex gap-2">
            <a
              href={audioSource ?? "#"}
              download
              className={`p-2 hover:bg-secondary rounded-lg transition-colors ${
                audioSource ? "" : "pointer-events-none opacity-50"
              }`}
              title={t("audio.downloadAudio")}
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 shrink-0">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            disabled={!canSeek}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
            style={{ accentColor: "hsl(var(--primary))" }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatAudioTime(currentTime)}</span>
            <span>{formatAudioTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 shrink-0">
          <button
            onClick={() => skipBy(-5)}
            disabled={!canSeek}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("audio.backward5sAria")}
            title={t("audio.backward5s")}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!canPlay || isResolving}
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={isPlaying ? t("audio.pause") : t("audio.play")}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={() => skipBy(5)}
            disabled={!canSeek}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("audio.forward5sAria")}
            title={t("audio.forward5s")}
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={cyclePlaybackRate}
            disabled={!canPlay}
            className="px-3 py-1 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            title={t("audio.changePlaybackSpeed")}
          >
            {playbackRate}x
          </button>
        </div>

        {/* Transcript - Always shown and takes up remaining space */}
        {transcript && (
          <div className="flex-1 overflow-hidden flex flex-col border-t border-border pt-4 min-h-0">
            <h4 className="font-semibold text-sm mb-2 shrink-0">{t("audio.transcript")}</h4>
            <div className="flex-1 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {transcript}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
