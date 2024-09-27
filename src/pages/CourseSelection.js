// src/pages/CourseSelection.js
import React, { useState, useEffect } from 'react';
import './CourseSelection.css'; // 保留用于自定义样式
import { Link } from 'react-router-dom';

function CourseSelection() {
  const [selectedDate, setSelectedDate] = useState(new Date()); // 选中的月份和年份
  const [audioFiles, setAudioFiles] = useState([]);
  const [lecciones, setLecciones] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 异步函数以并行获取音频文件和已处理课程
    const fetchData = async () => {
      try {
        const [audioResponse, leccionesResponse] = await Promise.all([
          fetch('https://masluz-api.edwin-abel-3.workers.dev/api/list-audio-files'),
          fetch('https://masluz-api.edwin-abel-3.workers.dev/api/lecciones'),
        ]);

        if (!audioResponse.ok) {
          const errorText = await audioResponse.text();
          throw new Error(`无法获取音频文件: ${audioResponse.status} ${audioResponse.statusText} - ${errorText}`);
        }

        if (!leccionesResponse.ok) {
          const errorText = await leccionesResponse.text();
          throw new Error(`无法获取已处理课程: ${leccionesResponse.status} ${leccionesResponse.statusText} - ${errorText}`);
        }

        const audioData = await audioResponse.json();
        const leccionesData = await leccionesResponse.json();

        setAudioFiles(audioData);
        setLecciones(leccionesData);
      } catch (err) {
        console.error('获取数据时出错:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 从课程 key 中解析上传日期
  const getCourseDate = (courseKey) => {
    const dateStr = courseKey.split('.')[0];
    const year = `20${dateStr.slice(0, 2)}`;
    const month = dateStr.slice(2, 4);
    const day = dateStr.slice(4, 6);
    return new Date(year, month - 1, day);
  };

  // 判断音频文件是否已处理
  const isProcessed = (courseKey) => {
    return lecciones.some(leccion => leccion.video_id === courseKey);
  };

  // 生成已处理课程列表，包含上传日期
  const processedCourses = lecciones.map(leccion => ({
    key: leccion.video_id,
    title: leccion.title,
    teacherName: leccion.teacher_name,
    uploadDate: getCourseDate(leccion.video_id).toDateString(),
  }));

  // 生成未处理的音频文件列表，包含上传日期
  const unprocessedCourses = audioFiles
    .filter(audio => !isProcessed(audio.key))
    .map(audio => ({
      key: audio.key,
      uploadDate: getCourseDate(audio.key).toDateString(),
    }));

  // 根据搜索查询和月份过滤课程
  const filterCourses = (courses) => {
    if (searchQuery.trim() !== '') {
      // 如果有搜索查询，则忽略月份过滤，过滤所有课程
      return courses.filter(course => {
        const matchesSearch = course.title
          ? course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.teacherName && course.teacherName.toLowerCase().includes(searchQuery.toLowerCase()))
          : course.key.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });
    } else {
      // 否则，根据选定的月份和年份过滤课程
      return courses.filter(course => {
        const courseDate = new Date(course.uploadDate);
        const selectedMonth = selectedDate.getMonth();
        const selectedYear = selectedDate.getFullYear();
        const matchesMonth = courseDate.getMonth() === selectedMonth;
        const matchesYear = courseDate.getFullYear() === selectedYear;

        return matchesMonth && matchesYear;
      });
    }
  };

  // 获取过滤后的课程
  const filteredUnprocessedCourses = filterCourses(unprocessedCourses);
  const filteredProcessedCourses = filterCourses(processedCourses);

  // 渲染课程列表
  const renderCoursesList = (courses, type) => {
    if (courses.length === 0) {
      return <p className="text-gray-400">暂无课程</p>;
    }

    return (
      <ul className="text-sm space-y-2">
        {courses.map(course => (
          <li key={course.key} className="flex flex-col p-2 bg-gray-700 rounded hover:bg-gray-600">
            <Link to={`/player/${course.key}`} className="text-blue-400 hover:underline">
              {course.title ? course.title : course.key}
            </Link>
            <span className="text-gray-500 text-sm">
              {course.teacherName ? `教师: ${course.teacherName}` : ''}
              {course.uploadDate ? ` • 上传日期: ${course.uploadDate}` : ''}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // 处理月份变化
  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    const updatedDate = new Date(selectedDate.getFullYear(), newMonth, 1);
    setSelectedDate(updatedDate);
    // 当月份变化时，重置搜索查询
    if (searchQuery.trim() !== '') {
      setSearchQuery('');
    }
  };

  // 处理年份变化
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    const updatedDate = new Date(newYear, selectedDate.getMonth(), 1);
    setSelectedDate(updatedDate);
    // 当年份变化时，重置搜索查询
    if (searchQuery.trim() !== '') {
      setSearchQuery('');
    }
  };

  // 获取所有年份，用于年份下拉菜单
  const getYears = () => {
    const years = new Set();
    lecciones.forEach(leccion => {
      const date = getCourseDate(leccion.video_id);
      years.add(date.getFullYear());
    });
    audioFiles.forEach(audio => {
      const date = getCourseDate(audio.key);
      years.add(date.getFullYear());
    });
    // 添加一个年份范围，例如当前年前后5年
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
      years.add(y);
    }
    const yearList = Array.from(years).sort((a, b) => a - b);
    return yearList;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <p className="text-xl text-white">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">错误: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-4xl bg-gray-800 p-6 shadow-lg rounded-lg h-full flex flex-col">
        {/* 搜索框 */}
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="搜索课程标题或教师姓名"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-2 border border-gray-700 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="ml-2 p-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              清除
            </button>
          )}
        </div>

        {/* 月份和年份选择 */}
        <div className="mb-4 flex space-x-4">
          {/* 选择月份 */}
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-300 mb-1">选择月份:</label>
            <select
              value={selectedDate.getMonth()}
              onChange={handleMonthChange}
              className="w-full p-2 border border-gray-700 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              {[
                'January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'
              ].map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
          </div>

          {/* 选择年份 */}
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-300 mb-1">选择年份:</label>
            <select
              value={selectedDate.getFullYear()}
              onChange={handleYearChange}
              className="w-full p-2 border border-gray-700 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              {getYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 课程显示 */}
        <div className="flex flex-grow space-y-4 md:space-y-0 md:space-x-4 overflow-auto">
          {/* 未处理音频 */}
          <div className="w-full md:w-1/2">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">未处理音频</h3>
            {renderCoursesList(filteredUnprocessedCourses, 'unprocessed')}
          </div>

          {/* 已处理课程 */}
          <div className="w-full md:w-1/2">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">已处理课程</h3>
            {renderCoursesList(filteredProcessedCourses, 'processed')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseSelection;
