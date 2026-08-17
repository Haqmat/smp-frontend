import React, { useState, useEffect } from 'react';
import { getProfitLossReport, exportReport } from '@/api/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { FilePdf, FileXls } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const ProfitLossReportPage: React.FC = () => {
  const [fiscalYear, setFiscalYear] = useState<number>(2018);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getProfitLossReport({ fiscal_year: fiscalYear });
      if (res.success) {
        setReportData(res.data);
      }
    } catch {
      toast.error('Failed to load profit and loss statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fiscalYear]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExporting(true);
      const blob = await exportReport('profit-loss', { fiscal_year: fiscalYear, format });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Profit_Loss_Statement_${fiscalYear}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported statement as ${format.toUpperCase()}`);
    } catch {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 print:m-0 print:p-0 print:max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-6 print:hidden">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Profit & Loss Statement
          </h1>
          <p className="text-base text-gray-500">
            Net income analysis comparing total revenue, COGS grain costs, and operating expenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Fiscal Year Picker */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(Number(e.target.value))}
              className="bg-transparent text-base font-bold text-foreground outline-none cursor-pointer"
            >
              <option value={2018}>2018 E.C.</option>
              <option value={2017}>2017 E.C.</option>
              <option value={2016}>2016 E.C.</option>
            </select>
          </div>

          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            className="rounded-xl flex items-center gap-2 h-11 px-4 border-border"
            disabled={exporting}
          >
            <FileXls size={20} className="text-green-700" />
            Excel
          </Button>

          <Button
            onClick={() => handleExport('pdf')}
            className="rounded-xl bg-[#5A3E2B] hover:bg-[#5a3d09] text-white flex items-center gap-2 h-11 px-4 shadow-sm"
            disabled={exporting}
          >
            <FilePdf size={20} />
            PDF Export
          </Button>
        </div>
      </div>

      {loading || !reportData ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A3E2B]" />
        </div>
      ) : (
        <Card className="rounded-2xl border-border shadow-md bg-card p-8 print:shadow-none print:border-none">
          <CardContent className="space-y-8 p-0">
            {/* Statement Title */}
            <div className="border-b border-border pb-6 text-center space-y-1">
              <h2 className="text-2xl font-bold text-[#5A3E2B]">{reportData.company_name}</h2>
              <h3 className="text-xl font-bold text-foreground">Profit and Loss Statement</h3>
              <p className="text-sm text-muted-foreground">Period: {reportData.period_ethiopian}</p>
            </div>

            {/* Income & Expense Financial Table */}
            <div className="space-y-6 text-base">
              {/* Revenue */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-foreground text-lg border-b border-border pb-2">
                  <span>Gross Sales Revenue (Excl. VAT)</span>
                  <span>{formatCurrency(reportData.revenue?.gross_sales_before_vat)}</span>
                </div>
              </div>

              {/* COGS */}
              <div className="space-y-2 pl-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Less: Cost of Goods Sold (Raw Grain Intake)</span>
                  <span className="text-red-500">({formatCurrency(reportData.cogs?.grain_cost)})</span>
                </div>
                <div className="flex justify-between items-center font-bold text-foreground text-base border-t border-border/50 pt-2">
                  <span>Gross Operating Profit</span>
                  <span>{formatCurrency(reportData.gross_profit)}</span>
                </div>
              </div>

              {/* Operating Expenses */}
              <div className="space-y-3 pl-4 border-t border-border pt-4">
                <span className="font-bold text-foreground block">Operating Expenses (OpEx)</span>
                {Object.entries(reportData.operating_expenses?.breakdown ?? {}).map(([cat, val]: [string, any]) => (
                  <div key={cat} className="flex justify-between text-muted-foreground text-sm">
                    <span className="capitalize">{cat.toLowerCase()} Expense:</span>
                    <span>{formatCurrency(val)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-foreground font-semibold border-t border-border/50 pt-2">
                  <span>Total Operating Expenses</span>
                  <span className="text-red-500">({formatCurrency(reportData.operating_expenses?.total)})</span>
                </div>
              </div>

              {/* Net Income Summary Banner */}
              <div className={`p-6 rounded-2xl flex items-center justify-between border ${(reportData.net_profit_loss ?? 0) >= 0
                ? 'bg-green-950/20 border-green-900/40'
                : 'bg-red-50 border-red-900/40'
                }`}>
                <div>
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Net Income / Profit (Loss)
                  </span>
                  <h3 className={`text-3xl font-bold mt-1 ${(reportData.net_profit_loss ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {formatCurrency(reportData.net_profit_loss)}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-sm font-semibold text-muted-foreground block">Net Margin</span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatPercentage(reportData.profit_margin_percentage)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfitLossReportPage;
