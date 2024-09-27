// hooks/useKeyboardControls.js
import { useEffect } from 'react';

function useKeyboardControls(audioRef) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tab 键暂停/播放
      if (e.key === "Tab") {
        e.preventDefault(); // 阻止默认 Tab 行为
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }

      // Alt + 左箭头 倒回 10 秒
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault(); // 阻止浏览器的返回行为
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(
            0,
            audioRef.current.currentTime - 10
          ); // 倒回 10 秒
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [audioRef]);
}

export default useKeyboardControls;
