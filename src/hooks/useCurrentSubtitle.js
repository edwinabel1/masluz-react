// hooks/useCurrentSubtitle.js
import { useState, useEffect } from 'react';

function useCurrentSubtitle(subtitles, audioRef) {
  const [currentSubtitle, setCurrentSubtitle] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        const currentSub = subtitles.find(
          (sub) => currentTime >= sub.start_time && currentTime <= sub.end_time
        );
        setCurrentSubtitle(currentSub ? currentSub.text : "");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [subtitles, audioRef]);

  return currentSubtitle;
}

export default useCurrentSubtitle;
