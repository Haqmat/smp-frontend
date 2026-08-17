import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSaleByReceipt } from '@/api/sales';
import type { Sale } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { CaretLeft, Printer, CheckCircle, Prohibit } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const SaleDetailPage: React.FC = () => {
  const { receiptNumber } = useParams<{ receiptNumber: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSale = async () => {
      if (!receiptNumber) return;
      try {
        setLoading(true);
        const res = await getSaleByReceipt(receiptNumber);
        if (res.success) {
          setSale(res.data);
        }
      } catch {
        toast.error('Failed to load sale details');
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [receiptNumber]);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A3E2B]" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-foreground">Receipt Not Found</h3>
        <Button onClick={() => navigate('/sales')} className="mt-4 rounded-xl bg-[#5A3E2B]">
          Back to Sales List
        </Button>
      </div>
    );
  }

  const isVoided = (sale as any).status === 'VOIDED';

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 print:max-w-none print:m-0 print:p-0">
      {/* Non-printable Action Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-6 print:hidden">
        <button
          onClick={() => navigate('/sales')}
          className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:text-foreground transition-colors"
        >
          <CaretLeft size={16} />
          Back to Sales List
        </button>
        <Button
          onClick={() => window.print()}
          className="rounded-xl bg-[#5A3E2B] hover:bg-[#5a3d09] text-white flex items-center gap-2 h-11 px-5 shadow-sm"
        >
          <Printer size={18} />
          Print Receipt
        </Button>
      </div>

      {/* Printable Receipt Paper Card */}
      <div className="bg-card p-8 rounded-2xl border border-border shadow-md space-y-6 print:shadow-none print:border-none">
        {/* Receipt Header */}
        <div className="flex justify-between items-start border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#5A3E2B] flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <h1 className="text-2xl font-bold text-[#5A3E2B]">Haqmat Manufacturing PLC</h1>
            </div>
            <p className="text-sm text-gray-500">TIN: 0001234567 | Addis Ababa, Ethiopia</p>
            <p className="text-sm text-gray-500">Official Sales Cash Voucher / Tax Invoice</p>
          </div>

          <div className="text-right space-y-1">
            <h2 className="text-xl font-bold text-foreground">
              {sale.manual_receipt_number}
            </h2>
            <p className="text-sm text-gray-500">Date (E.C.): <span className="font-semibold text-foreground">{sale.sale_date_ethiopian}</span></p>
            <p className="text-sm text-gray-500">Date (G.C.): <span className="font-semibold text-foreground">{sale.sale_date_gregorian}</span></p>
            {isVoided ? (
              <Badge variant="destructive" className="mt-2 text-xs font-bold uppercase">
                <Prohibit className="mr-1 inline" /> VOIDED
              </Badge>
            ) : (
              <Badge variant="outline" className="mt-2 text-xs font-bold text-green-700 bg-green-50 border-green-200">
                <CheckCircle className="mr-1 inline" /> PAID / ISSUED
              </Badge>
            )}
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-muted/40 p-4 rounded-xl flex justify-between text-base">
          <div>
            <span className="text-gray-500 block text-xs uppercase font-semibold">Billed To</span>
            <span className="font-bold text-foreground text-lg">{sale.customer_name}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 block text-xs uppercase font-semibold">Customer TIN</span>
            <span className="font-semibold text-foreground">{sale.customer_tin || 'N/A'}</span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/20/75 dark:bg-muted/50 border-b border-border">
              <TableRow>
                <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item Description</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Qty (kg)</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Unit Price</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total (Excl. VAT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.line_items.map((item) => (
                <TableRow key={item.id} className="border-b border-border/50">
                  <TableCell className="px-4 py-3 font-medium text-foreground">{item.product.name}</TableCell>
                  <TableCell className="px-4 py-3 text-right text-foreground">{formatNumber(item.quantity)}</TableCell>
                  <TableCell className="px-4 py-3 text-right text-foreground">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="px-4 py-3 text-right font-semibold text-foreground">
                    {formatCurrency(item.line_total_before_vat)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-72 space-y-2 text-base">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-semibold text-foreground">{formatCurrency(sale.financial_summary.sub_total_before_vat)}</span>
            </div>
            {sale.financial_summary.extra_fee_amount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Extra Fee ({sale.financial_summary.extra_fee_description || 'Fee'}):</span>
                <span className="font-semibold text-foreground">{formatCurrency(sale.financial_summary.extra_fee_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Amount Before VAT:</span>
              <span className="font-semibold text-foreground">{formatCurrency(sale.financial_summary.amount_before_vat)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT (15%):</span>
              <span className="font-semibold text-[#5A3E2B]">{formatCurrency(sale.financial_summary.vat_amount)}</span>
            </div>

            <div className="border-t border-border pt-2 flex justify-between text-lg font-bold text-foreground">
              <span>Grand Total:</span>
              <span className="text-[#5A3E2B]">{formatCurrency(sale.financial_summary.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Signatures */}
        <div className="border-t border-gray-100 border-border pt-6 mt-8 grid grid-cols-2 gap-8 text-sm">
          <div>
            <span className="font-semibold text-foreground block mb-1">Cashier / Issued By:</span>
            <p className="text-gray-500">{sale.created_by.full_name} (@{sale.created_by.username})</p>
          </div>
          <div className="text-right">
            <span className="font-semibold text-foreground block mb-1">Customer Signature:</span>
            <div className="h-10 border-b border-dashed border-gray-300 w-48 ml-auto mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailPage;
