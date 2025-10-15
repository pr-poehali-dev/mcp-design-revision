import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { api, Product } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

const ProductDialog = ({ open, onOpenChange, product, onSuccess }: ProductDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    vendorCode: '',
    name: '',
    categoryName: 'Электроника',
    manufacturerName: 'Общий производитель',
    priceTypeValue: '',
    currencyCode: 'RUB',
    minStock: '10',
    description: '',
  });

  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          vendorCode: product.vendorCode,
          name: product.name,
          categoryName: product.categoryName,
          manufacturerName: product.manufacturerName,
          priceTypeValue: product.priceTypeValue.toString(),
          currencyCode: product.currencyCode,
          minStock: product.minStock.toString(),
          description: product.description || '',
        });
      } else {
        resetForm();
      }
    }
  }, [open, product]);

  const resetForm = () => {
    setFormData({
      vendorCode: '',
      name: '',
      categoryName: 'Электроника',
      manufacturerName: 'Общий производитель',
      priceTypeValue: '',
      currencyCode: 'RUB',
      minStock: '10',
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        vendorCode: formData.vendorCode,
        name: formData.name,
        categoryName: formData.categoryName,
        manufacturerName: formData.manufacturerName,
        priceTypeValue: parseFloat(formData.priceTypeValue),
        currencyCode: formData.currencyCode,
        minStock: parseInt(formData.minStock),
        description: formData.description,
      };

      if (product) {
        await api.updateProduct({ ...data, id: product.id });
        toast({
          title: 'Товар обновлен',
          description: 'Информация о товаре успешно обновлена',
        });
      } else {
        await api.createProduct(data);
        toast({
          title: 'Товар создан',
          description: 'Новый товар успешно добавлен в каталог',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: product ? 'Ошибка обновления' : 'Ошибка создания',
        description: error instanceof Error ? error.message : 'Не удалось сохранить товар',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
          <DialogDescription>
            {product ? 'Измените информацию о товаре' : 'Заполните данные для создания нового товара'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorCode">Артикул *</Label>
              <Input
                id="vendorCode"
                value={formData.vendorCode}
                onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value })}
                required
                placeholder="SM-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Samsung Galaxy S24"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Категория</Label>
              <Input
                id="categoryName"
                value={formData.categoryName}
                onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                placeholder="Электроника"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturerName">Производитель</Label>
              <Input
                id="manufacturerName"
                value={formData.manufacturerName}
                onChange={(e) => setFormData({ ...formData, manufacturerName: e.target.value })}
                placeholder="Samsung"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceTypeValue">Цена *</Label>
              <Input
                id="priceTypeValue"
                type="number"
                step="0.01"
                value={formData.priceTypeValue}
                onChange={(e) => setFormData({ ...formData, priceTypeValue: e.target.value })}
                required
                placeholder="89990.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currencyCode">Валюта</Label>
              <Input
                id="currencyCode"
                value={formData.currencyCode}
                onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                placeholder="RUB"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Мин. остаток</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Подробное описание товара..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" className="mr-2 h-4 w-4" />
                  {product ? 'Сохранить' : 'Создать'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
