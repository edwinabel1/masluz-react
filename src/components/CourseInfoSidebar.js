import React, { useState } from 'react';

function CourseInfoSidebar({ courseInfo, onSaveCourseInfo, courseId }) {
  const [formData, setFormData] = useState({
    ...courseInfo,
    video_id: courseId // 从父组件获取并确保 video_id 传递到表单
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSaving(true);

  const requestBody = {
    video_id: formData.video_id,
    title: formData.title,
    teacher_name: formData.teacher_name,
    description: formData.description,
    keywords: formData.keywords,
    sections: formData.sections,
    subtitles_status: formData.subtitles_status || 0,
    notes_link: formData.notes_link,
    tags: formData.tags,
    comprehension_level: formData.comprehension_level || 0,
  };

  try {
    const response = await fetch('https://masluz-api.edwin-abel-3.workers.dev/api/lecciones/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const contentType = response.headers.get('content-type');

    let result;
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text(); // 如果不是JSON响应，解析为文本
    }

    if (response.ok) {
      setSaveMessage(result); // 使用纯文本响应作为成功消息
      onSaveCourseInfo(requestBody);
    } else {
      setSaveMessage(`保存失败: ${result}`);
    }
  } catch (error) {
    setSaveMessage(`保存失败: ${error.message}`);
  } finally {
    setIsSaving(false);
  }
};


  return (
    <div className="p-4 bg-gray-800 text-white h-full">
      <h2 className="text-2xl font-bold mb-4">课程信息</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">课程标题:</label>
          <input
            type="text"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">教师姓名:</label>
          <input
            type="text"
            name="teacher_name"
            value={formData.teacher_name || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">课程描述:</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">关键词:</label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">课程章节 (JSON 格式):</label>
          <textarea
            name="sections"
            value={formData.sections || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">笔记链接:</label>
          <input
            type="text"
            name="notes_link"
            value={formData.notes_link || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">课程标签 (逗号分隔):</label>
          <input
            type="text"
            name="tags"
            value={formData.tags || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">理解程度 (0-100):</label>
          <input
            type="number"
            name="comprehension_level"
            value={formData.comprehension_level || 0}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存课程信息'}
        </button>
      </form>
      {saveMessage && <p className="mt-4 text-green-400">{saveMessage}</p>}
    </div>
  );
}

export default CourseInfoSidebar;
