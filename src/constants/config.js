export const HOURS_PER_FTE_MONTH = 160;

export const providerOptions = {
  'pollinations': { name: 'Pollinations.ai', models: ['openai', 'mistral', 'llama'], url: null, needsKey: false },
  'groq': { name: 'Groq', models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'], url: '[https://console.groq.com/keys](https://console.groq.com/keys)', needsKey: true },
  'openrouter': { name: 'OpenRouter Free', models: ['meta-llama/llama-3-8b-instruct:free', 'google/gemini-2.5-flash:free'], url: '[https://openrouter.ai/keys](https://openrouter.ai/keys)', needsKey: true }
};

export const DEFAULT_LCR = {
  'CL12': 15, 'CL11': 25, 'CL10': 40, 'CL9': 60, 'CL8': 85, 'CL7': 110, 'CL6': 150
};

export const currencyConfig = { 
  USD: { locale: 'en-US', code: 'USD' }, 
  PHP: { locale: 'en-PH', code: 'PHP' }, 
  EUR: { locale: 'de-DE', code: 'EUR' }, 
  JPY: { locale: 'ja-JP', code: 'JPY' } 
};
