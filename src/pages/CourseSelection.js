import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CourseSelection.css'; // 添加自定义的样式文件

function CourseSelection() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const response = await fetch('https://masluz-api.edwin-abel-3.workers.dev/api/list-audio-files'); // 替换为实际API
      const data = await response.json();
      setCourses(data);
    };

    fetchCourses();
  }, []);

  const getCourseDate = (courseKey) => {
    const dateStr = courseKey.split('.')[0];
    const year = `20${dateStr.slice(0, 2)}`;
    const month = dateStr.slice(2, 4);
    const day = dateStr.slice(4, 6);
    return new Date(year, month - 1, day);
  };

  const renderCoursesOnDate = (date) => {
    const coursesOnDate = courses.filter(course => {
      return getCourseDate(course.key).toDateString() === date.toDateString();
    });

    return (
      <ul className="text-sm">
        {coursesOnDate.map(course => (
          <li key={course.key}>
            <a href={`/player/${course.key}`}>
              {course.key}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="w-full max-w-4xl bg-white p-4 shadow-lg rounded-lg flex items-center justify-center">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          className="custom-calendar w-full h-full"
          tileContent={({ date }) => renderCoursesOnDate(date)}
        />
      </div>
    </div>
  );
}

export default CourseSelection;
