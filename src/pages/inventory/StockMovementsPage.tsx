import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStockMovementHistory } from '@/api/inventory';
import { listProducts } from '@/api/products';
import type { StockMovement, Product } from '@/types/api';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formatNumber } from '@/utils/formatters';
import { usePagination } from '@/hooks/usePagination';
import { CaretLeft, ArrowUpRight, ArrowDownLeft, Funnel } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const StockMovementsPage: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  const { page, limit, setPage } = usePagination(10);

  const [selectedProductId, setSelectedProductId] = useState<string>(productId || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [productInfo, setProductInfo] = useState<{ id: string; name: string } | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await listProducts();
        if (res.success) {
          setProducts(res.data.products);
          if (!selectedProductId && res.data.products.length > 0) {
            setSelectedProductId(res.data.products[0].id);
          }
        }
      } catch {
        toast.error('Failed to load products');
      }
    };
    loadProducts();
  }, []);

  const fetchMovements = async () => {
    if (!selectedProductId) return;
    try {
      setLoading(true);
      const res = await getStockMovementHistory(selectedProductId, {
        page,
        limit,
        movement_type: movementTypeFilter === 'ALL' ? undefined : (movementTypeFilter as any),
      });
      if (res.success) {
        setMovements(res.data.data);
        setCurrentBalance(res.data.current_stock_balance);
        setProductInfo(res.data.product);
        setTotalItems(res.data.pagination.total_items);
        setTotalPages(res.data.pagination.total_pages);
      }
    } catch {
      toast.error('Failed to load stock movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      fetchMovements();
    }
  }, [selectedProductId, page, limit, movementTypeFilter]);

  const columns = [
    {
      header: 'Date (E.C.)',
      accessorKey: 'ethiopian_date',
    },
    {
      header: 'Movement Type',
      accessorKey: 'movement_type',
      cell: (row: StockMovement) => {
        const isIncrease = row.quantity_change > 0;
        return (
          <span className={`inline-flex items-center gap-1 font-semibold rounded-lg px-2 py-0.5 text-xs ${isIncrease
            ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
            : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
            }`}>
            {isIncrease ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
            {row.movement_type}
          </span>
        );
      }
    },
    {
      header: 'Quantity Change',
      accessorKey: 'quantity_change',
      cell: (row: StockMovement) => (
        <span className={`font-bold ${row.quantity_change > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
          {row.quantity_change > 0 ? '+' : ''}{formatNumber(row.quantity_change)} kg
        </span>
      )
    },
    {
      header: 'Reference Summary',
      accessorKey: 'reference_summary',
      cell: (row: StockMovement) => (
        <span className="text-foreground">{row.reference_summary}</span>
      )
    },
    {
      header: 'Recorded By',
      accessorKey: 'created_by',
      cell: (row: StockMovement) => `@${row.created_by}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/inventory/stock-levels')}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:text-foreground transition-colors"
          >
            <CaretLeft size={16} />
            Back to Stock Levels
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">
            Stock Movement Audit Trail
          </h1>
        </div>
      </div>

      {/* Select product & summary */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-2">
          <Label htmlFor="selectProduct" className="text-base font-bold text-foreground">Select Product</Label>
          <select
            id="selectProduct"
            value={selectedProductId}
            onChange={(e) => { setSelectedProductId(e.target.value); setPage(1); }}
            className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
            ))}
          </select>
        </div>

        <div className="bg-muted/40 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Current Stock Balance</p>
            <h3 className="text-2xl font-bold text-[#5A3E2B] mt-0.5">
              {formatNumber(currentBalance)} kg
            </h3>
          </div>
          {productInfo && (
            <Badge variant="outline" className="rounded-lg text-sm font-semibold">
              {productInfo.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Movement Filter */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center gap-3">
        <Funnel size={18} className="text-[#5A3E2B]" />
        <span className="text-sm font-medium text-gray-500">Filter Type:</span>
        <div className="flex items-center gap-2">
          {(['ALL', 'INTAKE', 'MILLING_INPUT', 'MILLING_OUTPUT', 'SALE'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setMovementTypeFilter(t); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${movementTypeFilter === t
                ? 'bg-[#5A3E2B] text-white'
                : 'bg-accent text-muted-foreground hover:bg-gray-200'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={movements}
        loading={loading}
        page={page}
        limit={limit}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />
    </div>
  );
};

export default StockMovementsPage;
