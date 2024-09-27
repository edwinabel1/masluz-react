// components/Blackboard.js
import React from 'react';

function Blackboard({ photoUrl }) {
  return (
    <div className="blackboard-container flex-grow flex justify-center items-center overflow-hidden">
      {photoUrl && (
        <img
          src={photoUrl}
          alt="Blackboard"
          className="max-w-full max-h-full object-contain"
        />
      )}
    </div>
  );
}

export default Blackboard;
