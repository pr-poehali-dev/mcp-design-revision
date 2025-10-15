import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { api, Product, Order } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#2563EB', '#F97316', '#10B981', '#8B5CF6', '#6B7280'];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        api.getProducts({ pageSize: 50 }),
        api.getOrders({ pageSize: 10 }),
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
      const data = await api.getProducts({ search: searchQuery, pageSize: 50 });
      setProducts(data.products);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate('/login');
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
          <Button variant="ghost" size="icon">
            <Icon name="Bell" className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="Settings" className="h-5 w-5" />
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
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
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
                  </div>
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
                  <Button>
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
                            <td className="p-4 align-middle font-medium">{product.name}</td>
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
                                <Button variant="ghost" size="icon">
                                  <Icon name="Eye" className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Icon name="Edit" className="h-4 w-4" />
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
                  <Button>
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
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon">
                                <Icon name="Eye" className="h-4 w-4" />
                              </Button>
                              {order.status === 'Active' && (
                                <Button variant="ghost" size="icon">
                                  <Icon name="Check" className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
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
    </div>
  );
};

export default Index;
