import React, { useRef, useState } from 'react';
import { X, Download, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Toast';

const ROWS_PER_PAGE = 12;

export default function MonthlyBreakdownModal() {
  const {
    isDarkMode, textHeading, textSub, borderMuted, setIsMonthlyBreakdownOpen,
    results, formatCurrency, toolName, scenario, durationMonths
  } = useApp();

  const addToast = useToast();
  const [page, setPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const data = results.monthlyData.slice(1); // skip month 0 (implementation row)
  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const pageData = data.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const scenarioColor = {
    optimistic: isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark',
    realistic: isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark',
    conservative: isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark',
  }[scenario] || 'text-accenture-purple';

  const totalGross = data.reduce((s, r) => s + r.grossSavings, 0);
  const totalRun = data.reduce((s, r) => s + r.runCost, 0);
  const totalSre = data.reduce((s, r) => s + r.sreCost, 0);
  const totalNet = data.reduce((s, r) => s + r.netCashFlow, 0);
  const finalCumulative = data[data.length - 1]?.cumulativeNet ?? 0;
  const implCost = results.monthlyData[0]?.implementationCost ?? 0;

  const handleExportXLSX = async () => {
    setIsExporting(true);
    try {
      const xlsxModule = await import('xlsx-js-style');
      const XLSX = xlsxModule.default || xlsxModule;

      const wb = XLSX.utils.book_new();

      // --- Styles ---
      const headerStyle = {
        fill: { fgColor: { rgb: '1E3A8A' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: { bottom: { style: 'medium', color: { rgb: '3B82F6' } } }
      };
      const subHeaderStyle = {
        fill: { fgColor: { rgb: '1E40AF' } },
        font: { color: { rgb: 'DBEAFE' }, bold: true, sz: 10 },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
      const numStyle = (color = '0F172A', bold = false) => ({
        font: { color: { rgb: color }, bold, sz: 10 },
        alignment: { horizontal: 'right', vertical: 'center' },
        border: { bottom: { style: 'thin', color: { rgb: 'E2E8F0' } } }
      });
      const centerStyle = (color = '64748B', bold = false) => ({
        font: { color: { rgb: color }, bold, sz: 10 },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: { bottom: { style: 'thin', color: { rgb: 'E2E8F0' } } }
      });
      const totalStyle = (color = '0F172A') => ({
        fill: { fgColor: { rgb: 'EFF6FF' } },
        font: { color: { rgb: color }, bold: true, sz: 11 },
        alignment: { horizontal: 'right', vertical: 'center' },
        border: {
          top: { style: 'medium', color: { rgb: '3B82F6' } },
          bottom: { style: 'medium', color: { rgb: '3B82F6' } }
        }
      });
      const paybackStyle = {
        fill: { fgColor: { rgb: 'D1FAE5' } },
        font: { color: { rgb: '065F46' }, bold: true, sz: 10 },
        alignment: { horizontal: 'right', vertical: 'center' },
        border: { bottom: { style: 'thin', color: { rgb: 'A7F3D0' } } }
      };

      // --- Sheet 1: Monthly Breakdown ---
      const scenarioLabel = scenario.charAt(0).toUpperCase() + scenario.slice(1);
      const titleRow = [`Monthly Cash Flow — ${toolName || 'Automation Project'} | ${scenarioLabel} Scenario | ${durationMonths} Months`];
      const blankRow = [''];
      const colHeaders = ['Month', 'Year', 'Gross Savings', 'Run Cost', 'SRE Cost', 'Net Cash Flow', 'Cumulative Net'];

      const wsData = [titleRow, blankRow, colHeaders];

      let paybackFound = false;
      data.forEach((row, i) => {
        const isPayback = !paybackFound && row.cumulativeNet > 0;
        if (isPayback) paybackFound = true;
        wsData.push([
          row.month,
          `Y${row.year}`,
          row.grossSavings,
          row.runCost,
          row.sreCost,
          row.netCashFlow,
          row.cumulativeNet,
          isPayback ? '← PAYBACK' : ''
        ]);
      });

      // Totals row
      wsData.push([
        'TOTAL', '',
        totalGross, totalRun, totalSre, totalNet, finalCumulative, ''
      ]);

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Merge title across all columns
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

      // Apply title style
      if (ws['A1']) ws['A1'].s = {
        fill: { fgColor: { rgb: '0F172A' } },
        font: { color: { rgb: '93C5FD' }, bold: true, sz: 13 },
        alignment: { horizontal: 'left', vertical: 'center' }
      };

      // Apply column header styles (row 3 = index 2)
      colHeaders.forEach((_, ci) => {
        const cellRef = XLSX.utils.encode_cell({ r: 2, c: ci });
        if (ws[cellRef]) ws[cellRef].s = headerStyle;
      });

      // Apply data row styles
      paybackFound = false;
      data.forEach((row, i) => {
        const r = i + 3; // offset: title + blank + header
        const isPayback = !paybackFound && row.cumulativeNet > 0;
        if (isPayback) paybackFound = true;
        const rowBg = i % 2 === 0 ? 'FFFFFF' : 'F8FAFC';

        const applyCell = (c, style) => {
          const ref = XLSX.utils.encode_cell({ r, c });
          if (ws[ref]) ws[ref].s = style;
        };

        if (isPayback) {
          [0,1,2,3,4,5,6].forEach(c => applyCell(c, paybackStyle));
          const payRef = XLSX.utils.encode_cell({ r, c: 7 });
          if (ws[payRef]) ws[payRef].s = { ...paybackStyle, font: { ...paybackStyle.font, color: { rgb: '059669' } } };
        } else {
          applyCell(0, centerStyle('64748B', true));
          applyCell(1, centerStyle('94A3B8'));
          applyCell(2, numStyle('10B981'));
          applyCell(3, { ...numStyle('64748B'), fill: { fgColor: { rgb: rowBg } } });
          applyCell(4, { ...numStyle('64748B'), fill: { fgColor: { rgb: rowBg } } });
          applyCell(5, numStyle(row.netCashFlow >= 0 ? '10B981' : 'EF4444', true));
          applyCell(6, numStyle(row.cumulativeNet >= 0 ? '10B981' : '334155', true));
        }
      });

      // Totals row
      const totalRow = data.length + 3;
      ['A','B','C','D','E','F','G'].forEach((col, ci) => {
        const ref = `${col}${totalRow + 1}`;
        if (ws[ref]) {
          const colors = ['0F172A', '0F172A', '10B981', '64748B', '64748B',
            totalNet >= 0 ? '10B981' : 'EF4444',
            finalCumulative >= 0 ? '10B981' : 'EF4444'];
          ws[ref].s = totalStyle(colors[ci]);
        }
      });

      // Column widths
      ws['!cols'] = [
        { wch: 8 }, { wch: 6 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
        { wch: 16 }, { wch: 16 }, { wch: 12 }
      ];
      ws['!rows'] = [{ hpt: 28 }, { hpt: 6 }, { hpt: 22 }];

      XLSX.utils.book_append_sheet(wb, ws, 'Monthly Breakdown');

      // --- Sheet 2: Summary ---
      const summaryData = [
        ['SUMMARY'],
        [''],
        ['Project', toolName || 'N/A'],
        ['Scenario', scenarioLabel],
        ['Duration', `${durationMonths} months`],
        [''],
        ['COSTS', ''],
        ['Implementation Cost', implCost],
        ['Total Run Costs', totalRun],
        ['Total SRE Costs', totalSre],
        ['Total Investment', implCost + totalRun + totalSre],
        [''],
        ['RETURNS', ''],
        ['Total Gross Savings', totalGross],
        ['Lifetime Net Savings', finalCumulative],
        ['ROI', results.roi === Infinity ? '>1000%' : `${Math.round(results.roi)}%`],
        ['Payback Period', results.paybackPeriod === Infinity ? 'Never' : `${results.paybackPeriod.toFixed(1)} months`],
        ['FTE Savings / Mo', results.fteSavings.toFixed(1)],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 24 }, { wch: 20 }];
      if (wsSummary['A1']) wsSummary['A1'].s = {
        fill: { fgColor: { rgb: '0F172A' } },
        font: { color: { rgb: '93C5FD' }, bold: true, sz: 14 },
        alignment: { horizontal: 'left' }
      };
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      const safeName = (toolName || 'Automation').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
      XLSX.writeFile(wb, `${safeName} Monthly Breakdown.xlsx`);
    } catch (e) {
      console.error('XLSX export failed:', e);
      addToast('Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="breakdown-modal-title"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
    >
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-accenture-gray-dark' : 'bg-white border-accenture-gray-light'} rounded-none shadow-2xl w-full max-w-5xl border flex flex-col max-h-[92vh] overflow-hidden`}>

        {/* Header */}
        <div className={`${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light'} border-b px-6 py-4 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`${isDarkMode ? 'bg-accenture-purple/20' : 'bg-accenture-purple-lightest'} p-2 `}>
              <BarChart3 size={18} className={isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark'} />
            </div>
            <div>
              <h2 id="breakdown-modal-title" className={`text-lg font-bold ${textHeading}`}>Monthly Cash Flow Breakdown</h2>
              <p className={`text-xs font-medium ${textSub}`}>
                {toolName || 'Automation Project'} ·{' '}
                <span className={scenarioColor}>{scenario.charAt(0).toUpperCase() + scenario.slice(1)}</span>
                {' '}· {durationMonths} months
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportXLSX}
              disabled={isExporting}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5  transition-all shadow-sm ${isDarkMode ? 'bg-accenture-purple-dark hover:bg-accenture-purple-dark text-white' : 'bg-accenture-purple-dark hover:bg-accenture-purple-dark text-white'} disabled:opacity-60`}
            >
              <Download size={14} />
              {isExporting ? 'Exporting...' : 'Export XLSX'}
            </button>
            <button
              onClick={() => setIsMonthlyBreakdownOpen(false)}
              className={`${isDarkMode ? 'text-accenture-gray-dark hover:text-white hover:bg-[#0a0a0a]' : 'text-accenture-gray-dark hover:text-black hover:bg-accenture-gray-off-white'} p-2 rounded-full transition-colors`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className={`px-6 py-4 grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0 border-b ${borderMuted}`}>
          {[
            { label: 'Impl. Cost', value: formatCurrency(implCost), color: 'text-accenture-pink' },
            { label: 'Gross Savings', value: formatCurrency(totalGross), color: 'text-accenture-purple' },
            { label: 'Run Costs', value: formatCurrency(totalRun), color: isDarkMode ? 'text-accenture-gray-light' : 'text-accenture-gray-dark' },
            { label: 'SRE Costs', value: formatCurrency(totalSre), color: isDarkMode ? 'text-accenture-gray-light' : 'text-accenture-gray-dark' },
            { label: 'Lifetime Net', value: formatCurrency(finalCumulative), color: finalCumulative >= 0 ? 'text-accenture-purple' : 'text-accenture-pink' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${isDarkMode ? 'bg-[#0F172A]' : 'bg-accenture-gray-off-white'}  px-4 py-3 border ${borderMuted}`}>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${textSub} mb-1`}>{label}</div>
              <div className={`text-sm font-extrabold ${color} tracking-tight`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-sm border-collapse">
            <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-accenture-gray-off-white'}`}>
              <tr>
                {['Mo', 'Yr', 'Gross Savings', 'Run Cost', 'SRE Cost', 'Net Cash Flow', 'Cumulative Net'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest ${textSub} border-b-2 ${isDarkMode ? 'border-accenture-purple/50' : 'border-accenture-purple'} ${i < 2 ? 'text-center' : 'text-right'} whitespace-nowrap`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, i) => {
                const net = row.netCashFlow;
                const cum = row.cumulativeNet;
                const globalIndex = page * ROWS_PER_PAGE + i;
                const prevCum = globalIndex > 0 ? (data[globalIndex - 1]?.cumulativeNet ?? -1) : -implCost;
                const isPaybackRow = cum >= 0 && prevCum < 0;

                return (
                  <tr
                    key={row.month}
                    className={`transition-colors
                      ${isPaybackRow
                        ? (isDarkMode ? 'bg-emerald-950/40' : 'bg-accenture-purple-lightest')
                        : i % 2 === 0
                          ? (isDarkMode ? 'bg-[#1E293B]' : 'bg-white')
                          : (isDarkMode ? 'bg-[#162032]' : 'bg-accenture-gray-off-white/60')
                      }
                      ${isDarkMode ? 'hover:bg-[#1a1a1a]/40' : 'hover:bg-accenture-purple-lightest/40'}
                    `}
                  >
                    <td className={`px-4 py-3 text-center border-b ${borderMuted}`}>
                      <span className={`inline-flex items-center justify-center w-7 h-7  text-xs font-extrabold ${isDarkMode ? 'bg-[#0a0a0a] text-accenture-gray-light' : 'bg-accenture-gray-off-white text-accenture-gray-dark'}`}>
                        {row.month}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center text-xs font-bold ${textSub} border-b ${borderMuted}`}>
                      Y{row.year}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold text-accenture-purple border-b ${borderMuted} tabular-nums`}>
                      {formatCurrency(row.grossSavings)}
                    </td>
                    <td className={`px-4 py-3 text-right ${textSub} border-b ${borderMuted} tabular-nums`}>
                      {row.runCost > 0 ? formatCurrency(row.runCost) : <span className="opacity-30">—</span>}
                    </td>
                    <td className={`px-4 py-3 text-right ${textSub} border-b ${borderMuted} tabular-nums`}>
                      {row.sreCost > 0 ? formatCurrency(row.sreCost) : <span className="opacity-30">—</span>}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold border-b ${borderMuted} tabular-nums ${net >= 0 ? 'text-accenture-purple' : 'text-accenture-pink'}`}>
                      <span className="inline-flex items-center justify-end gap-1">
                        {net >= 0 ? <TrendingUp size={13} className="opacity-70" /> : <TrendingDown size={13} className="opacity-70" />}
                        {formatCurrency(net)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-extrabold border-b ${borderMuted} tabular-nums`}>
                      <span className={`inline-flex items-center justify-end gap-2 ${cum >= 0 ? 'text-accenture-purple' : isDarkMode ? 'text-accenture-gray-light' : 'text-accenture-gray-dark'}`}>
                        {isPaybackRow && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5  ${isDarkMode ? 'bg-accenture-purple-dark/60 text-accenture-purple' : 'bg-accenture-purple-lightest text-accenture-purple-dark'}`}>
                            PAYBACK
                          </span>
                        )}
                        {formatCurrency(cum)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-6 py-4 border-t ${borderMuted} flex items-center justify-between shrink-0 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-accenture-gray-off-white'}`}>
            <span className={`text-xs font-bold ${textSub}`}>
              Page {page + 1} of {totalPages} · {data.length} months total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className={`p-2  transition-colors disabled:opacity-30 ${isDarkMode ? 'hover:bg-[#0a0a0a] text-accenture-gray-light' : 'hover:bg-accenture-gray-off-white text-accenture-gray-dark'}`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8  text-xs font-bold transition-colors ${
                    page === i
                      ? 'bg-accenture-purple text-white'
                      : (isDarkMode ? 'hover:bg-[#0a0a0a] text-accenture-gray-dark' : 'hover:bg-accenture-gray-off-white text-accenture-gray-dark')
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className={`p-2  transition-colors disabled:opacity-30 ${isDarkMode ? 'hover:bg-[#0a0a0a] text-accenture-gray-light' : 'hover:bg-accenture-gray-off-white text-accenture-gray-dark'}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
