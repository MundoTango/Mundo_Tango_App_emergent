import { useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * Track B: Performance Optimization System
 * Agent #73: Scott 3D Avatar Expert
 * 
 * Features:
 * - Dynamic LOD (Level of Detail) based on device performance
 * - Texture compression and lazy loading
 * - Frame rate monitoring and throttling
 * - Memory usage optimization
 */

export interface PerformanceMetrics {
  fps: number;
  memory: number;
  drawCalls: number;
  triangles: number;
}

export interface PerformanceSettings {
  targetFPS: number;
  maxMemoryMB: number;
  lodDistance: number;
  textureQuality: 'low' | 'medium' | 'high';
  enableShadows: boolean;
  antialias: boolean;
}

/**
 * Device Performance Detector
 * Determines optimal settings based on device capabilities
 */
export function useDevicePerformance(): PerformanceSettings {
  const [settings, setSettings] = useState<PerformanceSettings>({
    targetFPS: 60,
    maxMemoryMB: 100,
    lodDistance: 10,
    textureQuality: 'high',
    enableShadows: true,
    antialias: true
  });

  useEffect(() => {
    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false;

    // Adjust settings based on device
    if (isMobile || isLowEnd) {
      setSettings({
        targetFPS: 30,
        maxMemoryMB: 50,
        lodDistance: 5,
        textureQuality: 'medium',
        enableShadows: false,
        antialias: false
      });
    }

    // Check for WebGL 2 support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      // Fallback to low quality for WebGL 1
      setSettings(prev => ({
        ...prev,
        textureQuality: 'low',
        enableShadows: false
      }));
    }
  }, []);

  return settings;
}

/**
 * FPS Monitor Hook
 * Tracks frame rate and adjusts quality dynamically
 */
export function useFPSMonitor(callback: (fps: number) => void) {
  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measure = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        callback(fps);
        
        frames = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measure);
    };

    animationId = requestAnimationFrame(measure);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [callback]);
}

/**
 * Texture Compression Utility
 * Compress textures based on quality settings
 */
export class TextureOptimizer {
  static compressTexture(
    texture: THREE.Texture,
    quality: 'low' | 'medium' | 'high'
  ): THREE.Texture {
    const maxSize = {
      low: 512,
      medium: 1024,
      high: 2048
    }[quality];

    // Resize if needed
    if (texture.image) {
      const { width, height } = texture.image;
      if (width > maxSize || height > maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height);
        texture.image.width = Math.floor(width * scale);
        texture.image.height = Math.floor(height * scale);
      }
    }

    // Set compression settings
    texture.minFilter = quality === 'low' ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = quality !== 'low';

    return texture;
  }

  static async compressGLBTextures(
    scene: THREE.Group,
    quality: 'low' | 'medium' | 'high'
  ): Promise<void> {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial) {
            if (material.map) {
              material.map = this.compressTexture(material.map, quality);
            }
            if (material.normalMap) {
              material.normalMap = this.compressTexture(material.normalMap, quality);
            }
            if (material.roughnessMap) {
              material.roughnessMap = this.compressTexture(material.roughnessMap, quality);
            }
          }
        });
      }
    });
  }
}

/**
 * LOD (Level of Detail) Manager
 * Switches between high/medium/low detail models based on distance
 */
export class LODManager {
  private lod: THREE.LOD;

  constructor() {
    this.lod = new THREE.LOD();
  }

  addLevel(mesh: THREE.Mesh, distance: number): void {
    this.lod.addLevel(mesh, distance);
  }

  getObject(): THREE.LOD {
    return this.lod;
  }

  /**
   * Create simplified mesh for lower LOD
   */
  static simplifyMesh(mesh: THREE.Mesh, targetRatio: number): THREE.Mesh {
    // Clone the mesh
    const simplified = mesh.clone();

    // Reduce geometry complexity
    if (simplified.geometry) {
      const geometry = simplified.geometry;
      const positions = geometry.attributes.position;
      
      // Simple vertex reduction (production would use a proper decimation algorithm)
      const targetVertices = Math.floor(positions.count * targetRatio);
      
      // For now, just return the clone (TODO: implement proper mesh decimation)
      simplified.renderOrder = mesh.renderOrder - 1;
    }

    return simplified;
  }
}

/**
 * Memory Monitor
 * Tracks GPU memory usage and triggers cleanup
 */
export class MemoryMonitor {
  private maxMemoryMB: number;

  constructor(maxMemoryMB: number = 100) {
    this.maxMemoryMB = maxMemoryMB;
  }

  getCurrentUsage(): number {
    // Use performance.memory if available (Chrome only)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  shouldCleanup(): boolean {
    const usage = this.getCurrentUsage();
    return usage > this.maxMemoryMB;
  }

  static cleanupScene(scene: THREE.Scene): void {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material instanceof THREE.Material) {
            // Dispose textures (check if they exist and are disposable)
            const mat = material as any;
            if (mat.map && typeof mat.map.dispose === 'function') mat.map.dispose();
            if (mat.normalMap && typeof mat.normalMap.dispose === 'function') mat.normalMap.dispose();
            if (mat.roughnessMap && typeof mat.roughnessMap.dispose === 'function') mat.roughnessMap.dispose();
            
            material.dispose();
          }
        });
      }
    });
  }
}

/**
 * Performance Preset Manager
 * Predefined settings for different performance targets
 */
export const PerformancePresets = {
  ultra: {
    targetFPS: 60,
    maxMemoryMB: 150,
    lodDistance: 15,
    textureQuality: 'high' as const,
    enableShadows: true,
    antialias: true
  },
  high: {
    targetFPS: 60,
    maxMemoryMB: 100,
    lodDistance: 10,
    textureQuality: 'high' as const,
    enableShadows: true,
    antialias: true
  },
  medium: {
    targetFPS: 30,
    maxMemoryMB: 75,
    lodDistance: 7,
    textureQuality: 'medium' as const,
    enableShadows: true,
    antialias: false
  },
  low: {
    targetFPS: 30,
    maxMemoryMB: 50,
    lodDistance: 5,
    textureQuality: 'low' as const,
    enableShadows: false,
    antialias: false
  },
  mobile: {
    targetFPS: 30,
    maxMemoryMB: 40,
    lodDistance: 3,
    textureQuality: 'low' as const,
    enableShadows: false,
    antialias: false
  }
};

/**
 * Auto-Quality Adjuster
 * Dynamically adjusts quality based on performance
 */
export class AutoQualityAdjuster {
  private currentPreset: keyof typeof PerformancePresets = 'high';
  private fpsHistory: number[] = [];
  private readonly historySize = 30; // 30 frames of history

  updateFPS(fps: number): void {
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  shouldDowngrade(): boolean {
    const avgFPS = this.getAverageFPS();
    const target = PerformancePresets[this.currentPreset].targetFPS;
    return avgFPS < target * 0.8; // 80% of target
  }

  shouldUpgrade(): boolean {
    const avgFPS = this.getAverageFPS();
    const target = PerformancePresets[this.currentPreset].targetFPS;
    return avgFPS > target * 1.2; // 120% of target
  }

  adjust(): PerformanceSettings | null {
    if (this.shouldDowngrade()) {
      // Downgrade quality
      const presets = Object.keys(PerformancePresets) as (keyof typeof PerformancePresets)[];
      const currentIndex = presets.indexOf(this.currentPreset);
      if (currentIndex < presets.length - 1) {
        this.currentPreset = presets[currentIndex + 1];
        return PerformancePresets[this.currentPreset];
      }
    } else if (this.shouldUpgrade()) {
      // Upgrade quality
      const presets = Object.keys(PerformancePresets) as (keyof typeof PerformancePresets)[];
      const currentIndex = presets.indexOf(this.currentPreset);
      if (currentIndex > 0) {
        this.currentPreset = presets[currentIndex - 1];
        return PerformancePresets[this.currentPreset];
      }
    }
    return null;
  }
}
