/**
 * Stub for heic2any - Provides minimal HEIC to other format conversion stubs
 * This stub allows the app to run without the actual heic2any package
 */

export interface ConvertOptions {
  blob: Blob;
  toType?: string;
  quality?: number;
  [key: string]: any;
}

const heic2any = async (options: ConvertOptions): Promise<Blob | Blob[]> => {
  console.warn('heic2any is not installed - HEIC conversion is stubbed, returning original blob');
  
  // Return the original blob as fallback
  return options.blob;
};

export default heic2any;
