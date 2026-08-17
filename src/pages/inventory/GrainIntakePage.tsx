import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGrainIntakes, recordGrainIntake } from '@/api/grainIntake';
import { listProducts } from '@/api/products';
import type { GrainIntakeBatch, Product } from '@/types/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/data-display/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EthiopianDatePicker } from '@/components/ui/ethiopian-date-picker';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { getTodayEthiopian, getTodayEthiopianString } from '@/utils/ethiopianDate';
import { usePagination } from '@/hooks/usePagination';
import { useIdempotencyKey } from '@/hooks/useIdempotencyKey';
import { Plus, Trash, MagnifyingGlass, Funnel, Eye } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface FormLineItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export const GrainIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const { page, limit, setPage } = usePagination(10);
  const key = useIdempotencyKey();

  // Search & Filters
  const [supplierSearch, setSupplierSearch] = useState('');
  const [receiptSearch, setReceiptSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data states
  const [batches, setBatches] = useState<GrainIntakeBatch[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Form Fields
  const [receiptNumber, setReceiptNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierTin, setSupplierTin] = useState('');
  const [intakeDate, setIntakeDate] = useState(getTodayEthiopianString());
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    { product_id: '', quantity: 0, unit_price: 0 }
  ]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await listGrainIntakes({
        page,
        limit,
        supplier_name: supplierSearch || undefined,
        receipt_number: receiptSearch || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      if (res.success) {
        setBatches(res.data.data);
        setTotalItems(res.data.pagination.total_items);
        setTotalPages(res.data.pagination.total_pages);
      }
    } catch {
      toast.error('Failed to load grain intakes');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await listProducts({ type: 'RAW_GRAIN', is_active: true });
      if (res.success) {
        setAvailableProducts(res.data.products);
      }
    } catch {
      toast.error('Failed to load products list');
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [page, limit, supplierSearch, receiptSearch, startDate, endDate]);

  useEffect(() => {
    if (isModalOpen) {
      fetchProducts();
      // Pre-fill a standard unique receipt structure GI-YYYY-XXXX
      const year = getTodayEthiopian().year;
      const rand = Math.floor(1000 + Math.random() * 9000);
      setReceiptNumber(`GI-${year}-${rand}`);
    }
  }, [isModalOpen]);

  // Line item helpers
  const addLineItem = () => {
    setLineItems([...lineItems, { product_id: '', quantity: 0, unit_price: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof FormLineItem, val: string | number) => {
    const updated = [...lineItems];
    if (field === 'product_id') {
      updated[index].product_id = val as string;
    } else {
      updated[index][field] = Number(val);
    }
    setLineItems(updated);
  };

  const calculateGrandTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSubmitIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptNumber || !supplierName || !intakeDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (lineItems.some(item => !item.product_id || item.quantity <= 0 || item.unit_price <= 0)) {
      toast.error('Please ensure all line items have a product, quantity > 0 and price > 0');
      return;
    }

    try {
      setFormLoading(true);
      const res = await recordGrainIntake({
        receipt_number: receiptNumber,
        supplier_name: supplierName,
        supplier_tin: supplierTin || undefined,
        intake_date_ethiopian: intakeDate,
        notes: notes || undefined,
        line_items: lineItems,
      }, key);

      if (res.success) {
        toast.success('Grain intake recorded successfully');
        setIsModalOpen(false);
        // Reset form
        setSupplierName('');
        setSupplierTin('');
        setIntakeDate(getTodayEthiopianString());
        setNotes('');
        setLineItems([{ product_id: '', quantity: 0, unit_price: 0 }]);
        fetchBatches();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to record intake');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      header: 'Receipt No.',
      accessorKey: 'receipt_number',
      cell: (row: GrainIntakeBatch) => (
        <span className="font-semibold text-foreground">{row.receipt_number}</span>
      )
    },
    {
      header: 'Supplier',
      accessorKey: 'supplier_name',
    },
    {
      header: 'Date (E.C.)',
      accessorKey: 'intake_date_ethiopian',
    },
    {
      header: 'Total Quantity',
      accessorKey: 'total_quantity',
      cell: (row: GrainIntakeBatch) => `${formatNumber(row.total_quantity)} kg`
    },
    {
      header: 'Total Cost',
      accessorKey: 'total_cost',
      cell: (row: GrainIntakeBatch) => formatCurrency(row.total_cost)
    },
    {
      header: 'Actions',
      cell: (row: GrainIntakeBatch) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/inventory/grain-intake/${row.id}`)}
          className="rounded-xl flex items-center gap-1.5 h-9"
        >
          <Eye size={16} />
          Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grain Intake Batches"
        description="Record and manage deliveries of raw grain from suppliers."
      >
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-[#5A3E2B] hover:bg-[#5a3d09] text-white h-11 text-base shadow-sm"
        >
          <Plus className="mr-2 h-5 w-5" />
          Log Grain Intake
        </Button>
      </PageHeader>

      {/* Filters Card */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Funnel size={18} className="text-[#5A3E2B]" />
          Filter Batches
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="searchSupplier">Supplier Name</Label>
            <div className="relative">
              <Input
                id="searchSupplier"
                placeholder="Search supplier..."
                value={supplierSearch}
                onChange={(e) => { setSupplierSearch(e.target.value); setPage(1); }}
                className="pl-9 h-11 rounded-xl"
              />
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="searchReceipt">Receipt Number</Label>
            <Input
              id="searchReceipt"
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={batches}
        loading={loading}
        page={page}
        limit={limit}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      {/* Log Intake Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="bg-card sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Record Grain Intake</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitIntake} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modalReceipt" className="required">Receipt Number</Label>
                <Input
                  id="modalReceipt"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modalDate" className="required">Intake Date (Ethiopian)</Label>
                <EthiopianDatePicker
                  value={intakeDate}
                  onChange={setIntakeDate}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modalSupplier" className="required">Supplier Name</Label>
                <Input
                  id="modalSupplier"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g. አቶ በቀለ አሰፋ"
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modalTin">Supplier TIN</Label>
                <Input
                  id="modalTin"
                  value={supplierTin}
                  onChange={(e) => setSupplierTin(e.target.value)}
                  placeholder="e.g. 0001234567"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 border-border pb-2">
                <span className="text-base font-bold text-foreground">Grains Received</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="rounded-xl flex items-center gap-1 h-9"
                >
                  <Plus size={16} />
                  Add Product
                </Button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1.5 min-w-[200px]">
                      <Label className="text-xs">Product</Label>
                      <select
                        value={item.product_id}
                        onChange={(e) => updateLineItem(idx, 'product_id', e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
                      >
                        <option value="">Select a grain...</option>
                        {availableProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-32 space-y-1.5">
                      <Label className="text-xs">Quantity (kg)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity || ''}
                        onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="w-32 space-y-1.5">
                      <Label className="text-xs">Unit Price (Br)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price || ''}
                        onChange={(e) => updateLineItem(idx, 'unit_price', e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="w-28 text-right pr-2 pb-3 font-semibold text-foreground">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(idx)}
                      disabled={lineItems.length === 1}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl h-11 w-11"
                    >
                      <Trash size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modalNotes">Remarks / Notes</Label>
              <textarea
                id="modalNotes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-border bg-card p-3 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
                placeholder="Any special remarks..."
              />
            </div>

            {/* Totals Summary */}
            <div className="bg-muted/40 p-4 rounded-xl flex items-center justify-between">
              <span className="font-bold text-muted-foreground">Total Purchase Cost:</span>
              <span className="text-xl font-bold text-[#5A3E2B]">
                {formatCurrency(calculateGrandTotal())}
              </span>
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl h-11 px-5 border-border"
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl h-11 px-5 bg-[#5A3E2B] hover:bg-[#5a3d09] text-white"
                disabled={formLoading}
              >
                {formLoading ? 'Submitting...' : 'Save Intake'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GrainIntakePage;
