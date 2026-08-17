import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordExpense } from '@/api/expenses';
import { listGrainIntakes } from '@/api/grainIntake';
import type { GrainIntakeBatch } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { EthiopianDatePicker } from '@/components/ui/ethiopian-date-picker';
import { getTodayEthiopian, getTodayEthiopianString } from '@/utils/ethiopianDate';
import { CaretLeft } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const NewExpensePage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [intakeBatches, setIntakeBatches] = useState<GrainIntakeBatch[]>([]);

  // Form
  const [expenseDate, setExpenseDate] = useState(getTodayEthiopianString());
  const [category, setCategory] = useState<'TRANSPORT' | 'SALARY' | 'UTILITY' | 'OTHER'>('TRANSPORT');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY'>('CASH');
  const [recipientName, setRecipientName] = useState('');
  const [receiptReference, setReceiptReference] = useState('');
  const [linkedBatchId, setLinkedBatchId] = useState<string>('');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await listGrainIntakes({ limit: 50 });
        if (res.success) {
          setIntakeBatches(res.data.data);
        }
      } catch {
        toast.error('Failed to load grain intake batches');
      }
    };
    fetchBatches();

    // Auto-generate reference EXP-YYYY-XXXX
    const year = getTodayEthiopian().year;
    const rand = Math.floor(1000 + Math.random() * 9000);
    setReceiptReference(`EXP-${year}-${rand}`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDate || !description || amount <= 0) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await recordExpense({
        expense_date_ethiopian: expenseDate,
        category,
        description,
        amount,
        payment_method: paymentMethod,
        recipient_name: recipientName || undefined,
        receipt_reference: receiptReference || undefined,
        linked_batch_id: linkedBatchId || undefined,
      });

      if (res.success) {
        toast.success('Expense recorded successfully');
        navigate('/expenses');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/expenses')}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:text-foreground transition-colors"
          >
            <CaretLeft size={16} />
            Back to Expenses List
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">
            Record Operational Expense
          </h1>
        </div>
      </div>

      <Card className="rounded-2xl border-border shadow-sm bg-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="expDate" className="required">Expense Date (E.C.)</Label>
                <EthiopianDatePicker
                  value={expenseDate}
                  onChange={setExpenseDate}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="required">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
                >
                  <option value="TRANSPORT">Transport</option>
                  <option value="SALARY">Salary</option>
                  <option value="UTILITY">Utility (Electricity/Water)</option>
                  <option value="OTHER">Other Expense</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="required">Description / Reason</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Transport cost for grain delivery from Bole"
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="required">Amount (Br)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="MOBILE_MONEY">Telebirr / Mobile Money</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="recipient">Recipient / Paid To</Label>
                <Input
                  id="recipient"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. አቶ ተስፋዬ መንግስቱ"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ref">Receipt Reference No.</Label>
                <Input
                  id="ref"
                  value={receiptReference}
                  onChange={(e) => setReceiptReference(e.target.value)}
                  placeholder="e.g. EXP-2018-0015"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Optional Grain Batch Link */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100 border-border">
              <Label htmlFor="linkBatch">Link to Grain Intake Batch (Optional)</Label>
              <select
                id="linkBatch"
                value={linkedBatchId}
                onChange={(e) => setLinkedBatchId(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
              >
                <option value="">None (General Expense)</option>
                {intakeBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    Batch {b.receipt_number} - {b.supplier_name} ({b.intake_date_ethiopian})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/expenses')}
                className="rounded-xl h-11 px-5 border-border"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl h-11 px-5 bg-[#5A3E2B] hover:bg-[#5a3d09] text-white"
                disabled={loading}
              >
                {loading ? 'Recording...' : 'Save Expense'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewExpensePage;
