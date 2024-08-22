import React from 'react';
import { useParams } from 'react-router-dom';

function Player() {
  const { courseId } = useParams();

  return (
    <div>
      <h1>播放页面</h1>
      <p>正在播放课程 ID: {courseId}</p>
      {/* 在这里添加音频播放器、字幕等功能 */}
    </div>
  );
}

export default Player;
