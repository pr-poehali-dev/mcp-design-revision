import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Product } from '@/lib/api';

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const ProductDetailsDialog = ({ open, onOpenChange, product }: ProductDetailsDialogProps) => {
  if (!product) return null;

  const getStatusColor = () => {
    if (product.totalQuantity === 0) return 'bg-destructive text-destructive-foreground';
    if (product.isLowStock) return 'bg-accent text-accent-foreground';
    return 'bg-success text-success-foreground';
  };

  const getStatusText = () => {
    if (product.totalQuantity === 0) return 'Нет в наличии';
    if (product.isLowStock) return 'Низкий запас';
    return 'В наличии';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.name}
            <Badge className={getStatusColor()}>{getStatusText()}</Badge>
          </DialogTitle>
          <DialogDescription>Артикул: {product.vendorCode}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Категория</p>
                <p className="text-base">{product.categoryName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Производитель</p>
                <p className="text-base">{product.manufacturerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Цена</p>
                <p className="text-2xl font-bold">
                  {product.priceTypeValue.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: product.currencyCode,
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Общий остаток</p>
                <p className="text-2xl font-bold">{product.totalQuantity} шт.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Минимальный запас</p>
                <p className="text-base">{product.minStock} шт.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Валюта</p>
                <p className="text-base">{product.currencyCode}</p>
              </div>
            </div>
          </div>

          {product.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Описание</p>
                <p className="text-base">{product.description}</p>
              </div>
            </>
          )}

          {product.barcodes && product.barcodes.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Штрих-коды</p>
                <div className="flex flex-wrap gap-2">
                  {product.barcodes.map((barcode, index) => (
                    <Badge key={index} variant="outline">
                      <Icon name="Barcode" className="mr-1 h-3 w-3" />
                      {barcode}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {product.locations && product.locations.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Размещение на складах</p>
                <div className="space-y-2">
                  {product.locations.map((location) => (
                    <div key={location.locationId} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Icon name="MapPin" className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{location.locationName}</p>
                          <p className="text-sm text-muted-foreground">
                            Обновлено: {new Date(location.lastUpdatedUtc).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-base">
                        {location.quantity} шт.
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p>Создан: {new Date(product.createdOnUtc).toLocaleString('ru-RU')}</p>
            </div>
            <div>
              <p>Изменен: {new Date(product.modifiedOnUtc).toLocaleString('ru-RU')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
