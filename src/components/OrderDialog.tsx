import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { api, Product } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
}

const OrderDialog = ({ open, onOpenChange, onSuccess }: OrderDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    outletId: '1',
    username: '',
    paymentType: 'Card',
    comment: '',
    loyaltyCardNumber: '',
  });

  useEffect(() => {
    if (open) {
      loadProducts();
      resetForm();
    }
  }, [open]);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts({ pageSize: 100 });
      setProducts(data.products);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить товары',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      outletId: '1',
      username: '',
      paymentType: 'Card',
      comment: '',
      loyaltyCardNumber: '',
    });
    setOrderItems([]);
    setSearchQuery('');
  };

  const addProduct = (product: Product) => {
    const existing = orderItems.find((item) => item.productId === product.id);
    if (existing) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.priceTypeValue,
          purchasePrice: product.priceTypeValue * 0.8,
        },
      ]);
    }
    setSearchQuery('');
  };

  const removeProduct = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }
    setOrderItems(
      orderItems.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const updatePrice = (productId: number, unitPrice: number) => {
    setOrderItems(
      orderItems.map((item) => (item.productId === productId ? { ...item, unitPrice } : item))
    );
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Добавьте хотя бы один товар в заказ',
      });
      return;
    }

    setLoading(true);

    try {
      await api.createOrder({
        outletId: parseInt(formData.outletId),
        username: formData.username,
        paymentType: formData.paymentType,
        comment: formData.comment,
        loyaltyCardNumber: formData.loyaltyCardNumber || undefined,
        products: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          purchasePrice: item.purchasePrice,
        })),
      });

      toast({
        title: 'Заказ создан',
        description: 'Новый заказ успешно добавлен в систему',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка создания',
        description: error instanceof Error ? error.message : 'Не удалось создать заказ',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать заказ</DialogTitle>
          <DialogDescription>Добавьте товары и заполните информацию о заказе</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Товары в заказе</h3>

            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров для добавления..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {searchQuery && filteredProducts.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-md border">
                {filteredProducts.slice(0, 10).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="flex w-full items-center justify-between p-3 hover:bg-muted transition-colors"
                    onClick={() => addProduct(product)}
                  >
                    <div className="text-left">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.vendorCode} • В наличии: {product.totalQuantity} шт.
                      </p>
                    </div>
                    <Badge variant="outline">
                      {product.priceTypeValue.toLocaleString('ru-RU', {
                        style: 'currency',
                        currency: product.currencyCode,
                      })}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {orderItems.length > 0 ? (
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">×</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updatePrice(item.productId, parseFloat(e.target.value))}
                        className="w-32"
                      />
                      <span className="font-semibold w-32 text-right">
                        {(item.quantity * item.unitPrice).toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                        })}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProduct(item.productId)}
                      >
                        <Icon name="X" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3 font-semibold">
                  <span>Итого:</span>
                  <span className="text-lg">
                    {totalAmount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                Добавьте товары в заказ
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Информация о заказе</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Сотрудник *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentType">Тип оплаты</Label>
                <Select value={formData.paymentType} onValueChange={(value) => setFormData({ ...formData, paymentType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Card">Карта</SelectItem>
                    <SelectItem value="Cash">Наличные</SelectItem>
                    <SelectItem value="Transfer">Перевод</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loyaltyCardNumber">Карта лояльности</Label>
              <Input
                id="loyaltyCardNumber"
                value={formData.loyaltyCardNumber}
                onChange={(e) => setFormData({ ...formData, loyaltyCardNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий</Label>
              <Input
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading || orderItems.length === 0}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Icon name="Check" className="mr-2 h-4 w-4" />
                  Создать заказ
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
