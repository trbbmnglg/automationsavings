import React, { useRef, useState } from 'react';
import { X, Download, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ROWS_PER_PAGE = 12;

export default function MonthlyBreakdownModal() {
  const {
    isDarkMode, textHeading, textSub, borderMuted, setIsMonthlyBreakdownOpen,
    results, formatCurrency, toolName, scenario, durationMonths
  } = useApp();

  const tableRef = useRef(null);
  const [page, setPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const data = results.monthlyData.slice(1); // skip month 0 (implementation row)
  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const pageData = data.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const scenarioColor = {
    optimistic: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
    realistic: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    conservative: isDarkMode ? 'text-amber-400' : 'text-amber-600',
  }[scenario] || 'text-blue-400';

  // Summary stats
  const totalGross = data.reduce((s, r) => s + r.grossSavings, 0);
  const totalRun = data.reduce((s, r) => s + r.runCost, 0);
  const totalSre = data.reduce((s, r) => s + r.sreCost, 0);
  const finalCumulative = data[data.length - 1]?.cumulativeNet ?? 0;
  const implCost = results.monthlyData[0]?.implementationCost ?? 0;

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      // Dynamically import html2canvas-like approach using canvas
      const node = tableRef.current;
      if (!node) return;

      // Use the browser's built-in print/screenshot via a hidden iframe with full table
      const allRows = results.monthlyData.slice(1);

      const bg = isDarkMode ? '#1E293B' : '#FFFFFF';
      const textColor = isDarkMode ? '#E2E8F0' : '#0F172A';
      const mutedColor = isDarkMode ? '#64748B' : '#94A3B8';
      const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
      const headerBg = isDarkMode ? '#0F172A' : '#F8FAFC';
      const posColor = '#10B981';
      const negColor = '#EF4444';
      const accentColor = isDarkMode ? '#3B82F6' : '#2563EB';

      const rowsHtml = allRows.map((row, i) => {
        const net = row.netCashFlow;
        const cum = row.cumulativeNet;
        const netColor = net >= 0 ? posColor : negColor;
        const cumColor = cum >= 0 ? posColor : negColor;
        const rowBg = i % 2 === 0 ? (isDarkMode ? '#1E293B' : '#FFFFFF') : (isDarkMode ? '#162032' : '#F8FAFC');
        return `
          <tr style="background:${rowBg}">
            <td style="padding:8px 12px;text-align:center;font-weight:700;color:${mutedColor};border-bottom:1px solid ${borderColor}">${row.month}</td>
            <td style="padding:8px 12px;text-align:center;color:${mutedColor};border-bottom:1px solid ${borderColor}">Y${row.year}</td>
            <td style="padding:8px 12px;text-align:right;color:${posColor};font-weight:600;border-bottom:1px solid ${borderColor}">${formatCurrency(row.grossSavings)}</td>
            <td style="padding:8px 12px;text-align:right;color:${mutedColor};border-bottom:1px solid ${borderColor}">${formatCurrency(row.runCost)}</td>
            <td style="padding:8px 12px;text-align:right;color:${mutedColor};border-bottom:1px solid ${borderColor}">${formatCurrency(row.sreCost)}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${netColor};border-bottom:1px solid ${borderColor}">${formatCurrency(net)}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:800;color:${cumColor};border-bottom:1px solid ${borderColor}">${formatCurrency(cum)}</td>
          </tr>`;
      }).join('');

      const html = `
        <html>
        <head>
          <meta charset="UTF-8"/>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: ${bg}; font-family: "Aptos Display", system-ui, sans-serif; padding: 32px; }
            .header { margin-bottom: 24px; }
            .title { font-size: 22px; font-weight: 800; color: ${textColor}; }
            .subtitle { font-size: 13px; color: ${mutedColor}; margin-top: 4px; }
            .summary { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
            .stat { background: ${headerBg}; border: 1px solid ${borderColor}; border-radius: 12px; padding: 14px 20px; flex: 1; min-width: 140px; }
            .stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${mutedColor}; margin-bottom: 4px; }
            .stat-value { font-size: 18px; font-weight: 800; color: ${textColor}; }
            .impl { font-size: 11px; color: ${mutedColor}; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            thead tr { background: ${headerBg}; }
            thead th { padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${mutedColor}; border-bottom: 2px solid ${accentColor}; }
            thead th:first-child, thead th:nth-child(2) { text-align: center; }
            .footer { margin-top: 16px; font-size: 11px; color: ${mutedColor}; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">📊 Monthly Cash Flow — ${toolName || 'Automation Project'}</div>
            <div class="subtitle">Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)} · ${durationMonths} Month Project · Generated ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="summary">
            <div class="stat">
              <div class="stat-label">Implementation Cost</div>
              <div class="stat-value" style="color:${negColor}">${formatCurrency(implCost)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Gross Savings</div>
              <div class="stat-value" style="color:${posColor}">${formatCurrency(totalGross)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Run Costs</div>
              <div class="stat-value">${formatCurrency(totalRun)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total SRE Costs</div>
              <div class="stat-value">${formatCurrency(totalSre)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Lifetime Net</div>
              <div class="stat-value" style="color:${finalCumulative >= 0 ? posColor : negColor}">${formatCurrency(finalCumulative)}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="text-align:center">Mo</th>
                <th style="text-align:center">Yr</th>
                <th>Gross Savings</th>
                <th>Run Cost</th>
                <th>SRE Cost</th>
                <th>Net Cash Flow</th>
                <th>Cumulative Net</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="footer">Automation Savings Calculator · automationsavings.pages.dev</div>
        </body>
        </html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank', 'width=900,height=700');
      if (win) {
        win.onload = () => {
          setTimeout(() => {
            win.print();
            URL.revokeObjectURL(url);
          }, 500);
        };
      }
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="breakdown-modal-title"
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
    >
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'} rounded-[32px] shadow-2xl w-full max-w-5xl border flex flex-col max-h-[92vh] overflow-hidden`}>

        {/* Header */}
        <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-b px-6 py-4 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'} p-2 rounded-xl`}>
              <BarChart3 size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
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
              onClick={handleExportPNG}
              disabled={isExporting}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-sm ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} disabled:opacity-60`}
            >
              <Download size={14} />
              {isExporting ? 'Preparing...' : 'Export PNG'}
            </button>
            <button
              onClick={() => setIsMonthlyBreakdownOpen(false)}
              className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'} p-2 rounded-full transition-colors`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className={`px-6 py-4 grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0 border-b ${borderMuted}`}>
          {[
            { label: 'Impl. Cost', value: formatCurrency(implCost), color: 'text-red-400' },
            { label: 'Gross Savings', value: formatCurrency(totalGross), color: 'text-emerald-400' },
            { label: 'Run Costs', value: formatCurrency(totalRun), color: isDarkMode ? 'text-slate-300' : 'text-slate-600' },
            { label: 'SRE Costs', value: formatCurrency(totalSre), color: isDarkMode ? 'text-slate-300' : 'text-slate-600' },
            { label: 'Lifetime Net', value: formatCurrency(finalCumulative), color: finalCumulative >= 0 ? 'text-emerald-400' : 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'} rounded-2xl px-4 py-3 border ${borderMuted}`}>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${textSub} mb-1`}>{label}</div>
              <div className={`text-sm font-extrabold ${color} tracking-tight`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div ref={tableRef} className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-sm border-collapse">
            <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
              <tr>
                {['Mo', 'Yr', 'Gross Savings', 'Run Cost', 'SRE Cost', 'Net Cash Flow', 'Cumulative Net'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest ${textSub} border-b-2 ${isDarkMode ? 'border-blue-500/50' : 'border-blue-500'} ${i < 2 ? 'text-center' : 'text-right'} whitespace-nowrap`}
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
                const isPaybackRow = cum >= 0 && (i === 0 || (data[(page * ROWS_PER_PAGE) + i - 1]?.cumulativeNet ?? -1) < 0);
                return (
                  <tr
                    key={row.month}
                    className={`
                      transition-colors
                      ${isPaybackRow ? (isDarkMode ? 'bg-emerald-950/30' : 'bg-emerald-50') : ''}
                      ${!isPaybackRow && i % 2 === 0 ? (isDarkMode ? 'bg-[#1E293B]' : 'bg-white') : ''}
                      ${!isPaybackRow && i % 2 !== 0 ? (isDarkMode ? 'bg-[#162032]' : 'bg-slate-50/60') : ''}
                      hover:${isDarkMode ? 'bg-slate-700/40' : 'bg-blue-50/40'}
                    `}
                  >
                    <td className={`px-4 py-3 text-center font-extrabold ${textHeading} border-b ${borderMuted}`}>
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        {row.month}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center text-xs font-bold ${textSub} border-b ${borderMuted}`}>
                      Y{row.year}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold text-emerald-500 border-b ${borderMuted} tabular-nums`}>
                      {formatCurrency(row.grossSavings)}
                    </td>
                    <td className={`px-4 py-3 text-right ${textSub} border-b ${borderMuted} tabular-nums`}>
                      {row.runCost > 0 ? formatCurrency(row.runCost) : <span className="opacity-30">—</span>}
                    </td>
                    <td className={`px-4 py-3 text-right ${textSub} border-b ${borderMuted} tabular-nums`}>
                      {row.sreCost > 0 ? formatCurrency(row.sreCost) : <span className="opacity-30">—</span>}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold border-b ${borderMuted} tabular-nums ${net >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                      <span className="inline-flex items-center justify-end gap-1">
                        {net >= 0
                          ? <TrendingUp size={13} className="opacity-70" />
                          : <TrendingDown size={13} className="opacity-70" />}
                        {formatCurrency(net)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-extrabold border-b ${borderMuted} tabular-nums ${cum >= 0 ? 'text-emerald-400' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="inline-flex items-center justify-end gap-1">
                        {isPaybackRow && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${isDarkMode ? 'bg-emerald-900/60 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} mr-1`}>
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
          <div className={`px-6 py-4 border-t ${borderMuted} flex items-center justify-between shrink-0 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
            <span className={`text-xs font-bold ${textSub}`}>
              Page {page + 1} of {totalPages} · {data.length} months total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className={`p-2 rounded-xl transition-colors disabled:opacity-30 ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'}`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                    page === i
                      ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
                      : (isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500')
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className={`p-2 rounded-xl transition-colors disabled:opacity-30 ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'}`}
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
