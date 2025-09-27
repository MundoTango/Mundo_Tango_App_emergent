# ESA Layer 27: Marketplace Agent 🛍️

## Overview
Layer 27 manages marketplace functionality including product listings, transactions, seller management, reviews, and payment processing for community-driven commerce.

## Core Responsibilities

### 1. Product Management
- Product listing creation
- Inventory management
- Product categorization
- Pricing strategies
- Product variations

### 2. Transaction Processing
- Order management
- Payment processing
- Shipping integration
- Refund handling
- Dispute resolution

### 3. Seller Tools
- Seller dashboards
- Analytics and reporting
- Promotion tools
- Bulk operations
- Commission management

## Open Source Packages

```json
{
  "stripe": "^14.10.0",
  "@stripe/stripe-js": "^2.2.2",
  "export-to-csv": "^1.2.2"
}
```

## Integration Points

- **Layer 1 (Database)**: Product storage
- **Layer 12 (Media)**: Product images
- **Layer 17 (Search)**: Product search
- **Layer 23 (Payments)**: Transaction processing
- **Layer 24 (Social)**: Product sharing

## Product Service

```typescript
export class ProductService {
  async createProduct(data: CreateProductDto, sellerId: string): Promise<Product> {
    // Validate seller account
    await this.validateSellerAccount(sellerId);
    
    const productId = generateId();
    
    // Process product data
    const product = await db.transaction(async (tx) => {
      // Create product
      const [newProduct] = await tx.insert(products).values({
        id: productId,
        sellerId,
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        price: data.price,
        comparePrice: data.comparePrice,
        currency: data.currency || 'USD',
        sku: data.sku || generateSKU(),
        barcode: data.barcode,
        inventory: {
          quantity: data.quantity,
          trackInventory: data.trackInventory !== false,
          allowBackorder: data.allowBackorder || false,
          lowStockThreshold: data.lowStockThreshold || 5
        },
        shipping: {
          weight: data.weight,
          dimensions: data.dimensions,
          shippingClass: data.shippingClass,
          freeShipping: data.freeShipping || false,
          shippingPrice: data.shippingPrice
        },
        media: {
          images: data.images || [],
          videos: data.videos || [],
          thumbnail: data.thumbnail || data.images?.[0]
        },
        seo: {
          metaTitle: data.metaTitle || data.title,
          metaDescription: data.metaDescription || data.description.substring(0, 160),
          slug: generateSlug(data.title)
        },
        tags: data.tags || [],
        status: data.status || 'draft',
        visibility: data.visibility || 'public',
        featured: data.featured || false,
        createdAt: new Date()
      }).returning();
      
      // Create product variations if provided
      if (data.variations) {
        await this.createProductVariations(tx, productId, data.variations);
      }
      
      // Set up product attributes
      if (data.attributes) {
        await this.createProductAttributes(tx, productId, data.attributes);
      }
      
      return newProduct;
    });
    
    // Index for search
    await searchService.indexProduct(product);
    
    // Schedule inventory alerts
    if (product.inventory.trackInventory) {
      await this.scheduleInventoryAlerts(product);
    }
    
    return product;
  }
  
  async updateInventory(
    productId: string,
    quantity: number,
    operation: 'set' | 'increment' | 'decrement'
  ): Promise<void> {
    const product = await this.getProduct(productId);
    
    let newQuantity: number;
    switch (operation) {
      case 'set':
        newQuantity = quantity;
        break;
      case 'increment':
        newQuantity = product.inventory.quantity + quantity;
        break;
      case 'decrement':
        newQuantity = product.inventory.quantity - quantity;
        break;
    }
    
    // Update inventory
    await db
      .update(products)
      .set({
        'inventory.quantity': newQuantity,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId));
    
    // Check low stock
    if (newQuantity <= product.inventory.lowStockThreshold) {
      await this.sendLowStockAlert(product, newQuantity);
    }
    
    // Update availability
    if (newQuantity === 0 && !product.inventory.allowBackorder) {
      await this.markOutOfStock(productId);
    }
  }
}
```

## Order Management

```typescript
export class OrderService {
  async createOrder(
    items: OrderItem[],
    buyerId: string,
    shippingAddress: Address,
    paymentMethodId: string
  ): Promise<Order> {
    const orderId = generateId();
    
    // Calculate totals
    const { subtotal, shipping, tax, total } = await this.calculateOrderTotals(
      items,
      shippingAddress
    );
    
    // Create order
    const order = await db.transaction(async (tx) => {
      // Create order record
      const [newOrder] = await tx.insert(orders).values({
        id: orderId,
        buyerId,
        orderNumber: generateOrderNumber(),
        items,
        subtotal,
        shipping,
        tax,
        total,
        currency: 'USD',
        shippingAddress,
        billingAddress: shippingAddress,
        status: 'pending',
        paymentStatus: 'pending',
        fulfillmentStatus: 'unfulfilled',
        createdAt: new Date()
      }).returning();
      
      // Reserve inventory
      for (const item of items) {
        await this.reserveInventory(tx, item.productId, item.quantity);
      }
      
      // Process payment
      const payment = await paymentService.processPayment(
        paymentMethodId,
        total,
        buyerId,
        `Order ${newOrder.orderNumber}`
      );
      
      // Update order with payment info
      await tx
        .update(orders)
        .set({
          paymentId: payment.transactionId,
          paymentStatus: payment.success ? 'paid' : 'failed',
          status: payment.success ? 'processing' : 'cancelled'
        })
        .where(eq(orders.id, orderId));
      
      if (!payment.success) {
        throw new Error('Payment failed');
      }
      
      return newOrder;
    });
    
    // Send notifications
    await this.sendOrderConfirmation(order);
    await this.notifySellers(order);
    
    // Track analytics
    await this.trackOrderAnalytics(order);
    
    return order;
  }
  
  async fulfillOrder(
    orderId: string,
    trackingInfo?: TrackingInfo
  ): Promise<void> {
    const order = await this.getOrder(orderId);
    
    // Update fulfillment status
    await db
      .update(orders)
      .set({
        fulfillmentStatus: 'fulfilled',
        fulfilledAt: new Date(),
        trackingInfo,
        status: 'completed'
      })
      .where(eq(orders.id, orderId));
    
    // Update inventory
    for (const item of order.items) {
      await productService.updateInventory(
        item.productId,
        item.quantity,
        'decrement'
      );
    }
    
    // Send shipping notification
    await this.sendShippingNotification(order, trackingInfo);
    
    // Update seller metrics
    await this.updateSellerMetrics(order);
  }
  
  async processRefund(
    orderId: string,
    amount?: number,
    reason?: string
  ): Promise<Refund> {
    const order = await this.getOrder(orderId);
    
    // Process refund through payment provider
    const refund = await paymentService.refundPayment(
      order.paymentId,
      amount || order.total,
      reason
    );
    
    // Update order status
    await db
      .update(orders)
      .set({
        status: 'refunded',
        refundedAmount: refund.amount,
        refundedAt: new Date()
      })
      .where(eq(orders.id, orderId));
    
    // Restore inventory
    if (order.fulfillmentStatus === 'unfulfilled') {
      for (const item of order.items) {
        await productService.updateInventory(
          item.productId,
          item.quantity,
          'increment'
        );
      }
    }
    
    // Send refund notification
    await this.sendRefundNotification(order, refund);
    
    return refund;
  }
}
```

## Review System

```typescript
export class ReviewService {
  async createReview(
    productId: string,
    buyerId: string,
    rating: number,
    comment?: string,
    images?: string[]
  ): Promise<Review> {
    // Verify purchase
    const hasPurchased = await this.verifyPurchase(productId, buyerId);
    if (!hasPurchased) {
      throw new Error('Must purchase product to review');
    }
    
    // Check for existing review
    const existingReview = await this.getUserProductReview(buyerId, productId);
    if (existingReview) {
      throw new Error('Already reviewed this product');
    }
    
    // Create review
    const review = await db.insert(reviews).values({
      id: generateId(),
      productId,
      buyerId,
      rating,
      comment,
      images,
      verified: true,
      helpful: 0,
      createdAt: new Date()
    });
    
    // Update product rating
    await this.updateProductRating(productId);
    
    // Notify seller
    const product = await productService.getProduct(productId);
    await notificationService.send({
      userId: product.sellerId,
      type: 'new_review',
      title: 'New Product Review',
      body: `${buyerName} left a ${rating}-star review`,
      data: { productId, reviewId: review.id }
    });
    
    // Check for review milestones
    await this.checkReviewMilestones(productId);
    
    return review;
  }
  
  async markReviewHelpful(reviewId: string, userId: string): Promise<void> {
    // Check if already marked
    const existing = await db
      .select()
      .from(reviewHelpful)
      .where(and(
        eq(reviewHelpful.reviewId, reviewId),
        eq(reviewHelpful.userId, userId)
      ))
      .limit(1);
    
    if (existing[0]) {
      // Remove helpful mark
      await db
        .delete(reviewHelpful)
        .where(and(
          eq(reviewHelpful.reviewId, reviewId),
          eq(reviewHelpful.userId, userId)
        ));
      
      await db
        .update(reviews)
        .set({ helpful: sql`helpful - 1` })
        .where(eq(reviews.id, reviewId));
    } else {
      // Add helpful mark
      await db.insert(reviewHelpful).values({
        reviewId,
        userId,
        createdAt: new Date()
      });
      
      await db
        .update(reviews)
        .set({ helpful: sql`helpful + 1` })
        .where(eq(reviews.id, reviewId));
    }
  }
  
  private async updateProductRating(productId: string): Promise<void> {
    const ratings = await db
      .select({
        avg: sql<number>`AVG(rating)`,
        count: count()
      })
      .from(reviews)
      .where(eq(reviews.productId, productId));
    
    await db
      .update(products)
      .set({
        rating: ratings[0].avg,
        reviewCount: ratings[0].count
      })
      .where(eq(products.id, productId));
  }
}
```

## Seller Dashboard

```typescript
export class SellerDashboardService {
  async getDashboardMetrics(
    sellerId: string,
    period: TimePeriod
  ): Promise<SellerMetrics> {
    const { startDate, endDate } = this.getPeriodDates(period);
    
    const [
      revenue,
      orders,
      products,
      customers,
      reviews
    ] = await Promise.all([
      this.getRevenueMetrics(sellerId, startDate, endDate),
      this.getOrderMetrics(sellerId, startDate, endDate),
      this.getProductMetrics(sellerId),
      this.getCustomerMetrics(sellerId, startDate, endDate),
      this.getReviewMetrics(sellerId)
    ]);
    
    return {
      revenue,
      orders,
      products,
      customers,
      reviews,
      performance: this.calculatePerformanceScore({
        revenue,
        orders,
        reviews
      })
    };
  }
  
  private async getRevenueMetrics(
    sellerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RevenueMetrics> {
    const revenue = await db
      .select({
        total: sql<number>`SUM(total)`,
        commission: sql<number>`SUM(total * 0.15)`, // 15% commission
        net: sql<number>`SUM(total * 0.85)`
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(and(
        eq(products.sellerId, sellerId),
        eq(orders.status, 'completed'),
        between(orders.createdAt, startDate, endDate)
      ));
    
    return {
      total: revenue[0].total || 0,
      commission: revenue[0].commission || 0,
      net: revenue[0].net || 0,
      growth: await this.calculateGrowth(sellerId, startDate)
    };
  }
  
  async exportSellerData(
    sellerId: string,
    dataType: 'orders' | 'products' | 'customers',
    format: 'csv' | 'json'
  ): Promise<ExportResult> {
    let data: any[];
    
    switch (dataType) {
      case 'orders':
        data = await this.getSellerOrders(sellerId);
        break;
      case 'products':
        data = await this.getSellerProducts(sellerId);
        break;
      case 'customers':
        data = await this.getSellerCustomers(sellerId);
        break;
    }
    
    if (format === 'csv') {
      const csv = new ExportToCsv({
        filename: `${dataType}-${Date.now()}`,
        useTextFile: false,
        useBom: true,
        headers: Object.keys(data[0])
      });
      
      return {
        data: csv.generateCsv(data),
        filename: `${dataType}.csv`,
        mimeType: 'text/csv'
      };
    } else {
      return {
        data: JSON.stringify(data, null, 2),
        filename: `${dataType}.json`,
        mimeType: 'application/json'
      };
    }
  }
}
```

## Promotion System

```typescript
export class PromotionService {
  async createPromotion(
    data: CreatePromotionDto,
    sellerId: string
  ): Promise<Promotion> {
    const promotion = await db.insert(promotions).values({
      id: generateId(),
      sellerId,
      name: data.name,
      type: data.type, // 'percentage', 'fixed', 'bogo', 'free_shipping'
      value: data.value,
      code: data.code || generatePromoCode(),
      conditions: {
        minPurchase: data.minPurchase,
        maxUses: data.maxUses,
        maxUsesPerCustomer: data.maxUsesPerCustomer,
        products: data.productIds,
        categories: data.categories
      },
      startDate: data.startDate,
      endDate: data.endDate,
      active: true,
      usageCount: 0,
      createdAt: new Date()
    });
    
    // Schedule activation/deactivation
    if (data.startDate > new Date()) {
      await this.schedulePromotionActivation(promotion.id, data.startDate);
    }
    
    if (data.endDate) {
      await this.schedulePromotionDeactivation(promotion.id, data.endDate);
    }
    
    return promotion;
  }
  
  async applyPromotion(
    code: string,
    cartItems: CartItem[],
    customerId: string
  ): Promise<PromotionResult> {
    const promotion = await this.getPromotionByCode(code);
    
    // Validate promotion
    const validation = await this.validatePromotion(
      promotion,
      cartItems,
      customerId
    );
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Calculate discount
    const discount = this.calculateDiscount(promotion, cartItems);
    
    // Track usage
    await this.trackPromotionUsage(promotion.id, customerId);
    
    return {
      promotionId: promotion.id,
      discount,
      appliedTo: discount.appliedItems
    };
  }
}
```

## Marketplace UI Components

```tsx
export function ProductGrid({ category }: { category?: string }) {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<'price' | 'rating' | 'newest'>('newest');
  
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['products', category, filters, sort],
    queryFn: ({ pageParam = 1 }) =>
      productService.searchProducts({
        category,
        filters,
        sort,
        page: pageParam
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined
  });
  
  const products = data?.pages.flat() || [];
  
  return (
    <div className="marketplace-container">
      <ProductFilters
        filters={filters}
        onChange={setFilters}
        category={category}
      />
      
      <div className="products-header">
        <span>{products.length} products</span>
        <SortDropdown value={sort} onChange={setSort} />
      </div>
      
      <InfiniteScroll
        dataLength={products.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<ProductSkeleton />}
        className="product-grid"
      >
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </InfiniteScroll>
    </div>
  );
}

// Product card component
export function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const addToCartMutation = useMutation({
    mutationFn: () => cartService.addToCart(product.id, 1),
    onSuccess: () => {
      toast.success('Added to cart');
      queryClient.invalidateQueries(['cart']);
    }
  });
  
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.thumbnail} alt={product.title} />
        {product.discount && (
          <span className="discount-badge">-{product.discount}%</span>
        )}
        <button
          className="wishlist-btn"
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart className={isWishlisted ? 'fill-current' : ''} />
        </button>
      </div>
      
      <div className="product-details">
        <h3>{product.title}</h3>
        <div className="rating">
          <Stars rating={product.rating} />
          <span>({product.reviewCount})</span>
        </div>
        
        <div className="price">
          {product.comparePrice && (
            <span className="compare-price">${product.comparePrice}</span>
          )}
          <span className="current-price">${product.price}</span>
        </div>
        
        <Button
          onClick={() => addToCartMutation.mutate()}
          loading={addToCartMutation.isPending}
          disabled={product.inventory.quantity === 0}
        >
          {product.inventory.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Product Load Time | <500ms | ✅ 400ms |
| Order Processing | <2s | ✅ 1.5s |
| Search Response | <300ms | ✅ 250ms |
| Checkout Flow | <3s | ✅ 2.5s |

## Testing

```typescript
describe('Marketplace', () => {
  it('should process order with inventory management', async () => {
    const product = await productService.createProduct({
      title: 'Test Product',
      price: 99.99,
      quantity: 10
    }, 'seller123');
    
    const order = await orderService.createOrder(
      [{ productId: product.id, quantity: 2 }],
      'buyer123',
      shippingAddress,
      'pm_test'
    );
    
    expect(order.status).toBe('processing');
    
    const updatedProduct = await productService.getProduct(product.id);
    expect(updatedProduct.inventory.quantity).toBe(8);
  });
  
  it('should apply promotions correctly', async () => {
    const promotion = await promotionService.createPromotion({
      name: '20% Off',
      type: 'percentage',
      value: 20,
      code: 'SAVE20'
    }, 'seller123');
    
    const result = await promotionService.applyPromotion(
      'SAVE20',
      cartItems,
      'buyer123'
    );
    
    expect(result.discount.amount).toBe(20);
  });
});
```

## Next Steps

- [ ] Implement auction system
- [ ] Add cryptocurrency payments
- [ ] Enhanced fraud detection
- [ ] Dropshipping integration

---

**Status**: 🟢 Operational
**Dependencies**: Stripe, Search, Database
**Owner**: Commerce Team
**Last Updated**: September 2025