import { Renderer } from 'expo-three';
import * as THREE from 'three';

export class GameRenderer {
  private gl: WebGLRenderingContext & { endFrameEXP?: () => void };
  private renderer: Renderer;

  constructor(gl: WebGLRenderingContext & { endFrameEXP?: () => void }) {
    this.gl = gl;
    this.renderer = new Renderer({ gl });

    // On initialise la taille avec la taille physique du buffer GL (en pixels)
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    this.renderer.setSize(width, height);

    this.renderer.setClearColor(0x1a1a1a, 1.0);

    // Configuration spécifique pour expo-three
    // The following properties may not exist on Renderer, so comment them out or remove if not supported
    // (Uncomment if your Renderer supports them)
    // (this.renderer as any).gammaInput = true;
    // (this.renderer as any).gammaOutput = true;
    if (this.renderer.shadowMap) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = 2; // PCFSoftShadowMap
    }
  }

  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    try {
      this.renderer.render(scene, camera);
      if (this.gl.endFrameEXP) {
        this.gl.endFrameEXP();
      }
    } catch (error) {
      console.error('Render error:', error);
    }
  }

  dispose(): void {
    this.renderer.dispose();
  }

  getRenderer(): Renderer {
    return this.renderer;
  }
}
