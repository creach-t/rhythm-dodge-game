import { Renderer } from 'expo-three';

export class GameRenderer {
  constructor(gl) {
    this.gl = gl;
    this.renderer = new Renderer({ gl });

    // On initialise la taille avec la taille physique du buffer GL (en pixels)
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    this.renderer.setSize(width, height);

    this.renderer.setClearColor(0x1a1a1a, 1.0);

    // Configuration spécifique pour expo-three
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = 2; // PCFSoftShadowMap
  }

  // Méthode pour changer la taille si besoin, par exemple au resize
  setSize(width, height) {
    this.renderer.setSize(width, height);
  }

  render(scene, camera) {
    try {
      this.renderer.render(scene, camera);
      this.gl.endFrameEXP();
    } catch (error) {
      console.error('Render error:', error);
    }
  }

  dispose() {
    this.renderer.dispose();
  }

  getRenderer() {
    return this.renderer;
  }
}
