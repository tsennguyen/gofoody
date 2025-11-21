export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface ProductListItemDto {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  minPrice: number;
  maxPrice?: number | null;
  isOrganic: boolean;
  hasHaccpCert: boolean;
  isSeasonal: boolean;
  requiresColdShipping: boolean;
  thumbnailUrl?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Auth
export interface AuthUserDto {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: AuthUserDto;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface CurrentUserDto {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  roles: string[];
}

// Product detail
export interface ProductImageDto {
  id: number;
  imageUrl: string;
  isDefault: boolean;
  sortOrder: number;
}

export interface ProductVariantDto {
  id: number;
  name: string;
  unit: string;
  weightGrams?: number | null;
  price: number;
  listPrice?: number | null;
  isFresh: boolean;
  isFrozen: boolean;
  isPrecut: boolean;
  requiresColdShipping: boolean;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number | null;
}

export interface ReviewSummaryDto {
  averageRating: number;
  totalReviews: number;
}

export interface ProductDetailDto {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  originCountry?: string | null;
  brand?: string | null;
  isOrganic: boolean;
  hasHaccpCert: boolean;
  isSeasonal: boolean;
  storageCondition?: string | null;
  storageTempMin?: number | null;
  storageTempMax?: number | null;
  minPrice: number;
  maxPrice?: number | null;
  variants: ProductVariantDto[];
  images: ProductImageDto[];
  reviewSummary: ReviewSummaryDto;
}

// Search & suggestion
export interface ProductSearchFilterRequest {
  query?: string | null;
  categoryId?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  dietTags?: string[] | null;
  ingredientTags?: string[] | null;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  pageSize?: number;
}

export interface ProductSearchResultItemDto {
  productId: number;
  name: string;
  slug: string;
  categoryName: string;
  shortDescription?: string | null;
  minPrice: number;
  maxPrice?: number | null;
  requiresColdShipping: boolean;
  dietTags: string[];
  ingredientTags: string[];
}

export interface ProductSearchResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: ProductSearchResultItemDto[];
  suggestedTerms: string[];
}

export interface SearchSuggestionDto {
  term: string;
  type: 'ProductName' | 'Category' | 'Tag';
  productId?: number | null;
  categoryId?: number | null;
}

// Recommendation
export interface ProductRecommendationItemDto {
  productId: number;
  name: string;
  slug: string;
  categoryName: string;
  minPrice: number;
  maxPrice?: number | null;
  reason: string;
}

export interface ProductRecommendationsResponse {
  items: ProductRecommendationItemDto[];
}

// Reviews
export interface ReviewDto {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  title?: string | null;
  content?: string | null;
  createdAt: string;
  imageUrls: string[];
}

export interface ReviewCreateRequest {
  productId: number;
  rating: number;
  title?: string;
  content?: string;
  imageUrls?: string[];
}

// Cart
export interface CartItemDto {
  id: number;
  productId: number;
  productVariantId: number;
  productName: string;
  variantName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  requiresColdShipping: boolean;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number | null;
  thumbnailUrl?: string | null;
}

export interface CartSummaryDto {
  cartId: string;
  items: CartItemDto[];
  subtotal: number;
  requiresColdShipping: boolean;
  totalQuantity: number;
}

export interface CartItemAddRequest {
  productVariantId: number;
  quantity: number;
}

export interface CartItemUpdateRequest {
  quantity: number;
}

// Shipping/Payment + Checkout
export interface ShippingMethodDto {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isColdShipping: boolean;
  baseFee: number;
}

export interface PaymentMethodDto {
  id: number;
  code: string;
  name: string;
  description?: string | null;
}

export interface CheckoutRequest {
  fullName: string;
  phone: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city?: string;
  shippingMethodId: number;
  paymentMethodId: number;
  note?: string;
}

export interface OrderCreatedDto {
  orderId: number;
  orderCode: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  requiresColdShipping: boolean;
  createdAt: string;
}

// Orders view/manage
export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipping' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Paid' | 'Refunded';

export interface OrderListItemDto {
  id: number;
  orderCode: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingMethodName?: string | null;
  paymentMethodName?: string | null;
  totalItems: number;
  requiresColdShipping: boolean;
}

export interface OrderItemDto {
  id: number;
  productId: number;
  productVariantId: number;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetailDto {
  id: number;
  orderCode: string;
  createdAt: string;
  updatedAt?: string | null;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  note?: string | null;
  shippingMethodName?: string | null;
  paymentMethodName?: string | null;
  requiresColdShipping: boolean;
  items: OrderItemDto[];
}

export interface OrderStatsDto {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  thisMonthRevenue: number;
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
}

// Admin Category
export interface CategoryAdminListItemDto {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

export interface CategoryAdminDetailDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface CategoryAdminUpsertRequest {
  name: string;
  slug?: string | null;
  description?: string | null;
  parentId?: number | null;
  isActive: boolean;
  sortOrder?: number | null;
}

// Admin Product
export interface ProductVariantAdminDto {
  id: number;
  name: string;
  unit: string;
  weightGrams?: number | null;
  price: number;
  listPrice?: number | null;
  isFresh: boolean;
  isFrozen: boolean;
  isPrecut: boolean;
  requiresColdShipping: boolean;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number | null;
  isActive: boolean;
}

export interface ProductImageAdminDto {
  id: number;
  imageUrl: string;
  isDefault: boolean;
  sortOrder: number;
}

export interface ProductAdminListItemDto {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  isActive: boolean;
  minPrice: number;
  maxPrice?: number | null;
  totalStock: number;
  requiresColdShipping: boolean;
  createdAt: string;
}

export interface ProductAdminDetailDto {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  categoryName: string;
  shortDescription?: string | null;
  description?: string | null;
  originCountry?: string | null;
  brand?: string | null;
  isOrganic: boolean;
  hasHaccpCert: boolean;
  isSeasonal: boolean;
  storageCondition?: string | null;
  storageTempMin?: number | null;
  storageTempMax?: number | null;
  isActive: boolean;
  variants: ProductVariantAdminDto[];
  images: ProductImageAdminDto[];
}

export interface ProductVariantAdminUpsertRequest {
  id?: number | null;
  name: string;
  unit: string;
  weightGrams?: number | null;
  price: number;
  listPrice?: number | null;
  isFresh: boolean;
  isFrozen: boolean;
  isPrecut: boolean;
  requiresColdShipping: boolean;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number | null;
  isActive: boolean;
}

export interface ProductImageAdminUpsertRequest {
  id?: number | null;
  imageUrl: string;
  isDefault: boolean;
  sortOrder: number;
}

export interface ProductAdminUpsertRequest {
  name: string;
  slug?: string | null;
  categoryId: number;
  shortDescription?: string | null;
  description?: string | null;
  originCountry?: string | null;
  brand?: string | null;
  isOrganic: boolean;
  hasHaccpCert: boolean;
  isSeasonal: boolean;
  storageCondition?: string | null;
  storageTempMin?: number | null;
  storageTempMax?: number | null;
  isActive: boolean;
  variants: ProductVariantAdminUpsertRequest[];
  images: ProductImageAdminUpsertRequest[];
}

// Admin User
export interface UserAdminListItemDto {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface UserAdminDetailDto {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface UserAdminUpdateRequest {
  fullName: string;
  phone?: string | null;
  isActive: boolean;
  roleCodes: string[];
}

// Admin Shipping
export interface ShippingMethodAdminDto {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isColdShipping: boolean;
  baseFee: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ShippingMethodAdminUpsertRequest {
  code: string;
  name: string;
  description?: string | null;
  isColdShipping: boolean;
  baseFee: number;
  isActive: boolean;
  sortOrder?: number | null;
}

// Admin dashboard revenue
export interface RevenueDailyPointDto {
  date: string;
  revenue: number;
  ordersCount: number;
  averageOrderValue: number;
}

export interface RevenueMonthlyPointDto {
  year: number;
  month: number;
  revenue: number;
  ordersCount: number;
  averageOrderValue: number;
}

export interface RevenueOverviewDto {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  previousMonthRevenue: number;
}

export interface RevenueDailyResponse {
  overview: RevenueOverviewDto;
  points: RevenueDailyPointDto[];
}

export interface RevenueMonthlyResponse {
  overview: RevenueOverviewDto;
  points: RevenueMonthlyPointDto[];
}
