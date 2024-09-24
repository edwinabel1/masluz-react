import React, { useState } from 'react';

function CourseInfoSidebar({ onSaveCourseInfo, courseInfo }) {
  const [title, setTitle] = useState(courseInfo.title || '');
  const [description, setDescription] = useState(courseInfo.description || '');

  const handleSave = () => {
    const newCourseInfo = { title, description };
    onSaveCourseInfo(newCourseInfo);
  };

  return (
    <div className="w-full h-full bg-gray-800 p-4 flex flex-col justify-between">
      <div className="mb-4">
        <label className="block text-white mb-2">课程标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="请输入课程标题"
        />
      </div>
      <div className="mb-4">
        <label className="block text-white mb-2">课程描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="请输入课程描述"
        />
      </div>
      <button onClick={handleSave} className="bg-blue-600 text-white p-2 rounded">
        保存课程信息
      </button>
    </div>
  );
}

export default CourseInfoSidebar;
