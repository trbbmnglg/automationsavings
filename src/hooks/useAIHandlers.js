import { useCallback } from 'react';
import { fetchWithRetry, sanitizeForAI } from '../utils/aiUtils';

export function useAIHandlers({
  aiProvider, aiApiKey, aiModel, providerOptions, toolName, useCase, scenario, durationMonths,
  results, formatCurrency, automationPercent, challenges, kpis, qualitativeBenefits,
  setAiPitch, setIsGenerating, setIsGeneratingSuggestions, setKpis, setChallenges,
  setQualitativeBenefits, setAiGeneratedFields, setIsGeneratingInsights, setRoiInsights,
  setIsGeneratingSreUseCase, setSreUseCase
}) {

  const callAIWrapper = useCallback(async (prompt) => {
    if (providerOptions[aiProvider].needsKey && !aiApiKey.trim()) {
      throw new Error('Please provide an API key in AI Settings.');
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

  // Uses sanitizeForAI — strips financial figures before sending to provider
  const generateAIPitch = useCallback(async () => {
    setIsGenerating(true);
    const prompt = `Act as a professional business analyst. Write a persuasive, general business case pitch for an automation project. Details: Tool Name: """${sanitizeForAI(toolName)}""" | Use Case: """${sanitizeForAI(useCase)}""" | Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Forecast. Financials: Lifetime Net Savings: ${formatCurrency(results.netSavings)} over ${durationMonths} months | ROI: ${Math.round(results.roi)}%. Write a compelling executive summary (2-3 paragraphs). Do NOT include greetings.`;
    try {
      const text = await callAIWrapper(prompt);
      if (text) setAiPitch(text.trim());
    } catch (error) {
      console.error('generateAIPitch failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [callAIWrapper, toolName, useCase, scenario, durationMonths, results, formatCurrency, setAiPitch, setIsGenerating]);

  const generateSuggestions = useCallback(async () => {
    if (!toolName && !useCase) return;
    setIsGeneratingSuggestions(true);
    // sanitizeForAI used — only tool name & use case sent, no financial data
    const prompt = `Based on Tool Name: """${sanitizeForAI(toolName)}""" and Use Case: """${sanitizeForAI(useCase)}""", return ONLY a valid JSON object exactly matching this structure: {"kpis": ["..."], "challenges": ["..."], "benefits": ["..."]}. Do NOT include markdown backticks. Escape all internal quotes.`;
    try {
      const text = await callAIWrapper(prompt);
      let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const startIndex = cleanText.indexOf('{');
      const endIndex = cleanText.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        let jsonStr = cleanText.substring(startIndex, endIndex + 1);
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1').replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        const parsed = JSON.parse(jsonStr);
        if (parsed.kpis && Array.isArray(parsed.kpis)) setKpis(parsed.kpis.map(k => '• ' + k).join('\n'));
        if (parsed.challenges && Array.isArray(parsed.challenges)) setChallenges(parsed.challenges.map(c => '• ' + c).join('\n'));
        if (parsed.benefits && Array.isArray(parsed.benefits)) setQualitativeBenefits(parsed.benefits.map(b => '• ' + b).join('\n'));
        setAiGeneratedFields({ kpis: true, challenges: true, benefits: true });
      }
    } catch (error) {
      console.warn('AI suggestions parsing failed:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [callAIWrapper, toolName, useCase, setKpis, setChallenges, setQualitativeBenefits, setAiGeneratedFields, setIsGeneratingSuggestions]);

  const generateROIInsights = useCallback(async () => {
    setIsGeneratingInsights(true);
    // Only computed metrics sent — no raw user text
    const prompt = `Act as a financial strategist. Analyze these metrics: Net Savings: ${formatCurrency(results.netSavings)}, ROI: ${Math.round(results.roi)}%, Payback: ${results.paybackPeriod.toFixed(1)} mo. Provide 2-3 brief, actionable bullet points to improve ROI. Use simple dashes for bullets, no bold markdown.`;
    try {
      const text = await callAIWrapper(prompt);
      if (text) setRoiInsights(text.trim());
    } catch (error) {
      console.error('generateROIInsights failed:', error);
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [callAIWrapper, results, formatCurrency, setRoiInsights, setIsGeneratingInsights]);

  const generateSreUseCase = useCallback(async () => {
    setIsGeneratingSreUseCase(true);
    const tName = toolName?.trim() ? sanitizeForAI(toolName) : 'this enterprise automation system';
    const uCase = useCase?.trim() ? sanitizeForAI(useCase) : 'standard automated workflows';
    const prompt = `Based on the automation tool named """${tName}""" and use case """${uCase}""", generate 2 very short, simple bullet points (maximum 5-8 words per point) justifying the need for ongoing SRE/maintenance. Keep it extremely brief. Start each point with '• '. Return ONLY the text without markdown formatting or quotes.`;
    try {
      const text = await callAIWrapper(prompt);
      if (text) setSreUseCase(text.replace(/["']/g, '').trim());
    } catch (error) {
      console.warn('generateSreUseCase failed:', error);
    } finally {
      setIsGeneratingSreUseCase(false);
    }
  }, [callAIWrapper, toolName, useCase, setSreUseCase, setIsGeneratingSreUseCase]);

  return { generateAIPitch, generateSuggestions, generateROIInsights, generateSreUseCase };
}
