// components/CourseInfoSidebar.js
import React, { useState, useEffect, useCallback } from 'react';

// 辅助函数：将 null 转换为 ''
const sanitizeFormData = (data) => ({
  video_id: data.video_id || '',
  title: data.title || '',
  teacher_name: data.teacher_name || '',
  description: data.description || '',
  keywords: data.keywords || '',
  sections: data.sections || '',
  subtitles_status: data.subtitles_status != null ? data.subtitles_status : 0,
  notes_link: data.notes_link || '',
  tags: data.tags || '',
  comprehension_level: data.comprehension_level != null ? data.comprehension_level : 0,
});

function CourseInfoSidebar({ courseId }) {
  const [formData, setFormData] = useState({
    video_id: courseId,
    title: '',
    teacher_name: '',
    description: '',
    keywords: '',
    sections: '',
    subtitles_status: 0,
    notes_link: '',
    tags: '',
    comprehension_level: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // 用于加载状态
  const [error, setError] = useState(null);
  const [isExistingLesson, setIsExistingLesson] = useState(true); // 标识课程信息是否存在

  // 使用 useCallback 以便在 handleSave 后重新调用
  const fetchCourseInfo = useCallback(async () => {
    try {
      const response = await fetch(
        `https://masluz-api.edwin-abel-3.workers.dev/api/lecciones/get?video_id=${courseId}`
      );

      const textData = await response.text();
      console.log("Fetched text data:", textData);

      if (textData.trim() === "Lesson not found") {
        // 课程信息不存在，允许用户创建新课程信息
        setIsExistingLesson(false);
        return;
      }

      // 尝试将 textData 解析为 JSON
      let data;
      try {
        data = JSON.parse(textData);
        console.log("Parsed data:", data);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error(`期望 JSON 格式的数据，但收到: ${textData}`);
      }

      if (response.ok) {
        const sanitizedData = sanitizeFormData(data);
        setFormData(sanitizedData);
        setIsExistingLesson(true);
      } else {
        throw new Error(data.message || '未知错误');
      }
    } catch (err) {
      console.error("Fetch course info error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  // 在组件挂载时获取课程信息
  useEffect(() => {
    fetchCourseInfo();
  }, [fetchCourseInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const requestBody = {
        ...formData,
        comprehension_level: Number(formData.comprehension_level),
        subtitles_status: Number(formData.subtitles_status),
      };

      const method = isExistingLesson ? 'PUT' : 'POST';
      const apiUrl = isExistingLesson
        ? 'https://masluz-api.edwin-abel-3.workers.dev/api/lecciones/update'
        : 'https://masluz-api.edwin-abel-3.workers.dev/api/lecciones/create';

      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const textData = await response.text();
      console.log("Save response text:", textData);

      if (response.ok) {
        // 尝试解析 JSON，如果失败则使用纯文本作为成功消息
        let result;
        try {
          result = JSON.parse(textData);
          console.log("Save parsed data:", result);
        } catch (parseError) {
          // 如果不是 JSON，使用纯文本作为成功消息
          result = { message: textData };
          console.log("Save parsed as text:", result);
        }

        setSaveMessage(result.message || '保存成功');

        // 重新获取课程信息以确保表单数据同步
        await fetchCourseInfo();
      } else {
        // 尝试解析 JSON 错误信息，如果失败则使用纯文本
        let errorMessage;
        try {
          const errorData = JSON.parse(textData);
          errorMessage = errorData.message || textData;
        } catch (parseError) {
          errorMessage = textData;
        }
        setSaveMessage(`保存失败: ${errorMessage || '未知错误'}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveMessage(`保存失败: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isExistingLesson || !formData.video_id) {
      setSaveMessage('没有可删除的课程信息');
      return;
    }

    const confirmDelete = window.confirm('确定要删除这个课程信息吗？');
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://masluz-api.edwin-abel-3.workers.dev/api/lecciones/delete?video_id=${formData.video_id}`,
        {
          method: 'DELETE',
        }
      );

      const textData = await response.text();
      console.log("Delete response text:", textData);

      if (response.ok) {
        // 尝试解析 JSON，如果失败则使用纯文本作为成功消息
        let result;
        try {
          result = JSON.parse(textData);
          console.log("Delete parsed data:", result);
        } catch (parseError) {
          // 如果不是 JSON，使用纯文本作为成功消息
          result = { message: textData };
          console.log("Delete parsed as text:", result);
        }

        setSaveMessage(result.message || '删除成功');
        setFormData({
          video_id: courseId,
          title: '',
          teacher_name: '',
          description: '',
          keywords: '',
          sections: '',
          subtitles_status: 0,
          notes_link: '',
          tags: '',
          comprehension_level: 0,
        });
        setIsExistingLesson(false);
      } else {
        // 尝试解析 JSON 错误信息，如果失败则使用纯文本
        let errorMessage;
        try {
          const errorData = JSON.parse(textData);
          errorMessage = errorData.message || textData;
        } catch (parseError) {
          errorMessage = textData;
        }
        setSaveMessage(`删除失败: ${errorMessage || '未知错误'}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setSaveMessage(`删除失败: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-800 text-white h-full">
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-gray-800 text-white h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 text-white h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-4">课程信息</h2>
      {!isExistingLesson && (
        <p className="mb-4 text-yellow-400">
          课程信息不存在。请填写以下表单以创建新的课程信息。
        </p>
      )}
      <form onSubmit={handleSave}>
        {/* 课程标题 */}
        <div className="mb-4">
          <label className="block mb-2">课程标题:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
            required
          />
        </div>
        {/* 教师姓名 */}
        <div className="mb-4">
          <label className="block mb-2">教师姓名:</label>
          <input
            type="text"
            name="teacher_name"
            value={formData.teacher_name}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        {/* 课程描述 */}
        <div className="mb-4">
          <label className="block mb-2">课程描述:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        {/* 关键词 */}
        <div className="mb-4">
          <label className="block mb-2">关键词 (逗号分隔):</label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        {/* 课程章节 */}
        <div className="mb-4">
          <label className="block mb-2">课程章节:</label>
          <textarea
            name="sections"
            value={formData.sections}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
            placeholder='例如: [{"title": "第一章", "content": "内容简介"}]'
          />
        </div>
        {/* 笔记链接 */}
        <div className="mb-4">
          <label className="block mb-2">笔记链接:</label>
          <input
            type="text"
            name="notes_link"
            value={formData.notes_link}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
            placeholder="https://example.com/notes"
          />
        </div>
        {/* 课程标签 */}
        <div className="mb-4">
          <label className="block mb-2">课程标签 (逗号分隔):</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
            placeholder="标签1,标签2,标签3"
          />
        </div>
        {/* 理解程度 */}
        <div className="mb-4">
          <label className="block mb-2">理解程度 (0-100):</label>
          <input
            type="number"
            name="comprehension_level"
            value={formData.comprehension_level}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        {/* 字幕状态 */}
        <div className="mb-4">
          <label className="block mb-2">字幕状态:</label>
          <select
            name="subtitles_status"
            value={formData.subtitles_status}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          >
            <option value={0}>未完成</option>
            <option value={1}>已完成</option>
          </select>
        </div>
        {/* 按钮组 */}
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存课程信息'}
          </button>
          {isExistingLesson && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded"
            >
              删除课程信息
            </button>
          )}
        </div>
      </form>
      {saveMessage && (
        <p className={`mt-4 ${saveMessage.startsWith('保存成功') || saveMessage.startsWith('删除成功') ? 'text-green-400' : 'text-red-400'}`}>
          {saveMessage}
        </p>
      )}
    </div>
  );
}

export default CourseInfoSidebar;
