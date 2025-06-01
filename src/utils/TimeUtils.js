/**
 * Utilitaires pour la gestion du temps et timing
 */

// Obtient le timestamp actuel en millisecondes
export const getCurrentTime = () => Date.now();

// Calcule le delta time depuis le dernier frame
export const calculateDeltaTime = (lastTime, currentTime) => {
  return Math.min((currentTime - lastTime) / 1000, 1/30); // Cap à 30fps minimum
};

// Classe pour gérer les timers
export class Timer {
  constructor(duration) {
    this.duration = duration;
    this.startTime = null;
    this.isRunning = false;
    this.isPaused = false;
    this.pausedTime = 0;
  }

  start() {
    this.startTime = getCurrentTime();
    this.isRunning = true;
    this.isPaused = false;
    this.pausedTime = 0;
  }

  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.pausedTime = getCurrentTime();
    }
  }

  resume() {
    if (this.isPaused) {
      const pauseDuration = getCurrentTime() - this.pausedTime;
      this.startTime += pauseDuration;
      this.isPaused = false;
    }
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0;
  }

  getElapsed() {
    if (!this.isRunning || !this.startTime) return 0;
    if (this.isPaused) return this.pausedTime - this.startTime;
    return getCurrentTime() - this.startTime;
  }

  getProgress() {
    const elapsed = this.getElapsed();
    return Math.min(elapsed / this.duration, 1);
  }

  isFinished() {
    return this.getElapsed() >= this.duration;
  }

  getRemainingTime() {
    return Math.max(0, this.duration - this.getElapsed());
  }
}

// Classe pour gérer les animations temporelles
export class Animation {
  constructor(duration, easeFunction = (t) => t) {
    this.timer = new Timer(duration);
    this.easeFunction = easeFunction;
    this.onUpdate = null;
    this.onComplete = null;
  }

  start(onUpdate, onComplete) {
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.timer.start();
  }

  update() {
    if (!this.timer.isRunning) return false;

    const progress = this.timer.getProgress();
    const easedProgress = this.easeFunction(progress);

    if (this.onUpdate) {
      this.onUpdate(easedProgress);
    }

    if (this.timer.isFinished()) {
      if (this.onComplete) {
        this.onComplete();
      }
      return false; // Animation terminée
    }

    return true; // Animation en cours
  }

  stop() {
    this.timer.stop();
  }
}

// Gestionnaire de timing pour le gameplay
export class TimingWindow {
  constructor(perfectWindow, goodWindow) {
    this.perfectWindow = perfectWindow; // ms
    this.goodWindow = goodWindow; // ms
  }

  // Évalue la qualité du timing d'une action
  evaluateTiming(targetTime, actionTime) {
    const diff = Math.abs(targetTime - actionTime);
    
    if (diff <= this.perfectWindow) {
      return { quality: 'perfect', score: 100, diff };
    } else if (diff <= this.goodWindow) {
      return { quality: 'good', score: 50, diff };
    } else {
      return { quality: 'miss', score: 0, diff };
    }
  }
}

// Gestionnaire d'interpolation temporelle
export const interpolateOverTime = (startValue, endValue, duration, easeFunction) => {
  return new Promise((resolve) => {
    const animation = new Animation(duration, easeFunction);
    let currentValue = startValue;

    animation.start(
      (progress) => {
        currentValue = startValue + (endValue - startValue) * progress;
      },
      () => {
        resolve(endValue);
      }
    );

    const update = () => {
      if (animation.update()) {
        requestAnimationFrame(update);
      }
    };
    update();
  });
};

// Délai asynchrone
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Throttle function pour limiter la fréquence d'appel
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};