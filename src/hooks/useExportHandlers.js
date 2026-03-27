import { useMemo, useCallback } from 'react';
import { getScoreColor, sanitizeFilename } from '../utils/helpers';

export function useExportHandlers({
  toolName, useCase, laborBreakdown, durationMonths, implementationCost,
  isAdvancedRunCost, monthlyRunCost, results, scenario, automationPercent,
  challenges, qualitativeBenefits, kpis, formatCurrency,
  setIsExportingXLSX, setIsExportingPPTX, addToast
}) {

  const isReadyToExport = useMemo(() => !!(
    toolName.trim() && useCase.trim() &&
    laborBreakdown.some(l => Number(l.executions) > 0 && Number(l.effortHours) > 0) &&
    Number(durationMonths) > 0 && Number(implementationCost) >= 0 &&
    (isAdvancedRunCost ? Number(results.uiRunCostY1) >= 0 : Number(monthlyRunCost) >= 0)
  ), [toolName, useCase, laborBreakdown, durationMonths, implementationCost,
      isAdvancedRunCost, results.uiRunCostY1, monthlyRunCost]);

  const handleExportXLSX = useCallback(async () => {
    if (!isReadyToExport) return;
    setIsExportingXLSX(true);
    try {
      const xlsxModule = await import('xlsx-js-style');
      const XLSX = xlsxModule.default || xlsxModule;

      const wb = XLSX.utils.book_new();
      const scenarioLabel = scenario.charAt(0).toUpperCase() + scenario.slice(1);

      const ws_data = [
        ['', '', '', '', `Quantitative Benefits (${scenarioLabel} Forecast)`, '', '', '', '', ''],
        [
          'Tool', 'Use Case Description', 'Challenges Addressed', 'Qualitative Benefits',
          'total executions per month', 'blended effort per execution in hours',
          'blended resource cost per hour', '% of task automated',
          'remaining contract/project duration in months', 'Cost Benefit'
        ],
        [
          toolName || 'N/A', useCase || 'N/A', challenges || 'N/A', qualitativeBenefits || 'N/A',
          Math.round(results.totalEffectiveExecutions),
          Number(results.blendedEffortPerHour).toFixed(2),
          formatCurrency(results.blendedResourceCostPerHour),
          `${automationPercent}%`, durationMonths, formatCurrency(results.netSavings)
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      ws['!merges'] = [{ s: { r: 0, c: 4 }, e: { r: 0, c: 9 } }];

      const headerStyle = {
        fill: { fgColor: { rgb: '1E40AF' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true },
        alignment: { wrapText: true, vertical: 'center', horizontal: 'center' }
      };
      const dataStyle = { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } };

      if (ws['E1']) ws['E1'].s = headerStyle;
      const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      cols.forEach(col => {
        if (ws[`${col}2`]) ws[`${col}2`].s = headerStyle;
        if (ws[`${col}3`]) ws[`${col}3`].s = dataStyle;
      });

      ws['!cols'] = [
        { wch: 25 }, { wch: 40 }, { wch: 40 }, { wch: 40 },
        { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }
      ];
      ws['!rows'] = [{ hpt: 30 }, { hpt: 60 }, { hpt: 80 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Automation Savings');

      const monthlySheetData = results.monthlyData.map(row => ({
        Month: row.month,
        Year: row.year,
        'Implementation Cost': formatCurrency(row.implementationCost),
        'Run Cost': formatCurrency(row.runCost),
        'SRE Cost': formatCurrency(row.sreCost),
        'Gross Savings': formatCurrency(row.grossSavings),
        'Net Cash Flow': formatCurrency(row.netCashFlow),
        'Cumulative Net': formatCurrency(row.cumulativeNet)
      }));
      const monthlySheet = XLSX.utils.json_to_sheet(monthlySheetData);
      XLSX.utils.book_append_sheet(wb, monthlySheet, 'Monthly Cash Flow');

      XLSX.writeFile(wb, `${sanitizeFilename(toolName) || 'Automation'} Automation Savings.xlsx`);
    } catch (e) {
      if (addToast) addToast('Failed to generate Excel file. Please try again.', 'error');
    } finally {
      setIsExportingXLSX(false);
    }
  }, [
    isReadyToExport, toolName, useCase, challenges, qualitativeBenefits, kpis,
    results, formatCurrency, scenario, automationPercent, durationMonths,
    setIsExportingXLSX
  ]);

  const handleExportPPTX = useCallback(async () => {
    if (!isReadyToExport) return;
    setIsExportingPPTX(true);
    try {
      const pptxgenModule = await import('pptxgenjs');
      const PptxGenJS = pptxgenModule.default || pptxgenModule;

      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      const slide = pptx.addSlide();

      const scoreColor = getScoreColor(results.automationScore, 'hex');

      const cTheme = '7C3AED';
      const cBg = 'F8FAFC';
      const cCardBg = 'FFFFFF';
      const cTextDark = '0F172A';
      const cTextMuted = '64748B';
      const cBorder = 'E2E8F0';
      const fFace = 'Aptos Display';

      slide.background = { color: cBg };

      slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 0.1, fill: { color: cTheme } });
      slide.addText((toolName || 'Proposed Automation').toUpperCase(), { x: 0.5, y: 0.3, w: 8.5, h: 0.6, fontSize: 28, bold: true, color: cTextDark, fontFace: fFace });
      slide.addText(`Business Case & ROI Strategy | Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}`, { x: 0.5, y: 0.9, w: 8.5, h: 0.3, fontSize: 12, color: cTextMuted, bold: true, fontFace: fFace });
      slide.addText(useCase || 'N/A', { x: 0.5, y: 1.2, w: 8.5, h: 0.4, fontSize: 11, color: cTextMuted, italic: true, valign: 'top', fontFace: fFace });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 9.5, y: 0.4, w: 3.3, h: 0.9, fill: { color: scoreColor }, rectRadius: 0.1 });
      slide.addText(`VIABILITY SCORE: ${results.automationScore}/100`, { x: 9.5, y: 0.5, w: 3.3, h: 0.3, fontSize: 10, bold: true, color: 'FFFFFF', align: 'center', opacity: 0.9, fontFace: fFace });
      slide.addText(results.scoreLabel.toUpperCase(), { x: 9.5, y: 0.8, w: 3.3, h: 0.4, fontSize: 16, bold: true, color: 'FFFFFF', align: 'center', fontFace: fFace });

      const colY = 1.8; const colH = 5.2;
      const col1X = 0.5; const col1W = 3.9;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: col1X, y: colY, w: col1W, h: colH, fill: { color: cCardBg }, line: { color: cBorder, width: 1 }, rectRadius: 0.05 });
      slide.addText('01 / THE CONTEXT', { x: col1X + 0.2, y: colY + 0.2, w: col1W - 0.4, h: 0.3, fontSize: 12, bold: true, color: cTheme, fontFace: fFace });
      slide.addText('Challenges Addressed', { x: col1X + 0.2, y: colY + 0.7, w: col1W - 0.4, h: 0.3, fontSize: 12, bold: true, color: cTextDark, fontFace: fFace });
      const chalArr = challenges
        ? challenges.split('\n').filter(k => k.trim() !== '').map(c => ({ text: c.replace('•', '').trim(), options: { bullet: true, color: cTextMuted, fontFace: fFace } }))
        : [{ text: 'None specified', options: { bullet: true, color: cTextMuted, fontFace: fFace } }];
      slide.addText(chalArr, { x: col1X + 0.3, y: colY + 1.0, w: col1W - 0.6, h: 1.8, fontSize: 11, valign: 'top' });
      slide.addShape(pptx.shapes.LINE, { x: col1X + 0.2, y: colY + 3.0, w: col1W - 0.4, h: 0, line: { color: cBorder, width: 1 } });
      slide.addText('Target KPIs', { x: col1X + 0.2, y: colY + 3.2, w: col1W - 0.4, h: 0.3, fontSize: 12, bold: true, color: cTextDark, fontFace: fFace });
      const kpiArr = kpis
        ? kpis.split('\n').filter(k => k.trim() !== '').map(k => ({ text: k.replace('•', '').trim(), options: { bullet: true, color: cTextMuted, fontFace: fFace } }))
        : [{ text: 'None specified', options: { bullet: true, color: cTextMuted, fontFace: fFace } }];
      slide.addText(kpiArr, { x: col1X + 0.3, y: colY + 3.5, w: col1W - 0.6, h: 1.5, fontSize: 11, valign: 'top' });

      const col2X = 4.6; const col2W = 4.2;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: col2X, y: colY, w: col2W, h: colH, fill: { color: cCardBg }, line: { color: cBorder, width: 1 }, rectRadius: 0.05 });
      slide.addText('02 / THE SOLUTION', { x: col2X + 0.2, y: colY + 0.2, w: col2W - 0.4, h: 0.3, fontSize: 12, bold: true, color: cTheme, fontFace: fFace });
      slide.addText('Effort Automation Shift', { x: col2X, y: colY + 0.7, w: col2W, h: 0.3, fontSize: 12, bold: true, color: cTextDark, align: 'center', fontFace: fFace });
      slide.addChart(pptx.charts.DOUGHNUT, [{ name: 'Effort', labels: ['Automated', 'Manual'], values: [Number(automationPercent), 100 - Number(automationPercent)] }], { x: col2X + 0.85, y: colY + 1.1, w: 2.5, h: 2.0, holeSize: 65, showLegend: true, legendPos: 'b', legendFontSize: 10, showLabel: false, chartColors: [cTheme, 'CBD5E1'], dataBorder: { pt: 0 } });
      slide.addText(`${automationPercent}%`, { x: col2X + 0.85, y: colY + 1.1, w: 2.5, h: 1.7, align: 'center', valign: 'middle', fontSize: 24, bold: true, color: cTheme, fontFace: fFace });
      slide.addShape(pptx.shapes.LINE, { x: col2X + 0.2, y: colY + 3.3, w: col2W - 0.4, h: 0, line: { color: cBorder, width: 1 } });
      slide.addText('Monthly Cost Reduction', { x: col2X + 0.2, y: colY + 3.5, w: col2W - 0.4, h: 0.3, fontSize: 11, bold: true, color: cTextMuted, fontFace: fFace });
      slide.addText(`${formatCurrency(results.currentMonthlyCost)}  →  ${formatCurrency(results.futureMonthlyCostAvg)}`, { x: col2X + 0.2, y: colY + 3.8, w: col2W - 0.4, h: 0.4, fontSize: 18, bold: true, color: cTextDark, fontFace: fFace });
      slide.addText('Capacity Shift (FTEs)', { x: col2X + 0.2, y: colY + 4.3, w: col2W - 0.4, h: 0.3, fontSize: 11, bold: true, color: cTextMuted, fontFace: fFace });
      const maxFteW = col2W - 0.6;
      const currentFte = results.currentFte || 1;
      const futureFteW = (results.toBeFte / currentFte) * maxFteW;
      slide.addShape(pptx.shapes.RECTANGLE, { x: col2X + 0.3, y: colY + 4.7, w: maxFteW, h: 0.3, fill: { color: 'E2E8F0' } });
      slide.addShape(pptx.shapes.RECTANGLE, { x: col2X + 0.3, y: colY + 4.7, w: Math.max(futureFteW, 0.05), h: 0.3, fill: { color: cTheme } });
      slide.addText(`${results.currentFte.toFixed(1)} FTEs As-Is`, { x: col2X + 0.3, y: colY + 4.7, w: maxFteW, h: 0.3, fontSize: 9, color: cTextMuted, align: 'right', valign: 'middle', pr: 0.1, fontFace: fFace });

      const col3X = 9.0; const col3W = 3.8;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: col3X, y: colY, w: col3W, h: colH, fill: { color: cTheme, transparency: 95 }, line: { color: cTheme, width: 2 }, rectRadius: 0.05 });
      slide.addText('03 / FINANCIAL IMPACT', { x: col3X + 0.2, y: colY + 0.2, w: col3W - 0.4, h: 0.3, fontSize: 12, bold: true, color: cTheme, fontFace: fFace });
      const impactMetrics = [
        { label: 'LIFETIME NET SAVINGS', value: formatCurrency(results.netSavings) },
        { label: 'RETURN ON INVESTMENT (ROI)', value: results.roi === Infinity ? '>1000%' : `${Math.round(results.roi).toLocaleString()}%` },
        { label: 'PAYBACK PERIOD', value: results.paybackPeriod === Infinity ? 'Never' : `${results.paybackPeriod.toFixed(1)} months` },
        { label: 'CAPACITY RECAPTURED', value: `${results.fteSavings.toFixed(1)} FTEs/mo` }
      ];
      let currentY = colY + 0.8;
      impactMetrics.forEach((metric, i) => {
        slide.addText(metric.label, { x: col3X + 0.3, y: currentY, w: col3W - 0.6, h: 0.3, fontSize: 11, bold: true, color: cTextMuted, fontFace: fFace });
        slide.addText(metric.value, { x: col3X + 0.3, y: currentY + 0.3, w: col3W - 0.6, h: 0.6, fontSize: 28, bold: true, color: cTextDark, fontFace: fFace });
        if (i < 3) {
          slide.addShape(pptx.shapes.LINE, { x: col3X + 0.3, y: currentY + 1.0, w: col3W - 0.6, h: 0, line: { color: cTheme, width: 1, transparency: 80 } });
          currentY += 1.15;
        }
      });

      await pptx.writeFile({ fileName: `${sanitizeFilename(toolName) || 'Automation'} Automation 1 Slider.pptx` });
    } catch (e) {
      if (addToast) addToast('Failed to generate PPTX file. Please try again.', 'error');
    } finally {
      setIsExportingPPTX(false);
    }
  }, [
    isReadyToExport, toolName, useCase, challenges, qualitativeBenefits, kpis, results,
    formatCurrency, scenario, automationPercent, setIsExportingPPTX
  ]);

  return { isReadyToExport, handleExportXLSX, handleExportPPTX };
}
