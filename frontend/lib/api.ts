const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

type ApiResponse<T> = T;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  // Return undefined for 204 No Content responses
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

// Event types
export interface EventResponse {
  id: string;
  name: string;
  slug: string;
  startsAt: string; // ISO date
  active: boolean;
  createdAt: string; // ISO datetime
}

export interface EventRequest {
  name: string;
  slug: string;
  startsAt?: string;
  active?: boolean;
}

// Menu types
export interface MenuResponse {
  id: string;
  name: string;
  slug: string;
  categories: MenuCategoryItem[];
}

export interface MenuCategoryItem {
  id: string;
  name: string;
  sortOrder: number;
  products: MenuProductItem[];
}

export interface MenuProductItem {
  id: string;
  name: string;
  price: number;
  sortOrder: number;
}

// Category types
export interface CategoryResponse {
  id: string;
  name: string;
}

export interface CategoryRequest {
  name: string;
}

// Product types
export interface ProductResponse {
  id: string;
  name: string;
  price: number;
}

export interface ProductRequest {
  name: string;
  price: number;
}

// Order types
export interface OrderResponse {
  id: string;
  clientId: string;
  total: number;
  createdAt: string;
  lines: OrderLineResponse[];
}

export interface OrderLineResponse {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderLineRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  clientId?: string;
  lines: OrderLineRequest[];
}

// Event API
export const eventApi = {
  getAll: (activeOnly: boolean = false) => request<EventResponse[]>(`/events?activeOnly=${activeOnly}`),
  getById: (id: string) => request<EventResponse>(`/events/${id}`),
  getBySlug: (slug: string) => request<EventResponse>(`/events/slug/${slug}`),
  getMenuBySlug: (slug: string) => request<MenuResponse>(`/events/slug/${slug}/menu`),
  create: (data: EventRequest) => request<EventResponse>('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: EventRequest) => request<EventResponse>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/events/${id}`, { method: 'DELETE' }),
  clone: (id: string, data: EventRequest) => request<EventResponse>(`/events/${id}/clone`, { method: 'POST', body: JSON.stringify(data) }),
};

// Category API
export const categoryApi = {
  getAll: (eventId: string) => request<CategoryResponse[]>(`/events/${eventId}/categories`),
  create: (eventId: string, data: CategoryRequest) => request<CategoryResponse>(`/events/${eventId}/categories`, { method: 'POST', body: JSON.stringify(data) }),
  update: (eventId: string, categoryId: string, data: CategoryRequest) => request<CategoryResponse>(`/events/${eventId}/categories/${categoryId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (eventId: string, categoryId: string) => request<void>(`/events/${eventId}/categories/${categoryId}`, { method: 'DELETE' }),
};

// Product API
export const productApi = {
  getAll: (eventId: string, categoryId: string) => request<ProductResponse[]>(`/events/${eventId}/categories/${categoryId}/products`),
  create: (eventId: string, categoryId: string, data: ProductRequest) => request<ProductResponse>(`/events/${eventId}/categories/${categoryId}/products`, { method: 'POST', body: JSON.stringify(data) }),
  update: (eventId: string, categoryId: string, productId: string, data: ProductRequest) => request<ProductResponse>(`/events/${eventId}/categories/${categoryId}/products/${productId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (eventId: string, categoryId: string, productId: string) => request<void>(`/events/${eventId}/categories/${categoryId}/products/${productId}`, { method: 'DELETE' }),
};

// Order API
export const orderApi = {
  create: (eventId: string, data: CreateOrderRequest) => request<OrderResponse>(`/events/${eventId}/orders`, { method: 'POST', body: JSON.stringify(data) }),
  getAll: (eventId: string) => request<OrderResponse[]>(`/events/${eventId}/orders`),
};
