import * as THREE from 'three';
import { setupScene, setupCamera, setupLighting } from '../engine/SceneSetup';
import { GameRenderer } from '../engine/GameRenderer';

/**
 * Gère la scène 3D et le rendu
 */
export class SceneManager {
  constructor(gl, screenWidth, screenHeight) {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.animationFrameId = null;
    
    this.initialize(gl);
  }

  /**
   * Initialise la scène 3D
   */
  initialize(gl) {
    // Créer le renderer
    this.renderer = new GameRenderer(gl, this.screenWidth, this.screenHeight);
    
    // Créer la scène et la caméra
    this.scene = setupScene();
    this.camera = setupCamera(this.screenWidth, this.screenHeight);
    
    // Ajouter l'éclairage
    setupLighting(this.scene);
    
    console.log('SceneManager initialized');
  }

  /**
   * Ajoute un objet à la scène
   */
  addObject(object) {
    if (this.scene && object) {
      this.scene.add(object);
    }
  }

  /**
   * Retire un objet de la scène
   */
  removeObject(object) {
    if (this.scene && object) {
      this.scene.remove(object);
    }
  }

  /**
   * Démarre la boucle de rendu
   */
  startRenderLoop(onUpdate) {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      
      // Callback pour les mises à jour
      if (onUpdate) {
        onUpdate();
      }
      
      // Rendu de la scène
      this.render();
    };
    
    animate();
  }

  /**
   * Arrête la boucle de rendu
   */
  stopRenderLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Effectue le rendu de la scène
   */
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Nettoie les ressources
   */
  dispose() {
    this.stopRenderLoop();
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Nettoyer la scène
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
  }
}