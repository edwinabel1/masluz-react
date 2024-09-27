// hooks/usePhotos.js
import { useState, useEffect } from 'react';

function usePhotos(courseId) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const date = courseId.substring(0, 6);
        const response = await fetch(
          `https://masluz-api.edwin-abel-3.workers.dev/api/get-photos-by-date?date=${date}`
        );
        if (!response.ok) throw new Error("Failed to fetch photos");
        const data = await response.json();
        setPhotos(data);
      } catch (error) {
        console.error("Error fetching photos:", error);
      }
    };

    fetchPhotos();
  }, [courseId]);

  return photos;
}

export default usePhotos;
