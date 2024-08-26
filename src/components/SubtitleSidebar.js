import React, { useState, useEffect } from 'react';

function SubtitleSidebar({ subtitles, onSendSubtitle, audioRef, courseId }) {
  const [newSubtitle, setNewSubtitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(null);

  const handleInputChange = (e) => {
    setNewSubtitle(e.target.value);
  };

  const handleSend = async () => {
    if (audioRef.current && newSubtitle.trim() !== '') {
      const currentTime = audioRef.current.currentTime;
      const newSub = {
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

  const handleDelete = async (subtitleId) => {
    try {
      const response = await fetch(`https://masluz-api.edwin-abel-3.workers.dev/api/delete-subtitle?id=${subtitleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Subtitle deleted successfully');
        const updatedSubtitles = subtitles.filter(sub => sub.id !== subtitleId);
        onSendSubtitle(updatedSubtitles);
      } else {
        console.error('Failed to delete subtitle');
      }
    } catch (error) {
      console.error('Error deleting subtitle:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

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
            key={index}
            className={`mb-2 p-2 rounded flex justify-between items-center ${index === currentSubtitleIndex ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}
          >
            <div>
              <p className="text-sm">{sub.text}</p>
              <p className="text-xs text-gray-400">
                {`Start: ${sub.start_time ? sub.start_time.toFixed(2) : 'N/A'}s, End: ${sub.end_time ? sub.end_time.toFixed(2) : 'N/A'}s`}
              </p>
            </div>
            <button
              onClick={() => handleDelete(sub.id)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={newSubtitle}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入字幕..."
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
    </div>
  );
}

export default SubtitleSidebar;
