// hooks/useAudioUrl.js
import { useState, useEffect } from 'react';

function useAudioUrl(courseId) {
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    const fetchAudioUrl = async () => {
      try {
        const response = await fetch(
          `https://masluz-api.edwin-abel-3.workers.dev/api/get-audio?file=${courseId}`
        );
        if (!response.ok) throw new Error("Failed to fetch audio file");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (error) {
        console.error("Error fetching audio file:", error);
      }
    };

    fetchAudioUrl();
  }, [courseId]);

  return audioUrl;
}

export default useAudioUrl;
