import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import SubtitleSidebar from "../components/SubtitleSidebar";
import CourseInfoSidebar from '../components/CourseInfoSidebar';  // 引入课程信息侧边栏
import VocabularySidebar from '../components/VocabularySidebar';  // 引入生词表侧边栏

function Player() {
  const { courseId } = useParams();
  const [audioUrl, setAudioUrl] = useState("");
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeSidebar, setActiveSidebar] = useState('subtitles');  // 控制当前显示的侧边栏
  const [courseInfo, setCourseInfo] = useState({ title: '', description: '' });  // 课程信息状态
  const [vocabularyList, setVocabularyList] = useState([]);  // 生词表状态  
  const audioRef = useRef(null);

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

    fetchAudioUrl();
    fetchSubtitles();
    fetchPhotos();
  }, [courseId]);

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
  }, [subtitles]);

  // Handle Tab key for play/pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tab key to pause/play
      if (e.key === "Tab") {
        e.preventDefault(); // 阻止默认 Tab 行为
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }

      // Alt + 左箭头 倒回 10 秒
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault(); // 阻止浏览器的返回行为
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(
            0,
            audioRef.current.currentTime - 10
          ); // 倒回10秒
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSubtitleClick = (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play(); // 自动播放点击的那一句
    }
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex(
      (prevIndex) => (prevIndex - 1 + photos.length) % photos.length
    );
  };

  const handleSendSubtitle = (newSubtitle) => {
    setSubtitles((prevSubtitles) => [...prevSubtitles, newSubtitle]);
  };

  const handleDeleteSubtitle = (subtitleId) => {
    setSubtitles((prevSubtitles) =>
      prevSubtitles.filter((sub) => sub.id !== subtitleId)
    );
  };
  
  const handleAddWord = (newWord) => {
    setVocabularyList((prevList) => [...prevList, newWord]);
  };

  const handleDeleteWord = (wordId) => {
    setVocabularyList((prevList) => prevList.filter((word) => word.id !== wordId));
  };

  const handleSaveCourseInfo = (newCourseInfo) => {
    setCourseInfo(newCourseInfo);
    // 你可以在这里调用 API 保存课程信息到后端
  };

  return (
    <div className="player-container bg-gray-900 text-white h-screen flex overflow-hidden">
      <div className="w-2/3 pr-4 flex flex-col h-full">
        {/* 将标题和按钮组放在同一行 */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">课程播放</h1>
          <div className="flex space-x-0">
            <button
              onClick={() => setActiveSidebar('subtitles')}
              className={`px-4 py-2 text-white rounded-l-lg ${
                activeSidebar === 'subtitles' ? 'bg-blue-600' : 'bg-gray-500'
              }`}
            >
              字幕
            </button>
            <button
              onClick={() => setActiveSidebar('courseInfo')}
              className={`px-4 py-2 text-white ${
                activeSidebar === 'courseInfo' ? 'bg-blue-600' : 'bg-gray-500'
              }`}
            >
              课程信息
            </button>
            <button
              onClick={() => setActiveSidebar('vocabulary')}
              className={`px-4 py-2 text-white rounded-r-lg ${
                activeSidebar === 'vocabulary' ? 'bg-blue-600' : 'bg-gray-500'
              }`}
            >
              生词表
            </button>
          </div>
        </div>

        <p className="mb-4">
          正在播放课程 ID: {courseId}{" "}
          (提示:使用Tab键快速暂停或继续播放,Alt+左箭头倒回10秒)
        </p>

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
            <button
              onClick={handlePrevPhoto}
              className="bg-gray-700 text-white p-2 rounded-l"
            >
              ◀
            </button>
            <div className="text-center text-gray-400">
              {`Photo ${currentPhotoIndex + 1} of ${photos.length}`}
            </div>
            <button
              onClick={handleNextPhoto}
              className="bg-gray-700 text-white p-2 rounded-r"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* 渲染对应的侧边栏 */}
      <div className="w-1/3 h-full">
        {activeSidebar === 'subtitles' && (
          <SubtitleSidebar
            subtitles={subtitles}
            onSendSubtitle={handleSendSubtitle}
            onDeleteSubtitle={handleDeleteSubtitle}
            onSubtitleClick={handleSubtitleClick}
            audioRef={audioRef}
            courseId={courseId}
          />
        )}
        {activeSidebar === 'courseInfo' && (
<CourseInfoSidebar
  courseInfo={courseInfo}
  onSaveCourseInfo={handleSaveCourseInfo}
  courseId={courseId} // 传递 courseId
/>
        )}
        {activeSidebar === 'vocabulary' && (
          <VocabularySidebar
            vocabularyList={vocabularyList}
            onAddWord={handleAddWord}
            onDeleteWord={handleDeleteWord}
          />
        )}
      </div>
    </div>
  );
}

export default Player;
