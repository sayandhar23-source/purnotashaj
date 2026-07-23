export type VideoInfo =
  | { type: 'youtube'; embedUrl: string }
  | { type: 'file'; url: string }
  | null;

/**
 * Detects whether a video URL is a YouTube link (returns an embeddable iframe URL)
 * or a direct video file (mp4/webm/ogg) to use in a <video> tag. Returns null if
 * the URL doesn't look like either — safer to show nothing than a broken player.
 */
export function getVideoInfo(url?: string): VideoInfo {
  if (!url) return null;
  const trimmed = url.trim();

  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/,
  );
  if (youtubeMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(trimmed)) {
    return { type: 'file', url: trimmed };
  }

  return null;
}
