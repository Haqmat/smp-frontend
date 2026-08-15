import React, { useState, useEffect } from 'react';
import { getAnnualSalesReport, exportReport } from '@/api/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { FilePdf, FileXls, Calendar } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const AnnualSalesReportPage: React.FC = () => {
  const [fiscalYear, setFiscalYear] = useState<number>(2018);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getAnnualSalesReport({ fiscal_year: fiscalYear });
      if (res.success) {
        setReportData(res.data);
      }
    } catch {
      toast.error('Failed to load annual sales report');
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
      const blob = await exportReport('annual-sales', { fiscal_year: fiscalYear, format });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Annual_Sales_Report_${fiscalYear}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported report as ${format.toUpperCase()}`);
    } catch {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:m-0 print:p-0 print:max-w-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-6 print:hidden">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Annual Sales Report
          </h1>
          <p className="text-base text-gray-500">
            Comprehensive sales breakdown and VAT audit trail for the Ethiopian Fiscal Year.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Picker */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="text-[#a38413] w-5 h-5" />
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
            <FileXls size={20} className="text-green-600" />
            Excel
          </Button>

          <Button
            onClick={() => handleExport('pdf')}
            className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white flex items-center gap-2 h-11 px-4 shadow-sm"
            disabled={exporting}
          >
            <FilePdf size={20} />
            PDF Export
          </Button>
        </div>
      </div>

      {loading || !reportData ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a38413]" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Report Paper View */}
          <Card className="rounded-2xl border-border shadow-md bg-card print:shadow-none print:border-none p-6">
            <CardContent className="space-y-6 p-0">
              {/* Header Details */}
              <div className="flex justify-between items-start border-b border-border pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#a38413]">{reportData.report_metadata.company_name}</h2>
                  <p className="text-sm text-gray-500">TIN: {reportData.report_metadata.company_tin}</p>
                  <p className="text-base font-bold text-foreground mt-2">
                    Annual Sales Register - Fiscal Year {reportData.report_metadata.fiscal_year}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Period: <span className="font-semibold text-foreground">{reportData.report_metadata.period_ethiopian}</span></p>
                  <p>Generated: {new Date(reportData.report_metadata.generated_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Grand Totals Widget */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-muted/40 p-4 rounded-xl">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Total Flour Sold</span>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {formatNumber(reportData.grand_totals.total_quantity_all_kg)} kg
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Revenue (Excl. VAT)</span>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {formatCurrency(reportData.grand_totals.total_revenue_before_vat)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">VAT (15%)</span>
                  <p className="text-xl font-bold text-[#a38413] mt-1">
                    {formatCurrency(reportData.grand_totals.total_vat)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Total Revenue (Inc. VAT)</span>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {formatCurrency(reportData.grand_totals.total_revenue_including_vat)}
                  </p>
                </div>
              </div>

              {/* Summary by Flour Type */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Product Summary</h3>
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="px-4 py-3 font-semibold text-gray-500">Product Name</TableHead>
                      <TableHead className="px-4 py-3 font-semibold text-gray-500 text-right">Quantity Sold (kg)</TableHead>
                      <TableHead className="px-4 py-3 font-semibold text-gray-500 text-right">Total Revenue (Excl. VAT)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.summary_by_flour_type.map((item: any, idx: number) => (
                      <TableRow key={idx} className="border-b border-border/50">
                        <TableCell className="px-4 py-3 font-medium text-foreground">{item.product_name}</TableCell>
                        <TableCell className="px-4 py-3 text-right">{formatNumber(item.quantity_sold)} kg</TableCell>
                        <TableCell className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(item.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Detailed Sales Audit Register */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Sales Register Details</h3>
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Receipt No.</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer Name</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date (E.C.)</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Before VAT</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">VAT 15%</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.detailed_sales.map((sale: any, idx: number) => (
                      <TableRow key={idx} className="border-b border-border/50">
                        <TableCell className="px-4 py-3 font-semibold text-foreground">{sale.manual_receipt_number}</TableCell>
                        <TableCell className="px-4 py-3 text-foreground">{sale.customer_name}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600">{sale.sale_date_ethiopian}</TableCell>
                        <TableCell className="px-4 py-3 text-right">{formatCurrency(sale.financial_summary.amount_before_vat)}</TableCell>
                        <TableCell className="px-4 py-3 text-right">{formatCurrency(sale.financial_summary.vat_amount)}</TableCell>
                        <TableCell className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(sale.financial_summary.total_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnnualSalesReportPage;
