import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSales, voidSale } from '@/api/sales';
import type { Sale } from '@/types/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/data-display/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency } from '@/utils/formatters';
import { usePagination } from '@/hooks/usePagination';
import { Plus, Eye, Prohibit, Funnel, MagnifyingGlass, ShoppingCart, Coin, Receipt } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const SalesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { page, limit, setPage } = usePagination(10);

  // Filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [receiptSearch, setReceiptSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount] = useState('');
  const [maxAmount] = useState('');

  // Data states
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState({
    total_sales_count: 0,
    total_revenue: 0,
    total_vat_collected: 0,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Void Modal state
  const [selectedReceiptToVoid, setSelectedReceiptToVoid] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidLoading, setVoidLoading] = useState(false);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await listSales({
        page,
        limit,
        customer_name: customerSearch || undefined,
        receipt_number: receiptSearch || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        min_amount: minAmount ? Number(minAmount) : undefined,
        max_amount: maxAmount ? Number(maxAmount) : undefined,
      });
      if (res.success) {
        setSales(res.data.data);
        setSummary(res.data.summary);
        setTotalItems(res.data.pagination.total_items);
        setTotalPages(res.data.pagination.total_pages);
      }
    } catch {
      toast.error('Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, limit, customerSearch, receiptSearch, startDate, endDate, minAmount, maxAmount]);

  const handleVoidSale = async () => {
    if (!selectedReceiptToVoid || !voidReason) {
      toast.error('Please enter a void reason');
      return;
    }
    try {
      setVoidLoading(true);
      const res = await voidSale(selectedReceiptToVoid, voidReason);
      if (res.success) {
        toast.success(`Sale ${selectedReceiptToVoid} voided and stock reversed!`);
        setSelectedReceiptToVoid(null);
        setVoidReason('');
        fetchSales();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to void sale');
    } finally {
      setVoidLoading(false);
    }
  };

  const columns = [
    {
      header: 'Receipt No.',
      accessorKey: 'manual_receipt_number',
      cell: (row: Sale) => (
        <div>
          <span className="font-bold text-foreground block">{row.manual_receipt_number}</span>
          {(row as any).status === 'VOIDED' && (
            <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">VOIDED</span>
          )}
        </div>
      )
    },
    {
      header: 'Customer',
      accessorKey: 'customer_name',
      cell: (row: Sale) => (
        <div>
          <span className="font-medium text-foreground block">{row.customer_name}</span>
          <span className="text-xs text-gray-500">TIN: {row.customer_tin || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Date (E.C.)',
      accessorKey: 'sale_date_ethiopian',
    },
    {
      header: 'Amount Before VAT',
      cell: (row: Sale) => formatCurrency(row.financial_summary.amount_before_vat)
    },
    {
      header: 'VAT (15%)',
      cell: (row: Sale) => formatCurrency(row.financial_summary.vat_amount)
    },
    {
      header: 'Total Revenue',
      cell: (row: Sale) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.financial_summary.total_amount)}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row: Sale) => {
        const isVoided = (row as any).status === 'VOIDED';
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/sales/${row.manual_receipt_number}`)}
              className="rounded-xl flex items-center gap-1.5 h-9"
            >
              <Eye size={16} />
              Details
            </Button>
            {!isVoided && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReceiptToVoid(row.manual_receipt_number)}
                className="rounded-xl text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 h-9 px-2"
              >
                <Prohibit size={16} />
                Void
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales History"
        description="Search, inspect, and manage finalized sales transactions."
      >
        <Button
          onClick={() => navigate('/sales/new')}
          className="rounded-xl bg-[#5A3E2B] hover:bg-[#5a3d09] text-white h-11 text-base shadow-sm"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Sale
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-[#5A3E2B]">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sales Count</p>
            <h4 className="text-2xl font-bold text-foreground">{summary.total_sales_count}</h4>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-green-700">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Net Revenue</p>
            <h4 className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(summary.total_revenue)}</h4>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-amber-500">
            <Coin size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total VAT Collected</p>
            <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(summary.total_vat_collected)}</h4>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Funnel size={18} className="text-[#5A3E2B]" />
          Filter Sales History
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="searchCust">Customer Name</Label>
            <div className="relative">
              <Input
                id="searchCust"
                placeholder="Search customer..."
                value={customerSearch}
                onChange={(e) => { setCustomerSearch(e.target.value); setPage(1); }}
                className="pl-9 h-11 rounded-xl"
              />
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="searchRec">Receipt Number</Label>
            <Input
              id="searchRec"
              placeholder="Search receipt..."
              value={receiptSearch}
              onChange={(e) => { setReceiptSearch(e.target.value); setPage(1); }}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start Date (E.C.)</Label>
            <Input
              id="startDate"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate">End Date (E.C.)</Label>
            <Input
              id="endDate"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={sales}
        loading={loading}
        page={page}
        limit={limit}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      {/* Void Modal Prompt */}
      <Dialog open={!!selectedReceiptToVoid} onOpenChange={(open) => !open && setSelectedReceiptToVoid(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-700">
              Void Sale: {selectedReceiptToVoid}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <p className="text-base text-muted-foreground">
              Voiding this sale will mark it as cancelled and automatically reverse the sold flour stock back into inventory.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="voidReason" className="required">Void Reason</Label>
              <textarea
                id="voidReason"
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card p-3 text-base outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Reason for voiding..."
              />
            </div>

            <DialogFooter className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedReceiptToVoid(null)}
                className="rounded-xl h-11 px-5"
                disabled={voidLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleVoidSale}
                className="rounded-xl h-11 px-5 bg-red-700 hover:bg-red-700 text-white"
                disabled={voidLoading}
              >
                {voidLoading ? 'Voiding...' : 'Confirm Void'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesListPage;
