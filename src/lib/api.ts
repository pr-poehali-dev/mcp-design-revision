import func2url from '../../backend/func2url.json';

const URLS = {
  auth: func2url.auth,
  products: func2url.products,
  orders: func2url.orders,
};

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        window.location.href = '/login';
      }
      
      const error = await response.json().catch(() => ({
        error: 'An error occurred',
      }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async login(username: string, password: string) {
    const data = await this.request<{ access_token: string }>(
      URLS.auth,
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );

    this.token = data.access_token;
    localStorage.setItem('auth_token', this.token);
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async getProducts(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `${URLS.products}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request<ProductsResponse>(url);
  }

  async createProduct(product: CreateProductRequest): Promise<{ id: number }> {
    return this.request<{ id: number }>(URLS.products, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(product: UpdateProductRequest): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(URLS.products, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async archiveProduct(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(URLS.products, {
      method: 'PATCH',
      body: JSON.stringify({ id }),
    });
  }

  async deleteProduct(id: number): Promise<{ success: boolean }> {
    return this.archiveProduct(id);
  }

  async getOrders(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `${URLS.orders}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request<OrdersResponse>(url);
  }

  async createOrder(order: CreateOrderRequest): Promise<{ id: number }> {
    return this.request<{ id: number }>(URLS.orders, {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async completeOrder(orderId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(URLS.orders, {
      method: 'POST',
      body: JSON.stringify({ action: 'complete', orderId }),
    });
  }

  async cancelOrder(orderId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(URLS.orders, {
      method: 'POST',
      body: JSON.stringify({ action: 'cancel', orderId }),
    });
  }
}

export interface Product {
  id: number;
  vendorCode: string;
  name: string;
  description: string;
  priceTypeValue: number;
  currencyCode: string;
  minStock: number;
  isArchive: boolean;
  createdOnUtc: string;
  modifiedOnUtc: string;
  categoryName: string;
  manufacturerName: string;
  totalQuantity: number;
  isLowStock: boolean;
  barcodes: string[];
  locations: ProductLocation[];
}

export interface ProductLocation {
  locationId: number;
  quantity: number;
  locationName: string;
  lastUpdatedUtc: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateProductRequest {
  vendorCode: string;
  name: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  manufacturerId?: number;
  manufacturerName?: string;
  priceTypeValue: number;
  currencyCode?: string;
  minStock?: number;
  barcodes?: string[];
  locations?: { locationId: number; quantity: number }[];
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: number;
}

export interface Order {
  id: number;
  username: string;
  paymentType: string;
  comment: string;
  loyaltyCardNumber: string | null;
  totalAmount: number;
  status: string;
  createdOnUtc: string;
  completedOnUtc: string | null;
  products: OrderProduct[];
}

export interface OrderProduct {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  totalPrice: number;
  totalPurchasePrice: number;
  profit: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateOrderRequest {
  outletId?: number;
  username: string;
  paymentType: string;
  comment?: string;
  loyaltyCardNumber?: string;
  products: {
    productId: number;
    productName?: string;
    quantity: number;
    unitPrice: number;
    purchasePrice: number;
  }[];
}

export const api = new ApiClient();
