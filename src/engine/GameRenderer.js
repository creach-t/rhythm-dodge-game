import { Renderer } from 'expo-three';

export class GameRenderer {
  constructor(gl, width, height) {
    this.renderer = new Renderer({ gl });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x1a1a1a, 1.0);
    
    // Configuration spécifique pour expo-three
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = 2; // PCFSoftShadowMap
    
    this.gl = gl;
  }

  render(scene, camera) {
    try {
      this.renderer.render(scene, camera);
      
      // IMPORTANT: Ceci est nécessaire pour expo-gl
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