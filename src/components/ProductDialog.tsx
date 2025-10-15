import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { api, Product, Category, Manufacturer } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

const ProductDialog = ({ open, onOpenChange, product, onSuccess }: ProductDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    vendorCode: '',
    name: '',
    manufacturerId: '',
    categoryId: '',
    priceTypeValue: '',
    currencyCode: 'RUB',
    minStock: '10',
    description: '',
  });

  useEffect(() => {
    if (open) {
      loadReferences();
      if (product) {
        setFormData({
          vendorCode: product.vendorCode,
          name: product.name,
          manufacturerId: product.manufacturerId.toString(),
          categoryId: product.categoryId.toString(),
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

  const loadReferences = async () => {
    try {
      const [categoriesData, manufacturersData] = await Promise.all([
        api.getCategories(),
        api.getManufacturers(),
      ]);
      setCategories(categoriesData.categories);
      setManufacturers(manufacturersData.manufacturers);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить справочники',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      vendorCode: '',
      name: '',
      manufacturerId: '',
      categoryId: '',
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
        manufacturerId: parseInt(formData.manufacturerId),
        categoryId: parseInt(formData.categoryId),
        priceType: 'Fixed',
        priceTypeValue: parseFloat(formData.priceTypeValue),
        currencyCode: formData.currencyCode,
        minStock: parseInt(formData.minStock),
        description: formData.description,
      };

      if (product) {
        await api.updateProduct(product.id, data);
        toast({
          title: 'Товар обновлен',
          description: 'Изменения успешно сохранены',
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
        title: 'Ошибка сохранения',
        description: error instanceof Error ? error.message : 'Не удалось сохранить товар',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
          <DialogDescription>
            {product ? 'Измените информацию о товаре' : 'Заполните информацию о новом товаре'}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Название товара *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Категория *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturerId">Производитель *</Label>
              <Select
                value={formData.manufacturerId}
                onValueChange={(value) => setFormData({ ...formData, manufacturerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите производителя" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                      {manufacturer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currencyCode">Валюта</Label>
              <Select value={formData.currencyCode} onValueChange={(value) => setFormData({ ...formData, currencyCode: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">RUB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Мин. запас</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  <Icon name="Check" className="mr-2 h-4 w-4" />
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
