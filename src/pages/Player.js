import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

function Player() {
  const { courseId } = useParams(); // 获取课程ID
  const [audioUrl, setAudioUrl] = useState('');
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0); // 当前照片索引
  const audioRef = useRef(null);

  useEffect(() => {
    // 根据课程ID加载音频文件
    const fetchAudioUrl = async () => {
      try {
        const response = await fetch(`https://masluz-api.edwin-abel-3.workers.dev/api/get-audio?file=${courseId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch audio file');
        }

        const blob = await response.blob(); // 将响应处理为 Blob 对象
        const url = URL.createObjectURL(blob); // 创建一个 URL 以供音频播放器使用
        setAudioUrl(url); // 设置音频 URL
      } catch (error) {
        console.error('Error fetching audio file:', error);
      }
    };

    const fetchSubtitles = async () => {
      try {
        const response = await fetch(`https://masluz-api.edwin-abel-3.workers.dev/api/get-subtitles?video_id=${courseId}&language=en`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subtitles');
        }

        const data = await response.json();
        setSubtitles(data); // 设置字幕数据
      } catch (error) {
        console.error('Error fetching subtitles:', error);
      }
    };

    const fetchPhotos = async () => {
      try {
        const date = courseId.substring(0, 6); // 假设课程ID中前6位是日期信息，如 "240426"
        const response = await fetch(`https://masluz-api.edwin-abel-3.workers.dev/api/get-photos-by-date?date=${date}`);

        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }

        const data = await response.json();
        setPhotos(data); // 设置板书照片数据
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
        const currentSub = subtitles.find(
          sub => currentTime >= sub.start_time && currentTime <= sub.end_time
        );
        if (currentSub) {
          setCurrentSubtitle(currentSub.text);
        } else {
          setCurrentSubtitle('');
        }
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

  return (
    <div className="player-container bg-gray-900 text-white min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">课程播放</h1>
      <p className="mb-4">正在播放课程 ID: {courseId}</p>

      <div className="audio-controls mb-4">
        <audio ref={audioRef} src={audioUrl} controls className="w-full">
          Your browser does not support the audio element.
        </audio>
      </div>

      <div className="subtitle-container bg-gray-800 p-2 rounded text-center mb-4">
        <p className="text-xl">{currentSubtitle}</p>
      </div>

      <div className="blackboard-container flex flex-col items-center">
        <div className="relative w-full max-w-2xl flex justify-between items-center mb-4">
          <button onClick={handlePrevPhoto} className="bg-gray-700 text-white p-2 rounded-l">
            ◀
          </button>
          {photos.length > 0 && (
            <div className="text-center text-gray-400 absolute bottom-2 left-1/2 transform -translate-x-1/2">
              {`Photo ${currentPhotoIndex + 1} of ${photos.length}`}
            </div>
          )}
          <button onClick={handleNextPhoto} className="bg-gray-700 text-white p-2 rounded-r">
            ▶
          </button>
        </div>
        {photos.length > 0 && (
          <img
            src={`https://masluz-api.edwin-abel-3.workers.dev${photos[currentPhotoIndex].url}`}
            alt="Blackboard"
            className="w-full max-h-[calc(100vh-300px)] object-contain"
          />
        )}
      </div>
    </div>
  );
}

export default Player;
