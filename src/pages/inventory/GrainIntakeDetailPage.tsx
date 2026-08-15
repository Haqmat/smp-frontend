import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGrainIntakeDetails } from '@/api/grainIntake';
import type { GrainIntakeBatch } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { CaretLeft, Printer, Calendar, User, Note, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const GrainIntakeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<GrainIntakeBatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getGrainIntakeDetails(id);
        if (res.success) {
          setBatch(res.data.batch);
        }
      } catch {
        toast.error('Failed to load grain intake details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a38413]" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-foreground">Batch Not Found</h3>
        <p className="text-gray-500 mt-2">The requested grain intake batch does not exist or has been removed.</p>
        <Button onClick={() => navigate('/inventory/grain-intake')} className="mt-4 rounded-xl bg-[#a38413]">
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/inventory/grain-intake')}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:text-foreground transition-colors"
          >
            <CaretLeft size={16} />
            Back to Grain Intakes
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">
            Intake Batch: {batch.receipt_number}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => window.print()}
            variant="outline"
            className="rounded-xl flex items-center gap-2 h-11 px-5 border-border"
          >
            <Printer size={18} />
            Print Details
          </Button>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border shadow-sm bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#a38413]">
              <Info className="w-6 h-6" />
              <h3 className="font-bold text-gray-800 text-foreground">Supplier Info</h3>
            </div>
            <div className="space-y-2 text-base text-muted-foreground">
              <p>Name: <span className="font-semibold text-foreground">{batch.supplier_name}</span></p>
              <p>TIN: <span className="font-semibold text-foreground">{batch.supplier_tin || 'Not provided'}</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-sm bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#a38413]">
              <Calendar className="w-6 h-6" />
              <h3 className="font-bold text-gray-800 text-foreground">Intake Date</h3>
            </div>
            <div className="space-y-2 text-base text-muted-foreground">
              <p>Ethiopian (E.C.): <span className="font-semibold text-foreground">{batch.intake_date_ethiopian}</span></p>
              <p>Gregorian (G.C.): <span className="font-semibold text-foreground">{batch.intake_date_gregorian}</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-sm bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#a38413]">
              <User className="w-6 h-6" />
              <h3 className="font-bold text-gray-800 text-foreground">Log Details</h3>
            </div>
            <div className="space-y-2 text-base text-muted-foreground">
              <p>Recorded By: <span className="font-semibold text-foreground">{batch.created_by.full_name}</span></p>
              <p>Username: <span className="font-semibold text-foreground">@{batch.created_by.username}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 border-border">
          <h3 className="text-lg font-bold text-foreground">Line Items Received</h3>
        </div>
        <Table>
          <TableHeader className="bg-muted/20/50 dark:bg-muted/50 border-b border-gray-100 border-border">
            <TableRow>
              <TableHead className="px-6 py-4 text-sm font-semibold text-gray-500">Raw Grain Product</TableHead>
              <TableHead className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">Quantity</TableHead>
              <TableHead className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">Unit Price</TableHead>
              <TableHead className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">Line Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batch.line_items.map((item) => (
              <TableRow key={item.id} className="border-b border-gray-50 border-border/30">
                <TableCell className="px-6 py-4 font-medium text-foreground">
                  {item.product.name}
                </TableCell>
                <TableCell className="px-6 py-4 text-right text-foreground">
                  {formatNumber(item.quantity)} kg
                </TableCell>
                <TableCell className="px-6 py-4 text-right text-foreground">
                  {formatCurrency(item.unit_price)}
                </TableCell>
                <TableCell className="px-6 py-4 text-right font-semibold text-foreground">
                  {formatCurrency(item.line_total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals Section */}
        <div className="p-6 bg-muted/40 border-t border-gray-100 border-border flex flex-col items-end gap-2 text-base">
          <div className="text-gray-500 flex justify-between w-64">
            <span>Total Weight:</span>
            <span className="font-semibold text-foreground">{formatNumber(batch.total_quantity)} kg</span>
          </div>
          <div className="text-foreground flex justify-between w-64 text-lg font-bold border-t border-border pt-2 mt-1">
            <span>Grand Total:</span>
            <span className="text-[#a38413]">{formatCurrency(batch.total_cost)}</span>
          </div>
        </div>
      </div>

      {/* Remarks Section */}
      {batch.notes && (
        <Card className="rounded-2xl border-border shadow-sm bg-card">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#a38413] font-bold">
              <Note className="w-5 h-5" />
              <h3>Remarks / Notes</h3>
            </div>
            <p className="text-base text-muted-foreground whitespace-pre-wrap">{batch.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GrainIntakeDetailPage;
