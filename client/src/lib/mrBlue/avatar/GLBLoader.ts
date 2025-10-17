// TRACK 2: GLB Loader with Draco decompression
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';

export interface AvatarAnimation {
  name: string;
  action: THREE.AnimationAction;
  duration: number;
  loop: boolean;
  priority: number;
}

export class GLBAvatarLoader {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private mixer: THREE.AnimationMixer | null = null;
  private animations: Map<string, AvatarAnimation> = new Map();
  private currentAction: THREE.AnimationAction | null = null;

  constructor() {
    // Initialize Draco loader for compression
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    // Initialize GLTF loader with Draco
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  async loadAvatar(modelPath: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          
          // Setup animation mixer
          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(model);
            
            // Map all animations
            gltf.animations.forEach((clip) => {
              const action = this.mixer!.clipAction(clip);
              this.animations.set(clip.name, {
                name: clip.name,
                action,
                duration: clip.duration,
                loop: clip.name.toLowerCase().includes('idle') || clip.name.toLowerCase().includes('talk'),
                priority: this.getPriority(clip.name),
              });
            });
          }

          resolve(model);
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`[GLBLoader] Loading ${modelPath}: ${percent.toFixed(1)}%`);
        },
        (error) => {
          console.error('[GLBLoader] Load error:', error);
          reject(error);
        }
      );
    });
  }

  playAnimation(animationName: string, fadeTime: number = 0.3) {
    const animation = this.animations.get(animationName);
    if (!animation || !this.mixer) {
      console.warn(`[GLBLoader] Animation "${animationName}" not found`);
      return;
    }

    // Fade out current animation
    if (this.currentAction && this.currentAction !== animation.action) {
      this.currentAction.fadeOut(fadeTime);
    }

    // Fade in new animation
    animation.action.reset();
    animation.action.fadeIn(fadeTime);
    animation.action.setLoop(
      animation.loop ? THREE.LoopRepeat : THREE.LoopOnce,
      animation.loop ? Infinity : 1
    );
    animation.action.play();

    this.currentAction = animation.action;
  }

  update(delta: number) {
    this.mixer?.update(delta);
  }

  getAvailableAnimations(): string[] {
    return Array.from(this.animations.keys());
  }

  private getPriority(animationName: string): number {
    const name = animationName.toLowerCase();
    if (name.includes('idle')) return 1;
    if (name.includes('talk')) return 2;
    if (name.includes('gesture') || name.includes('point') || name.includes('wave')) return 3;
    if (name.includes('error') || name.includes('success')) return 4;
    return 2;
  }

  dispose() {
    this.mixer?.stopAllAction();
    this.animations.clear();
    this.dracoLoader.dispose();
  }
}

export const avatarLoader = new GLBAvatarLoader();
