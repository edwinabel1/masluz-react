import React from 'react';
import { Link } from 'react-router-dom';

function CourseSelection() {
  // 模拟课程列表
  const courses = [
    { id: 1, title: '课程 1' },
    { id: 2, title: '课程 2' },
    { id: 3, title: '课程 3' },
  ];

  return (
    <div>
      <h1>选择课程</h1>
      <ul>
        {courses.map(course => (
          <li key={course.id}>
            <Link to={`/player/${course.id}`}>{course.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseSelection;
