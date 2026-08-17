import React, { useState, useEffect } from 'react';
import { listMillingSessions, recordMillingSession } from '@/api/milling';
import { listProducts } from '@/api/products';
import { getCurrentStockLevels } from '@/api/inventory';
import type { MillingSession, Product } from '@/types/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/data-display/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EthiopianDatePicker } from '@/components/ui/ethiopian-date-picker';
import { formatNumber } from '@/utils/formatters';
import { getTodayEthiopianString } from '@/utils/ethiopianDate';
import { usePagination } from '@/hooks/usePagination';
import { Plus, Trash, Funnel, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface FormOutputItem {
  output_product_id: string;
  output_quantity: number;
}

export const MillingPage: React.FC = () => {
  const { page, limit, setPage } = usePagination(10);

  // List states
  const [sessions, setSessions] = useState<MillingSession[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [inputProductFilter, setInputProductFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dropdown options
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [flourProducts, setFlourProducts] = useState<Product[]>([]);
  const [stockLevelsMap, setStockLevelsMap] = useState<Record<string, number>>({});

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [millingDate, setMillingDate] = useState(getTodayEthiopianString());
  const [inputProductId, setInputProductId] = useState('');
  const [inputQuantity, setInputQuantity] = useState(0);
  const [outputs, setOutputs] = useState<FormOutputItem[]>([
    { output_product_id: '', output_quantity: 0 }
  ]);
  const [notes, setNotes] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await listMillingSessions({
        page,
        limit,
        input_product_id: inputProductFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      if (res.success) {
        setSessions(res.data.data);
        setTotalItems(res.data.pagination.total_items);
        setTotalPages(res.data.pagination.total_pages);
      }
    } catch {
      toast.error('Failed to load milling sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [rawRes, flourRes, stockRes] = await Promise.all([
        listProducts({ type: 'RAW_GRAIN', is_active: true }),
        listProducts({ type: 'FINISHED_FLOUR', is_active: true }),
        getCurrentStockLevels()
      ]);

      if (rawRes.success) setRawProducts(rawRes.data.products);
      if (flourRes.success) setFlourProducts(flourRes.data.products);
      if (stockRes.success) {
        const mapping: Record<string, number> = {};
        stockRes.data.stock_levels.forEach(sl => {
          mapping[sl.product_id] = sl.current_stock;
        });
        setStockLevelsMap(mapping);
      }
    } catch {
      toast.error('Failed to load form options');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, limit, inputProductFilter, startDate, endDate]);

  useEffect(() => {
    if (isModalOpen) {
      fetchFormOptions();
    }
  }, [isModalOpen]);

  // Form helpers
  const addOutput = () => {
    setOutputs([...outputs, { output_product_id: '', output_quantity: 0 }]);
  };

  const removeOutput = (index: number) => {
    if (outputs.length === 1) return;
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const updateOutput = (index: number, field: keyof FormOutputItem, val: string | number) => {
    const updated = [...outputs];
    if (field === 'output_product_id') {
      updated[index].output_product_id = val as string;
    } else {
      updated[index].output_quantity = Number(val);
    }
    setOutputs(updated);
  };

  const totalOutputQty = outputs.reduce((sum, item) => sum + item.output_quantity, 0);
  const lossQty = inputQuantity > 0 ? Math.max(0, inputQuantity - totalOutputQty) : 0;
  const lossPct = inputQuantity > 0 ? ((lossQty / inputQuantity) * 100).toFixed(1) + '%' : '0.0%';

  const availableStock = inputProductId ? stockLevelsMap[inputProductId] || 0 : 0;
  const isStockSufficient = inputQuantity <= availableStock;

  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!millingDate || !inputProductId || inputQuantity <= 0) {
      toast.error('Please enter all required input grain details');
      return;
    }
    if (!isStockSufficient) {
      toast.error(`Insufficient stock. Only ${availableStock} kg available.`);
      return;
    }
    if (outputs.some(out => !out.output_product_id || out.output_quantity <= 0)) {
      toast.error('Ensure all output lines have a valid flour product and quantity > 0');
      return;
    }
    if (totalOutputQty > inputQuantity) {
      toast.error('Total output flour cannot exceed input grain quantity');
      return;
    }

    try {
      setFormLoading(true);
      const res = await recordMillingSession({
        milling_date_ethiopian: millingDate,
        input_product_id: inputProductId,
        input_quantity: inputQuantity,
        outputs: outputs,
        notes: notes || undefined,
      });

      if (res.success) {
        toast.success('Milling session recorded successfully');
        setIsModalOpen(false);
        // Reset states
        setInputProductId('');
        setInputQuantity(0);
        setOutputs([{ output_product_id: '', output_quantity: 0 }]);
        setNotes('');
        fetchSessions();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to record milling session');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      header: 'Milling Date (E.C.)',
      accessorKey: 'milling_date_ethiopian',
    },
    {
      header: 'Input Grain Used',
      cell: (row: MillingSession) => (
        <span>
          <span className="font-semibold text-foreground">
            {formatNumber(row.input.quantity_used)} kg
          </span>{' '}
          of {row.input.product.name}
        </span>
      ),
    },
    {
      header: 'Total Flour Produced',
      cell: (row: MillingSession) => (
        <span className="font-semibold text-green-700 dark:text-green-400">
          {formatNumber(row.total_output_quantity)} kg
        </span>
      ),
    },
    {
      header: 'Milling Yield / Loss',
      cell: (row: MillingSession) => (
        <span>
          Loss: {formatNumber(row.loss_quantity)} kg ({row.loss_percentage})
        </span>
      ),
    },
    {
      header: 'Operator',
      cell: (row: MillingSession) => `@${row.created_by.username}`
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Milling Tracker"
        description="Monitor grain processing, flour production yields, and extraction rate mass balance."
      >
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-[#5A3E2B] hover:bg-[#5a3d09] text-white h-11 text-base shadow-sm"
        >
          <Plus className="mr-2 h-5 w-5" />
          Log Milling Run
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Funnel size={18} className="text-[#5A3E2B]" />
          Filter Milling Runs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="filterInput">Input Grain</Label>
            <select
              id="filterInput"
              value={inputProductFilter}
              onChange={(e) => { setInputProductFilter(e.target.value); setPage(1); }}
              className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
            >
              <option value="">All Grains</option>
              {rawProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
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
        data={sessions}
        loading={loading}
        page={page}
        limit={limit}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      {/* Logging Dialog */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="bg-card sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Log Milling Session</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitSession} className="space-y-5 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modalMillingDate" className="required">Milling Date (E.C.)</Label>
                <EthiopianDatePicker
                  value={millingDate}
                  onChange={setMillingDate}
                />
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-muted/20/50 dark:bg-secondary/30 p-4 rounded-xl space-y-4 border border-gray-100 border-border">
              <span className="font-bold text-foreground block">Input Grain Details</span>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modalInputProd" className="required">Select Raw Grain</Label>
                  <select
                    id="modalInputProd"
                    value={inputProductId}
                    onChange={(e) => setInputProductId(e.target.value)}
                    required
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
                  >
                    <option value="">Select a grain...</option>
                    {rawProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {inputProductId && (
                    <span className="text-sm text-gray-500 block">
                      Available Stock: <span className="font-semibold">{formatNumber(availableStock)} kg</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="modalInputQty" className="required">Quantity Milled (kg)</Label>
                  <Input
                    id="modalInputQty"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={inputQuantity || ''}
                    onChange={(e) => setInputQuantity(Number(e.target.value))}
                    required
                    className="h-11 rounded-xl"
                  />
                  {inputQuantity > 0 && !isStockSufficient && (
                    <span className="text-red-500 text-sm flex items-center gap-1 mt-1 font-semibold">
                      <Warning size={14} /> Exceeds available stock!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 border-border pb-2">
                <span className="text-base font-bold text-foreground">Produced Flour Outputs</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOutput}
                  className="rounded-xl flex items-center gap-1 h-9"
                >
                  <Plus size={16} />
                  Add Output Flour
                </Button>
              </div>

              <div className="space-y-3">
                {outputs.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1.5 min-w-[200px]">
                      <Label className="text-xs">Flour Product</Label>
                      <select
                        value={item.output_product_id}
                        onChange={(e) => updateOutput(idx, 'output_product_id', e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
                      >
                        <option value="">Select a flour...</option>
                        {flourProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-48 space-y-1.5">
                      <Label className="text-xs">Quantity Produced (kg)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.output_quantity || ''}
                        onChange={(e) => updateOutput(idx, 'output_quantity', e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>

                    {/* Calculated Yield Rate */}
                    <div className="w-32 text-right pr-2 pb-3 font-semibold text-gray-500">
                      Rate:{' '}
                      {inputQuantity > 0 && item.output_quantity > 0
                        ? ((item.output_quantity / inputQuantity) * 100).toFixed(1) + '%'
                        : '0.0%'}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOutput(idx)}
                      disabled={outputs.length === 1}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl h-11 w-11"
                    >
                      <Trash size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="bg-muted/40 p-4 rounded-xl space-y-2 text-base">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Finished Flour:</span>
                <span className="font-semibold text-foreground">{formatNumber(totalOutputQty)} kg</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-t border-border pt-2 mt-1">
                <span>Loss (Mass Balance):</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatNumber(lossQty)} kg ({lossPct})
                </span>
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
                placeholder="Session status details..."
              />
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
                disabled={formLoading || !isStockSufficient}
              >
                {formLoading ? 'Recording...' : 'Record Milling'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MillingPage;
