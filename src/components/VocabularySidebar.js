import React, { useState } from 'react';

function VocabularySidebar({ vocabularyList, onAddWord, onDeleteWord }) {
  const [newWord, setNewWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [familiarity, setFamiliarity] = useState('未掌握');

  const handleAddWord = () => {
    const word = {
      id: Date.now(),
      word: newWord,
      translation,
      familiarity,
    };
    onAddWord(word);
    setNewWord('');
    setTranslation('');
    setFamiliarity('未掌握');
  };

  return (
    <div className="w-full h-full bg-gray-800 p-4 flex flex-col justify-between">
      <div className="flex-grow overflow-y-auto mb-4">
        {vocabularyList.map((word) => (
          <div key={word.id} className="mb-2 p-2 bg-gray-700 rounded">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white">{word.word}</p>
                <p className="text-gray-400">翻译: {word.translation}</p>
                <p className="text-gray-400">熟悉程度: {word.familiarity}</p>
              </div>
              <button
                onClick={() => onDeleteWord(word.id)}
                className="text-red-500 hover:text-red-700"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="输入生词"
          className="p-2 mb-2 bg-gray-700 text-white rounded"
        />
        <input
          type="text"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          placeholder="翻译"
          className="p-2 mb-2 bg-gray-700 text-white rounded"
        />
        <select
          value={familiarity}
          onChange={(e) => setFamiliarity(e.target.value)}
          className="p-2 mb-2 bg-gray-700 text-white rounded"
        >
          <option value="未掌握">未掌握</option>
          <option value="部分掌握">部分掌握</option>
          <option value="已掌握">已掌握</option>
        </select>
        <button onClick={handleAddWord} className="bg-blue-600 text-white p-2 rounded">
          添加
        </button>
      </div>
    </div>
  );
}

export default VocabularySidebar;
