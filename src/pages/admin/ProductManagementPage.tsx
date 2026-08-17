import React, { useState, useEffect } from 'react';
import { listProducts, createProduct, updateProduct, toggleProductStatus } from '@/api/products';
import type { Product } from '@/types/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/data-display/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Plus, PencilSimple, CheckCircle, XCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState<'RAW_GRAIN' | 'FINISHED_FLOUR'>('FINISHED_FLOUR');
  const [threshold, setThreshold] = useState<number>(100);
  const [defaultPrice, setDefaultPrice] = useState<number>(0);

  const fetchProductsList = async () => {
    try {
      setLoading(true);
      const res = await listProducts();
      if (res.success) {
        setProducts(res.data.products);
      }
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setType('FINISHED_FLOUR');
    setThreshold(100);
    setDefaultPrice(0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setType(prod.type);
    setThreshold(prod.low_stock_threshold || 100);
    setDefaultPrice(prod.default_unit_price || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Please enter a product name');
      return;
    }

    try {
      setFormLoading(true);
      if (editingProduct) {
        const res = await updateProduct(editingProduct.id, {
          low_stock_threshold: threshold,
          default_unit_price: defaultPrice || undefined,
        });
        if (res.success) {
          toast.success('Product updated successfully');
          setIsModalOpen(false);
          fetchProductsList();
        }
      } else {
        const res = await createProduct({
          name,
          type,
          unit_of_measure: 'kg',
          low_stock_threshold: threshold,
          default_unit_price: defaultPrice || undefined,
        });
        if (res.success) {
          toast.success('Product created successfully');
          setIsModalOpen(false);
          fetchProductsList();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (prod: Product) => {
    try {
      const res = await toggleProductStatus(prod.id, !prod.is_active);
      if (res.success) {
        toast.success(`Product ${prod.name} ${!prod.is_active ? 'activated' : 'deactivated'}`);
        fetchProductsList();
      }
    } catch {
      toast.error('Failed to update product status');
    }
  };

  const columns = [
    {
      header: 'Product Name',
      accessorKey: 'name',
      cell: (row: Product) => (
        <span className="font-bold text-foreground">{row.name}</span>
      )
    },
    {
      header: 'Category Type',
      accessorKey: 'type',
      cell: (row: Product) => (
        <Badge variant="outline" className="rounded-lg capitalize font-bold">
          {row.type.replace('_', ' ').toLowerCase()}
        </Badge>
      )
    },
    {
      header: 'Safety Threshold',
      accessorKey: 'low_stock_threshold',
      cell: (row: Product) => `${formatNumber(row.low_stock_threshold || 100)} kg`
    },
    {
      header: 'Default Price',
      accessorKey: 'default_unit_price',
      cell: (row: Product) => row.default_unit_price ? formatCurrency(row.default_unit_price) : 'N/A'
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (row: Product) => (
        row.is_active ? (
          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-lg text-xs font-semibold">
            <CheckCircle size={14} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-lg text-xs font-semibold">
            <XCircle size={14} /> Inactive
          </span>
        )
      )
    },
    {
      header: 'Actions',
      cell: (row: Product) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEditModal(row)}
            className="rounded-xl h-9"
          >
            <PencilSimple size={16} className="mr-1" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(row)}
            className="rounded-xl h-9"
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products Catalog"
        description="Configure raw grains and finished flour inventory catalog items."
      >
        <Button
          onClick={handleOpenAddModal}
          className="rounded-xl bg-[#5A3E2B] hover:bg-[#5a3d09] text-white h-11 text-base shadow-sm"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Product
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
      />

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="prodName" className="required">Product Name</Label>
              <Input
                id="prodName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 1st Grade Wheat Flour (የመጀመሪያ ደረጃ ዱቄት)"
                required
                className="h-11 rounded-xl"
              />
            </div>

            {!editingProduct && (
              <div className="space-y-1.5">
                <Label htmlFor="prodType" className="required">Product Type</Label>
                <select
                  id="prodType"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
                >
                  <option value="FINISHED_FLOUR">Finished Flour (ዱቄት)</option>
                  <option value="RAW_GRAIN">Raw Grain (እህል)</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prodThreshold" className="required">Low Stock Threshold (kg)</Label>
                <Input
                  id="prodThreshold"
                  type="number"
                  min="0"
                  value={threshold || ''}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prodPrice">Default Unit Price (Br)</Label>
                <Input
                  id="prodPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={defaultPrice || ''}
                  onChange={(e) => setDefaultPrice(Number(e.target.value))}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl h-11 px-5"
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl h-11 px-5 bg-[#5A3E2B] hover:bg-[#5a3d09] text-white"
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : 'Save Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagementPage;
