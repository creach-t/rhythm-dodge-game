import { useRef, useCallback, useEffect } from 'react';
import { TIMING_CONFIG, DEBUG_CONFIG } from '../utils/Constants';

/**
 * Hook personnalisé pour gérer la boucle de jeu et le timing
 * Responsabilité unique : Animation loop, timing, frame counting
 */
export const useGameLoop = ({ isPlaying, onRenderFrame }) => {
  const animationFrameRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const isRunningRef = useRef(false);

  // Démarrer la boucle de rendu
  const startLoop = useCallback(() => {
    if (isRunningRef.current) return;
    
    isRunningRef.current = true;
    frameCountRef.current = 0;
    lastFrameTimeRef.current = performance.now();
    
    const animate = (currentTime) => {
      if (!isRunningRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(animate);
      
      try {
        // Calculer le temps écoulé
        const deltaTime = currentTime - lastFrameTimeRef.current;
        const time = currentTime * 0.001; // Convertir en secondes
        
        // Appeler la fonction de rendu
        if (onRenderFrame && isPlaying) {
          onRenderFrame(time, deltaTime);
        }
        
        // Logging de debug (toutes les 60 frames)
        frameCountRef.current++;
        if (DEBUG_CONFIG.ENABLE_LOGGING && frameCountRef.current % DEBUG_CONFIG.LOG_FRAME_COUNT === 0) {
          const fps = Math.round(1000 / deltaTime);
          console.log(`Frame ${frameCountRef.current}, FPS: ${fps}`);
        }
        
        lastFrameTimeRef.current = currentTime;
        
      } catch (error) {
        console.error('Error in game loop:', error);
      }
    };
    
    animate(performance.now());
    console.log('Game loop started');
  }, [isPlaying, onRenderFrame]);

  // Arrêter la boucle de rendu
  const stopLoop = useCallback(() => {
    if (!isRunningRef.current) return;
    
    isRunningRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    console.log('Game loop stopped');
  }, []);

  // Reprendre la boucle
  const resumeLoop = useCallback(() => {
    if (isRunningRef.current) return;
    startLoop();
  }, [startLoop]);

  // Réinitialiser le compteur de frames
  const resetFrameCount = useCallback(() => {
    frameCountRef.current = 0;
  }, []);

  // Getters
  const getFrameCount = useCallback(() => frameCountRef.current, []);
  const getLastFrameTime = useCallback(() => lastFrameTimeRef.current, []);
  const isRunning = useCallback(() => isRunningRef.current, []);

  // Calculer les FPS moyens sur les dernières N frames
  const getAverageFPS = useCallback(() => {
    const deltaTime = performance.now() - lastFrameTimeRef.current;
    return deltaTime > 0 ? Math.round(1000 / deltaTime) : 0;
  }, []);

  // Effet pour gérer le cycle de vie de la boucle
  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  // Auto-start/stop basé sur l'état de jeu
  useEffect(() => {
    if (isPlaying && !isRunningRef.current) {
      startLoop();
    } else if (!isPlaying && isRunningRef.current) {
      stopLoop();
    }
  }, [isPlaying, startLoop, stopLoop]);

  return {
    // Actions
    startLoop,
    stopLoop,
    resumeLoop,
    resetFrameCount,
    
    // Getters
    getFrameCount,
    getLastFrameTime,
    getAverageFPS,
    isRunning,
    
    // Refs (pour usage avancé)
    animationFrameRef,
    frameCountRef
  };
};