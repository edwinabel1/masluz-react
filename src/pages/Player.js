import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SubtitleSidebar from '../components/SubtitleSidebar';

function Player() {
  const { courseId } = useParams();
  const [audioUrl, setAudioUrl] = useState('');
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchAudioUrl = async () => {
      try {
        const response = await fetch(`https://masluz-api.edwin-abel-3.workers.dev/api/get-audio?file=${courseId}`);
        if (!response.ok) throw new Error('Failed to fetch audio file');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (error) {
        console.error('Error fetching audio file:', error);
      }
    };

    const fetchSubtitles = async () => {
      try {
        const response = await fetch(`https://masluz-api.edwin-abel-3.workers.dev/api/get-subtitles?video_id=${courseId}&language=es`);
        if (!response.ok) throw new Error('Failed to fetch subtitles');
        const data = await response.json();
        setSubtitles(data);
      } catch (error) {
        console.error('Error fetching subtitles:', error);
      }
    };

    const fetchPhotos = async () => {
      try {
        const date = courseId.substring(0, 6);
        const response = await fetch(`https://masluz-api.edwin-abel-3.workers.dev/api/get-photos-by-date?date=${date}`);
        if (!response.ok) throw new Error('Failed to fetch photos');
        const data = await response.json();
        setPhotos(data);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    fetchAudioUrl();
    fetchSubtitles();
    fetchPhotos();
  }, [courseId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        const currentSub = subtitles.find(sub => currentTime >= sub.start_time && currentTime <= sub.end_time);
        setCurrentSubtitle(currentSub ? currentSub.text : '');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [subtitles]);

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  const handleSendSubtitle = (newSubtitle) => {
    setSubtitles([...subtitles, newSubtitle]);
  };

  return (
    <div className="player-container bg-gray-900 text-white h-screen flex overflow-hidden">
      <div className="w-2/3 pr-4 flex flex-col h-full">
        <h1 className="text-3xl font-bold mb-4">课程播放</h1>
        <p className="mb-4">正在播放课程 ID: {courseId} (提示:使用Tab键快速暂停或继续播放)</p>

        <div className="audio-controls mb-4">
          <audio ref={audioRef} src={audioUrl} controls className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>

        <div className="subtitle-container bg-gray-800 p-2 rounded text-center mb-4 h-16 flex items-center justify-center">
          <p className="text-xl">{currentSubtitle}</p>
        </div>

        <div className="blackboard-container flex-grow flex justify-center items-center overflow-hidden">
          {photos.length > 0 && (
            <img
              src={`https://masluz-api.edwin-abel-3.workers.dev${photos[currentPhotoIndex].url}`}
              alt="Blackboard"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {photos.length > 0 && (
          <div className="photo-controls flex justify-between items-center mt-4">
            <button onClick={handlePrevPhoto} className="bg-gray-700 text-white p-2 rounded-l">◀</button>
            <div className="text-center text-gray-400">
              {`Photo ${currentPhotoIndex + 1} of ${photos.length}`}
            </div>
            <button onClick={handleNextPhoto} className="bg-gray-700 text-white p-2 rounded-r">▶</button>
          </div>
        )}
      </div>

      <div className="w-1/3 h-full">
        <SubtitleSidebar
          subtitles={subtitles}
          onSendSubtitle={handleSendSubtitle}
          audioRef={audioRef}
          courseId={courseId}
        />
      </div>
    </div>
  );
}

export default Player;
