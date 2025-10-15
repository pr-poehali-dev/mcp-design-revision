import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { api, Product, Order } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ProductDialog from '@/components/ProductDialog';
import OrderDialog from '@/components/OrderDialog';
import ProductDetailsDialog from '@/components/ProductDetailsDialog';
import OrderDetailsDialog from '@/components/OrderDetailsDialog';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#2563EB', '#F97316', '#10B981', '#8B5CF6', '#6B7280'];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        api.getProducts({ pageSize: 100 }),
        api.getOrders({ pageSize: 20 }),
      ]);
      
      setProducts(productsData.products);
      setOrders(ordersData.orders);
      setLoading(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка загрузки',
        description: error instanceof Error ? error.message : 'Не удалось загрузить данные',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!loading) {
        searchProducts();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchProducts = async () => {
    try {
      const data = await api.getProducts({ search: searchQuery, pageSize: 100 });
      setProducts(data.products);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductDetailsOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      if (selectedProduct.isArchive) {
        await api.deleteProduct(selectedProduct.id);
        toast({
          title: 'Товар удален',
          description: 'Товар успешно удален из системы',
        });
      } else {
        await api.archiveProduct(selectedProduct.id);
        toast({
          title: 'Товар архивирован',
          description: 'Товар перемещен в архив',
        });
      }
      loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить товар',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const getStatusColor = (product: Product) => {
    if (product.totalQuantity === 0) return 'bg-destructive text-destructive-foreground';
    if (product.isLowStock) return 'bg-accent text-accent-foreground';
    return 'bg-success text-success-foreground';
  };

  const getStatusText = (product: Product) => {
    if (product.totalQuantity === 0) return 'Нет';
    if (product.isLowStock) return 'Мало';
    return 'В наличии';
  };

  const getOrderStatusColor = (status: string) => {
    if (status === 'Active') return 'default';
    if (status === 'Completed') return 'outline';
    return 'secondary';
  };

  const getOrderStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      Active: 'Активен',
      Completed: 'Завершен',
      Cancelled: 'Отменен',
    };
    return statusMap[status] || status;
  };

  const categoryStats = products.reduce((acc, product) => {
    const existing = acc.find((item) => item.name === product.categoryName);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: product.categoryName, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const totalProducts = products.length;
  const activeOrders = orders.filter((o) => o.status === 'Active').length;
  const lowStockProducts = products.filter((p) => p.isLowStock).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Icon name="Package" className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Система управления складом</h1>
            </div>
          </div>
          <div className="flex-1" />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const csvProducts = [
                ['Артикул', 'Название', 'Категория', 'Цена', 'Остаток', 'Статус'].join(','),
                ...products.map(p => [
                  p.vendorCode,
                  `"${p.name}"`,
                  p.categoryName,
                  p.priceTypeValue,
                  p.totalQuantity,
                  p.isLowStock ? 'Низкий запас' : 'В наличии'
                ].join(','))
              ].join('\n');
              
              const blob = new Blob(['\ufeff' + csvProducts], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `товары_${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
            }}
          >
            <Icon name="Download" className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="Bell" className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <Icon name="LogOut" className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
              А
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
              <Icon name="Package" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">В каталоге</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные заказы</CardTitle>
              <Icon name="ShoppingCart" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrders}</div>
              <p className="text-xs text-muted-foreground">В обработке</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Низкий запас</CardTitle>
              <Icon name="AlertCircle" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockProducts}</div>
              <p className="text-xs text-destructive">Требует внимания</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий оборот</CardTitle>
              <Icon name="TrendingUp" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders
                  .reduce((sum, order) => sum + order.totalAmount, 0)
                  .toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
              </div>
              <p className="text-xs text-muted-foreground">Всего</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Распределение по категориям</CardTitle>
              <CardDescription>Количество товаров по категориям</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} (${value})`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  Нет данных
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Последние заказы</CardTitle>
              <CardDescription>Недавние операции</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleViewOrder(order)}
                    className="w-full flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Заказ #{order.id}</p>
                        <Badge variant={getOrderStatusColor(order.status)}>
                          {getOrderStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdOnUtc).toLocaleDateString('ru-RU')} •{' '}
                        {order.products.length} позиций
                      </p>
                    </div>
                    <p className="font-semibold">
                      {order.totalAmount.toLocaleString('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                      })}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">
              <Icon name="Package" className="mr-2 h-4 w-4" />
              Товары
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
              Заказы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Каталог товаров</CardTitle>
                    <CardDescription>Управление товарами на складе</CardDescription>
                  </div>
                  <Button onClick={() => { setSelectedProduct(null); setProductDialogOpen(true); }}>
                    <Icon name="Plus" className="mr-2 h-4 w-4" />
                    Добавить товар
                  </Button>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="relative flex-1">
                    <Icon name="Search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Поиск товаров..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Icon name="Filter" className="mr-2 h-4 w-4" />
                    Фильтры
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Icon name="Loader2" className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Артикул
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Название
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Категория
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Остаток
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Цена
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Статус
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <code className="text-xs">{product.vendorCode}</code>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-3">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-12 w-12 rounded-md object-cover border"
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border">
                                    <Icon name="Package" className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                                <span className="font-medium">{product.name}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant="outline">{product.categoryName}</Badge>
                            </td>
                            <td className="p-4 align-middle">{product.totalQuantity} шт.</td>
                            <td className="p-4 align-middle">
                              {product.priceTypeValue.toLocaleString('ru-RU', {
                                style: 'currency',
                                currency: product.currencyCode,
                              })}
                            </td>
                            <td className="p-4 align-middle">
                              <Badge className={getStatusColor(product)}>{getStatusText(product)}</Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleViewProduct(product)}>
                                  <Icon name="Eye" className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                                  <Icon name="Edit" className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product)}>
                                  <Icon name="Trash2" className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Все заказы</CardTitle>
                    <CardDescription>История заказов и операций</CardDescription>
                  </div>
                  <Button onClick={() => setOrderDialogOpen(true)}>
                    <Icon name="Plus" className="mr-2 h-4 w-4" />
                    Создать заказ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          № Заказа
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Дата
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Сотрудник
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Позиций
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Сумма
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Статус
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-medium">#{order.id}</td>
                          <td className="p-4 align-middle">
                            {new Date(order.createdOnUtc).toLocaleString('ru-RU')}
                          </td>
                          <td className="p-4 align-middle">{order.username}</td>
                          <td className="p-4 align-middle">{order.products.length}</td>
                          <td className="p-4 align-middle font-semibold">
                            {order.totalAmount.toLocaleString('ru-RU', {
                              style: 'currency',
                              currency: 'RUB',
                            })}
                          </td>
                          <td className="p-4 align-middle">
                            <Badge variant={getOrderStatusColor(order.status)}>
                              {getOrderStatusText(order.status)}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                              <Icon name="Eye" className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
        onSuccess={loadData}
      />

      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        onSuccess={loadData}
      />

      <ProductDetailsDialog
        open={productDetailsOpen}
        onOpenChange={setProductDetailsOpen}
        product={selectedProduct}
      />

      <OrderDetailsDialog
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
        order={selectedOrder}
        onSuccess={loadData}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProduct?.isArchive
                ? 'Это действие нельзя отменить. Товар будет безвозвратно удален из системы.'
                : 'Товар будет перемещен в архив и станет недоступен для заказов.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {selectedProduct?.isArchive ? 'Удалить' : 'Архивировать'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;