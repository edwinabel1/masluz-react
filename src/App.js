import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CourseSelection from './pages/CourseSelection';
import Player from './pages/Player';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CourseSelection />} />
        <Route path="/player/:courseId" element={<Player />} />
      </Routes>
    </Router>
  );
}

export default App;
