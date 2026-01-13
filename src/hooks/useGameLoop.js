import { useEffect, useRef } from 'react';

/**
 * Custom hook for running a game loop with requestAnimationFrame
 * @param {Function} callback - Function to call each frame with delta time
 * @param {boolean} isRunning - Whether the loop should be running
 */
export const useGameLoop = (callback, isRunning) => {
  const callbackRef = useRef(callback);
  const previousTimeRef = useRef(0);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isRunning) return;

    let frameId;

    const loop = (currentTime) => {
      const deltaTime = currentTime - previousTimeRef.current;
      previousTimeRef.current = currentTime;

      // Cap delta time to prevent huge jumps
      const cappedDelta = Math.min(deltaTime, 50);
      
      callbackRef.current(cappedDelta);
      frameId = requestAnimationFrame(loop);
    };

    // Start the loop
    previousTimeRef.current = performance.now();
    frameId = requestAnimationFrame(loop);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isRunning]);
};

export default useGameLoop;
