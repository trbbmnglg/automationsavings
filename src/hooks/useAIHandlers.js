import { useCallback } from 'react';
import { fetchWithRetry, sanitizeStr, checkAllFieldsSecurity } from '../utils/aiUtils';

const sanitizeAIArrayItems = (items) =>
  items.filter(item => typeof item === 'string').map(item => item.substring(0, 500));

/**
 * Provides AI-powered content generators: business pitches, KPI/challenge
 * suggestions, ROI strategy insights, and SRE use case justifications.
 * Handles provider abstraction (Pollinations, Groq, OpenRouter), input
 * security scanning, and error notification via toast.
 * @param {Object} params - AI config, input state, setters, and addToast
 * @returns {{ generateAIPitch: Function, generateSuggestions: Function, generateROIInsights: Function, generateSreUseCase: Function }}
 */
export function useAIHandlers({
  aiProvider, aiApiKey, aiModel, providerOptions, toolName, useCase, scenario, durationMonths,
  results, formatCurrency, automationPercent, challenges, kpis, qualitativeBenefits,
  setAiPitch, setIsGenerating, setIsGeneratingSuggestions, setKpis, setChallenges,
  setQualitativeBenefits, setAiGeneratedFields, setIsGeneratingInsights, setRoiInsights,
  setIsGeneratingSreUseCase, setSreUseCase,
  setSecurityError, addToast
}) {

  const callAIWrapper = useCallback(async (prompt) => {
    if (providerOptions[aiProvider].needsKey && !aiApiKey.trim()) {
      throw new Error(`Please provide an API key in AI Settings.`);
    }

    if (aiProvider === 'pollinations') {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: aiModel })
      });
      if (!res.ok) throw new Error('Pollinations API error');
      return await res.text();
    } else {
      const url = aiProvider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://openrouter.ai/api/v1/chat/completions';

      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`
        },
        body: JSON.stringify({ model: aiModel, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
      return data?.choices?.[0]?.message?.content;
    }
  }, [aiProvider, aiApiKey, aiModel, providerOptions]);

  // Shared security gate — runs before any AI call that uses user text fields
  const runSecurityCheck = useCallback((fields) => {
    const check = checkAllFieldsSecurity(fields);
    if (!check.safe) {
      if (setSecurityError) setSecurityError(check);
      return false;
    }
    if (setSecurityError) setSecurityError(null);
    return true;
  }, [setSecurityError]);

  const generateAIPitch = useCallback(async () => {
    const ok = runSecurityCheck({ toolName, useCase, challenges, kpis, qualitativeBenefits });
    if (!ok) return;

    setIsGenerating(true);
    const prompt = `Act as a professional business analyst. Write a persuasive, general business case pitch for an automation project. Details: Tool Name: """${sanitizeStr(toolName)}""" | Use Case: """${sanitizeStr(useCase)}""" | Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Forecast. Financials: Lifetime Net Savings: ${formatCurrency(results.netSavings)} over ${durationMonths} months | ROI: ${results.roi === Infinity ? '>1000' : Math.round(results.roi)}%. Write a compelling executive summary (2-3 paragraphs). Do NOT include greetings.`;
    try {
      const text = await callAIWrapper(prompt);
      if (text) setAiPitch(text.trim());
    } catch (error) {
      if (addToast) addToast('Failed to generate pitch. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [callAIWrapper, runSecurityCheck, toolName, useCase, scenario, durationMonths, results, formatCurrency, challenges, kpis, qualitativeBenefits, setAiPitch, setIsGenerating]);

  const generateSuggestions = useCallback(async () => {
    if (!toolName && !useCase) return;

    const ok = runSecurityCheck({ toolName, useCase });
    if (!ok) return;

    setIsGeneratingSuggestions(true);
    const prompt = `Based on Tool Name: """${sanitizeStr(toolName)}""" and Use Case: """${sanitizeStr(useCase)}""", return ONLY a valid JSON object exactly matching this structure: {"kpis": ["..."], "challenges": ["..."], "benefits": ["..."]}. Do NOT include markdown backticks. Escape all internal quotes.`;
    try {
      const text = await callAIWrapper(prompt);
      let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const startIndex = cleanText.indexOf('{');
      const endIndex = cleanText.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        let jsonStr = cleanText.substring(startIndex, endIndex + 1);
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1').replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        const parsed = JSON.parse(jsonStr);
        if (parsed.kpis && Array.isArray(parsed.kpis)) setKpis(sanitizeAIArrayItems(parsed.kpis).map(k => '• ' + k).join('\n'));
        if (parsed.challenges && Array.isArray(parsed.challenges)) setChallenges(sanitizeAIArrayItems(parsed.challenges).map(c => '• ' + c).join('\n'));
        if (parsed.benefits && Array.isArray(parsed.benefits)) setQualitativeBenefits(sanitizeAIArrayItems(parsed.benefits).map(b => '• ' + b).join('\n'));
        setAiGeneratedFields({ kpis: true, challenges: true, benefits: true });
      }
    } catch (error) {
      if (addToast) addToast('AI suggestions failed to parse. Try again.', 'warning');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [callAIWrapper, runSecurityCheck, toolName, useCase, setKpis, setChallenges, setQualitativeBenefits, setAiGeneratedFields, setIsGeneratingSuggestions]);

  const generateROIInsights = useCallback(async () => {
    const ok = runSecurityCheck({ toolName, useCase });
    if (!ok) return;

    setIsGeneratingInsights(true);

    // FIX: Guard against Infinity before calling .toFixed() or interpolating
    // into the prompt string. paybackPeriod is Infinity when the automation
    // never recoups its costs within the project duration (e.g. no savings
    // configured yet). Passing "Infinity" literally into an AI prompt produces
    // confusing or hallucinated output. We substitute a human-readable string
    // instead. Same guard applied to roi for consistency.
    const roiDisplay = results.roi === Infinity ? '>1000%' : `${Math.round(results.roi)}%`;
    const paybackDisplay = results.paybackPeriod === Infinity ? 'N/A (does not pay back within project duration)' : `${results.paybackPeriod.toFixed(1)} months`;

    const prompt = `Act as a financial strategist. Analyze these metrics: Net Savings: ${formatCurrency(results.netSavings)}, ROI: ${roiDisplay}, Payback: ${paybackDisplay}. Provide 2-3 brief, actionable bullet points to improve ROI. Use simple dashes for bullets, no bold markdown.`;
    try {
      const text = await callAIWrapper(prompt);
      if (text) setRoiInsights(text.trim());
    } catch (error) {
      if (addToast) addToast('Failed to generate insights. Please try again.', 'error');
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [callAIWrapper, runSecurityCheck, toolName, useCase, results, formatCurrency, setRoiInsights, setIsGeneratingInsights]);

  const generateSreUseCase = useCallback(async () => {
    const ok = runSecurityCheck({ toolName, useCase });
    if (!ok) return;

    setIsGeneratingSreUseCase(true);
    const tName = toolName?.trim() ? sanitizeStr(toolName) : 'this enterprise automation system';
    const uCase = useCase?.trim() ? sanitizeStr(useCase) : 'standard automated workflows';
    const prompt = `Based on the automation tool named """${tName}""" and use case """${uCase}""", generate 2 very short, simple bullet points (maximum 5-8 words per point) justifying the need for ongoing SRE/maintenance. Keep it extremely brief. Start each point with '• '. Return ONLY the text without markdown formatting or quotes.`;
    try {
      const text = await callAIWrapper(prompt);
      if (text) setSreUseCase(sanitizeStr(text));
    } catch (error) {
      if (addToast) addToast('Failed to generate SRE use case. Try again.', 'warning');
    } finally {
      setIsGeneratingSreUseCase(false);
    }
  }, [callAIWrapper, runSecurityCheck, toolName, useCase, setSreUseCase, setIsGeneratingSreUseCase]);

  return { generateAIPitch, generateSuggestions, generateROIInsights, generateSreUseCase };
}
