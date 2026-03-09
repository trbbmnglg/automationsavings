export const fetchWithRetry = async (url, options) => {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < delays.length; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); 
    
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
         const text = await response.text();
         const err = new Error(`HTTP ${response.status}: ${text}`);
         err.status = response.status;
         throw err;
      }
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
         if (i === delays.length - 1) throw new Error("Request timed out after multiple retries.");
      } else if (i === delays.length - 1 || (error.status >= 400 && error.status < 500 && error.status !== 429)) {
         throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};

export const sanitizeStr = (str, limit = 400) => (str || '').substring(0, limit).replace(/[{}]/g, '').replace(/[\r\n]+/g, ' ');
