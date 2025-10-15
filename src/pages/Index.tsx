import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
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

const API_URL = 'https://functions.poehali.dev/4ce8990b-ee12-490c-988b-9989748b64d9';

const COLORS = ['#2563EB', '#F97316', '#10B981', '#8B5CF6', '#6B7280'];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total_products: 0, active_orders: 0, active_outlets: 0, recent_write_offs: 0 });
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}?action=dashboard`);
      const data = await response.json();
      setStats(data.stats);
      setSalesData(data.salesData);
      setCategoryData(data.categoryData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}?action=products&search=${searchQuery}`);
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}?action=orders`);
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const getStatusColor = (status: string) => {
    if (status === 'В наличии') return 'bg-success text-success-foreground';
    if (status === 'Мало') return 'bg-accent text-accent-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const getOrderTypeColor = (type: string) => {
    return type === 'incoming' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary';
  };

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
              <div className="text-2xl font-bold">{stats.total_products}</div>
              <p className="text-xs text-muted-foreground">В базе данных</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные заказы</CardTitle>
              <Icon name="ShoppingCart" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_orders}</div>
              <p className="text-xs text-muted-foreground">В обработке</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Торговые точки</CardTitle>
              <Icon name="Store" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_outlets}</div>
              <p className="text-xs text-muted-foreground">Активных</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Списания</CardTitle>
              <Icon name="AlertCircle" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recent_write_offs}</div>
              <p className="text-xs text-destructive">За неделю</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Динамика продаж</CardTitle>
              <CardDescription>Продажи и заказы за последние 6 месяцев</CardDescription>
            </CardHeader>
            <CardContent>
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  Нет данных за последние 6 месяцев
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Категории товаров</CardTitle>
              <CardDescription>Распределение по категориям</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
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
                    <p className="text-muted-foreground">Загрузка...</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Товар
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
                            <td className="p-4 align-middle font-medium">{product.name}</td>
                            <td className="p-4 align-middle">
                              <Badge variant="outline">{product.category}</Badge>
                            </td>
                            <td className="p-4 align-middle">{product.stock} шт.</td>
                            <td className="p-4 align-middle">{product.price.toLocaleString()} ₽</td>
                            <td className="p-4 align-middle">
                              <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
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
                    <CardTitle>Последние заказы</CardTitle>
                    <CardDescription>Приходные и расходные операции</CardDescription>
                  </div>
                  <Button>
                    <Icon name="Plus" className="mr-2 h-4 w-4" />
                    Создать заказ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                          <Icon name="FileText" className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{order.id_display}</p>
                            <Badge className={getOrderTypeColor(order.type)}>
                              {order.type === 'incoming' ? 'Приход' : 'Расход'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.outlet} • {order.items} позиций • {order.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={order.status === 'Выполнен' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Icon name="ChevronRight" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
