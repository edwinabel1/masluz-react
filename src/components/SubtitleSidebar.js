import React, { useState, useEffect, useRef } from 'react';

// 辅助函数：将秒数转换为 hh:mm:ss 格式
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

function SubtitleSidebar({ subtitles, onSendSubtitle, onDeleteSubtitle, onSubtitleClick, audioRef, courseId }) {
  const [newSubtitle, setNewSubtitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [subtitleToDelete, setSubtitleToDelete] = useState(null);
  const bottomRef = useRef(null); // 用于引用列表的底部

  const handleInputChange = (e) => {
    setNewSubtitle(e.target.value);
  };

  const handleSend = async () => {
    if (audioRef.current && newSubtitle.trim() !== '') {
      const currentTime = audioRef.current.currentTime;
      const newSub = {
        id: `temp_${Date.now()}`, // 临时ID
        start_time: currentTime - 5,
        end_time: currentTime,
        text: newSubtitle,
      };

      onSendSubtitle(newSub);
      setNewSubtitle('');

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('subtitle', newSubtitle);
        formData.append('video_id', courseId);
        formData.append('language', 'es');
        formData.append('start_time', currentTime - 5);
        formData.append('end_time', currentTime);

        const response = await fetch('https://masluz-api.edwin-abel-3.workers.dev/api/upload-subtitle', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          console.log('Subtitle uploaded successfully');
        } else {
          console.error('Failed to upload subtitle');
        }
      } catch (error) {
        console.error('Error uploading subtitle:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const confirmDelete = (subtitleId) => {
    setSubtitleToDelete(subtitleId);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!subtitleToDelete) return;

    try {
      const response = await fetch(`https://masluz-api.edwin-abel-3.workers.dev/api/delete-subtitle?id=${subtitleToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Subtitle deleted successfully');
        onDeleteSubtitle(subtitleToDelete);
      } else {
        console.error('Failed to delete subtitle');
      }
    } catch (error) {
      console.error('Error deleting subtitle:', error);
    } finally {
      setShowModal(false);
      setSubtitleToDelete(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // 自动滚动到最新字幕
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [subtitles]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        const currentSubIndex = subtitles.findIndex(
          sub => currentTime >= sub.start_time && currentTime <= sub.end_time
        );
        setCurrentSubtitleIndex(currentSubIndex);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [subtitles, audioRef]);

  return (
    <div className="w-full h-full bg-gray-800 p-4 flex flex-col justify-between">
      <div className="flex-grow overflow-y-auto mb-4">
        {subtitles.map((sub, index) => (
          <div
            key={sub.id || `temp_${index}`} // 确保 key 唯一性
            className={`mb-2 p-2 rounded flex justify-between items-center cursor-pointer ${index === currentSubtitleIndex ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}
            onClick={() => onSubtitleClick(sub.start_time)} // 点击字幕调整播放进度
          >
            <div>
              <p className="text-sm">{sub.text}</p>
              <p className="text-xs text-gray-400">
                {`Start: ${sub.start_time ? formatTime(sub.start_time) : 'N/A'}, End: ${sub.end_time ? formatTime(sub.end_time) : 'N/A'}`}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); confirmDelete(sub.id); }} // 阻止事件冒泡
              className="ml-2 text-red-500 hover:text-red-700"
            >
              🗑️
            </button>
          </div>
        ))}
        {/* 滚动至底部的参考点 */}
        <div ref={bottomRef}></div>
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={newSubtitle}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入字幕..."
		  spellCheck={false}  // 禁用拼写检查
          className="w-full p-2 rounded-l bg-gray-700 text-white"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white p-2 rounded-r"
          disabled={isUploading}
        >
          {isUploading ? '上传中...' : '发送'}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">确认删除</h2>
            <p className="mb-4">你确定要删除这个字幕吗？该操作无法撤销。</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded mr-2"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubtitleSidebar;
