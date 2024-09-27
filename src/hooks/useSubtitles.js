// hooks/useSubtitles.js
import { useState, useEffect } from 'react';

function useSubtitles(courseId) {
  const [subtitles, setSubtitles] = useState([]);

  useEffect(() => {
    const fetchSubtitles = async () => {
      try {
        const response = await fetch(
          `https://masluz-api.edwin-abel-3.workers.dev/api/get-subtitles?video_id=${courseId}&language=es`
        );
        if (!response.ok) throw new Error("Failed to fetch subtitles");
        const data = await response.json();
        setSubtitles(data);
      } catch (error) {
        console.error("Error fetching subtitles:", error);
      }
    };

    fetchSubtitles();
  }, [courseId]);

  return [subtitles, setSubtitles];
}

export default useSubtitles;
