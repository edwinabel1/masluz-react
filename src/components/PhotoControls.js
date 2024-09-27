// components/PhotoControls.js
import React from 'react';

function PhotoControls({ currentPhotoIndex, photosLength, onPrev, onNext }) {
  return (
    <div className="photo-controls flex justify-between items-center mt-4">
      <button
        onClick={onPrev}
        className="bg-gray-700 text-white p-2 rounded-l"
      >
        ◀
      </button>
      <div className="text-center text-gray-400">
        {`Photo ${currentPhotoIndex + 1} of ${photosLength}`}
      </div>
      <button
        onClick={onNext}
        className="bg-gray-700 text-white p-2 rounded-r"
      >
        ▶
      </button>
    </div>
  );
}

export default PhotoControls;
