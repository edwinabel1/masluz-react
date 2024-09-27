// Player.js
import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import SubtitleSidebar from "../components/SubtitleSidebar";
import CourseInfoSidebar from '../components/CourseInfoSidebar';
import VocabularySidebar from '../components/VocabularySidebar';
import Blackboard from '../components/Blackboard';
import PhotoControls from '../components/PhotoControls';

import useAudioUrl from '../hooks/useAudioUrl';
import useSubtitles from '../hooks/useSubtitles';
import usePhotos from '../hooks/usePhotos';
import useKeyboardControls from '../hooks/useKeyboardControls';
import useCurrentSubtitle from '../hooks/useCurrentSubtitle';

function Player() {
  const { courseId } = useParams();
  const audioRef = useRef(null);

  // 使用自定义 Hook 获取数据
  const audioUrl = useAudioUrl(courseId);
  const [subtitles, setSubtitles] = useSubtitles(courseId);
  const photos = usePhotos(courseId);
  const currentSubtitle = useCurrentSubtitle(subtitles, audioRef);

  useKeyboardControls(audioRef);

  // 本地状态
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeSidebar, setActiveSidebar] = useState('subtitles');
  const [courseInfo, setCourseInfo] = useState({ title: '', description: '' });
  const [vocabularyList, setVocabularyList] = useState([]);

  // 事件处理函数
  const handleSubtitleClick = (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
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

  const photoUrl = photos.length > 0
    ? `https://masluz-api.edwin-abel-3.workers.dev${photos[currentPhotoIndex].url}`
    : null;

  return (
    <div className="player-container bg-gray-900 text-white h-screen flex overflow-hidden">
      <div className="w-2/3 pr-4 flex flex-col h-full">
        {/* 标题和按钮组 */}
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
          (提示:使用 Tab 键快速暂停或继续播放, Alt+左箭头倒回 10 秒)
        </p>

        <div className="audio-controls mb-4">
          <audio ref={audioRef} src={audioUrl} controls className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>

        <div className="subtitle-container bg-gray-800 p-2 rounded text-center mb-4 h-16 flex items-center justify-center">
          <p className="text-xl">{currentSubtitle}</p>
        </div>

        {/* 黑板展示 */}
        <Blackboard photoUrl={photoUrl} />

        {/* 照片控制 */}
        {photos.length > 0 && (
          <PhotoControls
            currentPhotoIndex={currentPhotoIndex}
            photosLength={photos.length}
            onPrev={handlePrevPhoto}
            onNext={handleNextPhoto}
          />
        )}
      </div>

      {/* 侧边栏 */}
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
            courseId={courseId}
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
