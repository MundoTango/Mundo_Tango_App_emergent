class RequestCoalescer {
  private cache = new Map<string, Promise<any>>();
  
  async fetch(url: string, options?: RequestInit): Promise<any> {
    const key = `${url}-${JSON.stringify(options)}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const promise = fetch(url, options).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    
    this.cache.set(key, promise);
    
    promise.finally(() => {
      setTimeout(() => this.cache.delete(key), 100);
    });
    
    return promise;
  }
}

export const coalescer = new RequestCoalescer();
export const coalescedFetch = (url: string, options?: RequestInit) => coalescer.fetch(url, options);
