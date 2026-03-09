const loadingPromises = {};

export const loadScript = (src, globalName) => {
  if (window[globalName]) return Promise.resolve(window[globalName]);
  if (loadingPromises[globalName]) return loadingPromises[globalName];
  
  loadingPromises[globalName] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(window[globalName]);
    script.onerror = () => {
      delete loadingPromises[globalName]; // Prevent cache poisoning on failure
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(script);
  });
  return loadingPromises[globalName];
};
