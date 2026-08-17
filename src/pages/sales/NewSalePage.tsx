import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSale } from '@/api/sales';
import { listProducts } from '@/api/products';
import { getCurrentStockLevels } from '@/api/inventory';
import type { Product } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { EthiopianDatePicker } from '@/components/ui/ethiopian-date-picker';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { getTodayEthiopian, getTodayEthiopianString } from '@/utils/ethiopianDate';
import { useIdempotencyKey } from '@/hooks/useIdempotencyKey';
import { Plus, Trash, Receipt, CaretLeft } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface SaleLineItemForm {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export const NewSalePage: React.FC = () => {
  const navigate = useNavigate();
  const key = useIdempotencyKey();

  const [loading, setLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [stockLevelsMap, setStockLevelsMap] = useState<Record<string, number>>({});

  // Form Fields
  const [receiptNumber, setReceiptNumber] = useState('');
  const [saleDate, setSaleDate] = useState(getTodayEthiopianString());
  const [customerName, setCustomerName] = useState('');
  const [customerTin, setCustomerTin] = useState('');
  const [extraFeeDesc, setExtraFeeDesc] = useState('');
  const [extraFeeAmount, setExtraFeeAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [lineItems, setLineItems] = useState<SaleLineItemForm[]>([
    { product_id: '', quantity: 0, unit_price: 0 }
  ]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [prodRes, stockRes] = await Promise.all([
          listProducts({ type: 'FINISHED_FLOUR', is_active: true }),
          getCurrentStockLevels()
        ]);
        if (prodRes.success) setAvailableProducts(prodRes.data.products);
        if (stockRes.success) {
          const map: Record<string, number> = {};
          stockRes.data.stock_levels.forEach(sl => {
            map[sl.product_id] = sl.current_stock;
          });
          setStockLevelsMap(map);
        }
      } catch {
        toast.error('Failed to load products');
      }
    };
    loadOptions();

    // Auto-generate manual receipt REC-YYYY-XXXX
    const year = getTodayEthiopian().year;
    const rand = Math.floor(1000 + Math.random() * 9000);
    setReceiptNumber(`REC-${year}-${rand}`);
  }, []);

  const addLineItem = () => {
    setLineItems([...lineItems, { product_id: '', quantity: 0, unit_price: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof SaleLineItemForm, val: string | number) => {
    const updated = [...lineItems];
    if (field === 'product_id') {
      const prodId = val as string;
      updated[index].product_id = prodId;
      // Pre-fill default price
      const prod = availableProducts.find(p => p.id === prodId);
      if (prod && prod.default_unit_price) {
        updated[index].unit_price = prod.default_unit_price;
      }
    } else {
      updated[index][field] = Number(val);
    }
    setLineItems(updated);
  };

  // Calculations
  const subTotalBeforeVat = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const amountBeforeVat = subTotalBeforeVat + extraFeeAmount;
  const vatRate = 0.15;
  const vatAmount = amountBeforeVat * vatRate;
  const totalAmount = amountBeforeVat + vatAmount;

  // Validation
  const checkStockExceeded = () => {
    for (const item of lineItems) {
      if (item.product_id) {
        const avail = stockLevelsMap[item.product_id] || 0;
        if (item.quantity > avail) return true;
      }
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptNumber || !customerName || !saleDate) {
      toast.error('Please fill in required fields');
      return;
    }
    if (lineItems.some(i => !i.product_id || i.quantity <= 0 || i.unit_price <= 0)) {
      toast.error('Please ensure all items have a product selected, quantity > 0 and price > 0');
      return;
    }
    if (checkStockExceeded()) {
      toast.error('One or more products exceed available stock balance');
      return;
    }

    try {
      setLoading(true);
      const res = await createSale({
        manual_receipt_number: receiptNumber,
        sale_date_ethiopian: saleDate,
        customer_name: customerName,
        customer_tin: customerTin || undefined,
        line_items: lineItems,
        extra_fee: extraFeeAmount > 0 ? {
          description: extraFeeDesc || 'Extra Fee',
          amount: extraFeeAmount,
        } : undefined,
        notes: notes || undefined,
      }, key);

      if (res.success) {
        toast.success('Sale registered successfully!');
        navigate(`/sales/${receiptNumber}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to register sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/sales')}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:text-foreground transition-colors"
          >
            <CaretLeft size={16} />
            Back to Sales History
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">
            New Sale (Point of Sale)
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-border shadow-sm bg-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground mb-2">Customer & Receipt Info</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="receiptNo" className="required">Manual Receipt Number</Label>
                  <Input
                    id="receiptNo"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="saleDate" className="required">Sale Date (E.C.)</Label>
                  <EthiopianDatePicker
                    value={saleDate}
                    onChange={setSaleDate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="custName" className="required">Customer Name</Label>
                  <Input
                    id="custName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. አቶ ገብረ ሚካኤል"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="custTin">Customer TIN</Label>
                  <Input
                    id="custTin"
                    value={customerTin}
                    onChange={(e) => setCustomerTin(e.target.value)}
                    placeholder="e.g. 0001234567"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flour Products Line Items */}
          <Card className="rounded-2xl border-border shadow-sm bg-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 border-border pb-3">
                <h3 className="text-lg font-bold text-foreground">Flour Products</h3>
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

              <div className="space-y-4">
                {lineItems.map((item, idx) => {
                  const avail = item.product_id ? stockLevelsMap[item.product_id] || 0 : 0;
                  const isExceeded = item.quantity > avail;

                  return (
                    <div key={idx} className="flex gap-3 items-end border-b border-gray-50 dark:border-gray-900 pb-3">
                      <div className="flex-1 space-y-1.5 min-w-[200px]">
                        <Label className="text-xs">Flour Product</Label>
                        <select
                          value={item.product_id}
                          onChange={(e) => updateLineItem(idx, 'product_id', e.target.value)}
                          className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
                        >
                          <option value="">Select flour...</option>
                          {availableProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        {item.product_id && (
                          <span className="text-xs text-gray-500 block">
                            Avail Stock: <span className="font-semibold">{formatNumber(avail)} kg</span>
                          </span>
                        )}
                      </div>

                      <div className="w-32 space-y-1.5">
                        <Label className="text-xs">Quantity (kg)</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity || ''}
                          onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                          required
                          className="h-11 rounded-xl"
                        />
                        {isExceeded && (
                          <span className="text-xs text-red-500 font-bold block">
                            Exceeds stock!
                          </span>
                        )}
                      </div>

                      <div className="w-32 space-y-1.5">
                        <Label className="text-xs">Unit Price (Br)</Label>
                        <Input
                          type="number"
                          min="0.01"
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
                  );
                })}
              </div>

              {/* Extra Fee */}
              <div className="pt-4 border-t border-gray-100 border-border grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="extraDesc">Extra Fee Description</Label>
                  <Input
                    id="extraDesc"
                    value={extraFeeDesc}
                    onChange={(e) => setExtraFeeDesc(e.target.value)}
                    placeholder="e.g. Transport fee"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="extraAmt">Extra Fee Amount (Br)</Label>
                  <Input
                    id="extraAmt"
                    type="number"
                    min="0"
                    step="0.01"
                    value={extraFeeAmount || ''}
                    onChange={(e) => setExtraFeeAmount(Number(e.target.value))}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-sm bg-card">
            <CardContent className="p-6 space-y-2">
              <Label htmlFor="notes">Sale Remarks</Label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-border bg-card p-3 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
                placeholder="Optional sale details..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Calculation Summary Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-border shadow-sm bg-card sticky top-6">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground border-b border-gray-100 border-border pb-3 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#5A3E2B]" />
                Financial Summary
              </h3>

              <div className="space-y-3 text-base">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(subTotalBeforeVat)}</span>
                </div>
                {extraFeeAmount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Extra Fee ({extraFeeDesc || 'Transport'}):</span>
                    <span className="font-semibold text-foreground">{formatCurrency(extraFeeAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Total Before VAT:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(amountBeforeVat)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT (15%):</span>
                  <span className="font-semibold text-[#5A3E2B]">{formatCurrency(vatAmount)}</span>
                </div>

                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold text-foreground">
                  <span>Grand Total (Inc. VAT):</span>
                  <span className="text-[#5A3E2B] text-xl">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#5A3E2B] hover:bg-[#5a3d09] text-white text-base font-bold shadow-md hover:shadow-lg transition-all mt-4"
                disabled={loading || checkStockExceeded()}
              >
                {loading ? 'Processing Sale...' : 'Complete & Print Sale'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default NewSalePage;
