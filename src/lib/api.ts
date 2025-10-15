const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        window.location.href = '/login';
      }
      
      const error = await response.json().catch(() => ({
        detail: 'An error occurred',
      }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  async login(username: string, password: string) {
    const data = await this.request<{ token: string; expires: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
    
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
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
    page?: number;
    pageSize?: number;
    categoryId?: number;
    manufacturerId?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const query = queryParams.toString();
    return this.request<{
      products: Product[];
      pagination?: PaginationMetadata;
    }>(`/api/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: number) {
    return this.request<Product>(`/api/products/${id}`);
  }

  async createProduct(data: CreateProductDto) {
    return this.request<{ id: number }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: UpdateProductDto) {
    return this.request<void>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number) {
    return this.request<void>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  async archiveProduct(id: number) {
    return this.request<void>(`/api/products/${id}/archive`, {
      method: 'PUT',
    });
  }

  async restoreProduct(id: number) {
    return this.request<void>(`/api/products/${id}/restore`, {
      method: 'PUT',
    });
  }

  async getOrders(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const query = queryParams.toString();
    return this.request<{
      orders: Order[];
      pagination?: PaginationMetadata;
    }>(`/api/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: number) {
    return this.request<Order>(`/api/orders/${id}`);
  }

  async createOrder(data: CreateOrderDto) {
    return this.request<{ id: number }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeOrder(id: number) {
    return this.request<void>(`/api/orders/${id}/complete`, {
      method: 'PUT',
    });
  }

  async cancelOrder(id: number) {
    return this.request<void>(`/api/orders/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async getCategories() {
    return this.request<{ categories: Category[] }>('/api/categories');
  }

  async createCategory(data: { name: string; description?: string }) {
    return this.request<{ id: number }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getManufacturers() {
    return this.request<{ manufacturers: Manufacturer[] }>('/api/manufacturers');
  }

  async createManufacturer(data: { name: string; description?: string }) {
    return this.request<{ id: number }>('/api/manufacturers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export interface Product {
  id: number;
  vendorCode: string;
  name: string;
  manufacturerId: number;
  manufacturerName: string;
  categoryId: number;
  categoryName: string;
  typeId?: number;
  priceType: string;
  priceTypeValue: number;
  currencyCode: string;
  minStock: number;
  description?: string;
  isArchive: boolean;
  createdOnUtc: string;
  modifiedOnUtc: string;
  totalQuantity: number;
  isLowStock: boolean;
  barcodes: string[];
  locations: ProductLocation[];
}

export interface ProductLocation {
  locationId: number;
  locationName: string;
  quantity: number;
  lastUpdatedUtc: string;
}

export interface Order {
  id: number;
  status: string;
  createdOnUtc: string;
  completedOnUtc?: string;
  outletId: number;
  username: string;
  paymentType: string;
  comment?: string;
  loyaltyCardNumber?: string;
  products: OrderProduct[];
  totalAmount: number;
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

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  description?: string;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CreateProductDto {
  vendorCode: string;
  name: string;
  manufacturerId: number;
  categoryId: number;
  typeId?: number;
  priceType: string;
  priceTypeValue: number;
  currencyCode: string;
  minStock: number;
  description?: string;
}

export interface UpdateProductDto extends CreateProductDto {}

export interface CreateOrderDto {
  outletId: number;
  username: string;
  paymentType: string;
  comment?: string;
  loyaltyCardNumber?: string;
  products: {
    productId: number;
    quantity: number;
    unitPrice: number;
    purchasePrice: number;
  }[];
}

export const api = new ApiClient();
