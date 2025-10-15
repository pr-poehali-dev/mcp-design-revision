import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Order } from '@/lib/api';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSuccess: () => void;
}

const OrderDetailsDialog = ({ open, onOpenChange, order, onSuccess }: OrderDetailsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!order) return null;

  const getStatusColor = () => {
    if (order.status === 'Active') return 'default';
    if (order.status === 'Completed') return 'outline';
    return 'secondary';
  };

  const getStatusText = () => {
    const statusMap: Record<string, string> = {
      Active: 'Активен',
      Completed: 'Завершен',
      Cancelled: 'Отменен',
    };
    return statusMap[order.status] || order.status;
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.completeOrder(order.id);
      toast({
        title: 'Заказ завершен',
        description: 'Заказ успешно помечен как завершенный',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось завершить заказ',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await api.cancelOrder(order.id);
      toast({
        title: 'Заказ отменен',
        description: 'Заказ успешно отменен',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отменить заказ',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalProfit = order.products.reduce((sum, p) => sum + p.profit, 0);
  const totalPurchasePrice = order.products.reduce((sum, p) => sum + p.totalPurchasePrice, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Заказ #{order.id}
            <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
          </DialogTitle>
          <DialogDescription>
            Создан: {new Date(order.createdOnUtc).toLocaleString('ru-RU')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Сотрудник</p>
                <p className="text-base">{order.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Тип оплаты</p>
                <p className="text-base">{order.paymentType}</p>
              </div>
              {order.loyaltyCardNumber && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Карта лояльности</p>
                  <p className="text-base">{order.loyaltyCardNumber}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Сумма заказа</p>
                <p className="text-2xl font-bold">
                  {order.totalAmount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Прибыль</p>
                <p className="text-xl font-semibold text-success">
                  {totalProfit.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                </p>
              </div>
              {order.completedOnUtc && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Завершен</p>
                  <p className="text-base">{new Date(order.completedOnUtc).toLocaleString('ru-RU')}</p>
                </div>
              )}
            </div>
          </div>

          {order.comment && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Комментарий</p>
                <p className="text-base">{order.comment}</p>
              </div>
            </>
          )}

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Товары в заказе</p>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Товар</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Кол-во</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Цена</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Сумма</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Прибыль</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4 align-middle font-medium">{product.productName}</td>
                      <td className="p-4 align-middle">{product.quantity} шт.</td>
                      <td className="p-4 align-middle">
                        {product.unitPrice.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                      </td>
                      <td className="p-4 align-middle font-semibold">
                        {product.totalPrice.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                      </td>
                      <td className="p-4 align-middle text-success font-medium">
                        {product.profit.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/50 font-semibold">
                    <td className="p-4 align-middle" colSpan={3}>Итого</td>
                    <td className="p-4 align-middle">
                      {order.totalAmount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                    </td>
                    <td className="p-4 align-middle text-success">
                      {totalProfit.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-lg border bg-muted/50 p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Закупочная цена</p>
              <p className="text-lg font-semibold">
                {totalPurchasePrice.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Цена продажи</p>
              <p className="text-lg font-semibold">
                {order.totalAmount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Маржа</p>
              <p className="text-lg font-semibold text-success">
                {((totalProfit / order.totalAmount) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {order.status === 'Active' && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              <Icon name="X" className="mr-2 h-4 w-4" />
              Отменить заказ
            </Button>
            <Button onClick={handleComplete} disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Icon name="Check" className="mr-2 h-4 w-4" />
                  Завершить заказ
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
