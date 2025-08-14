# Database Schema and Laravel Backend Integration

## Database Schema

### Categories Table
```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(50) NULL,
    description TEXT NULL,
    parent_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

### Products Table
```sql
CREATE TABLE products (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    -- slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    image_url VARCHAR(255) NULL,
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'wallet', 'split') NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Users Table
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'cashier', 'seller') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Discounts Table
```sql
CREATE TABLE discounts (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    min_purchase_amount DECIMAL(10,2) NULL,
    max_discount_amount DECIMAL(10,2) NULL,
    usage_limit INT NULL,
    times_used INT NOT NULL DEFAULT 0,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Laravel API Integration


### Directory Structure
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── ProductController.php
│   │   ├── CategoryController.php
│   │   ├── OrderController.php
│   │   ├── UserController.php
│   │   └── DiscountController.php
│   │
│   ├── Requests/
│   │   ├── StoreProductRequest.php
│   │   ├── UpdateProductRequest.php
│   │   ├── StoreOrderRequest.php
│   │   └── ...
│   │
│   ├── Resources/
│   │   ├── ProductResource.php
│   │   ├── CategoryResource.php
│   │   ├── OrderResource.php
│   │   └── ...
│   │
│   └── Middleware/
│       └── RoleMiddleware.php
│
├── Models/
│   ├── Product.php
│   ├── Category.php
│   ├── Order.php
│   ├── OrderItem.php
│   ├── User.php
│   └── Discount.php
│
└── Services/
    ├── OrderService.php
    └── InventoryService.php
```

### API Routes
```php
<?php
Route::prefix('v1')->group(function () {
    // Auth routes
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

    // Protected routes
    Route::middleware(['auth:sanctum'])->group(function () {
        // Products
        Route::apiResource('products', ProductController::class);
        Route::get('products/by-category/{category}', [ProductController::class, 'byCategory']);
        Route::post('products/stock/adjust', [ProductController::class, 'adjustStock']);

        // Categories
        Route::apiResource('categories', CategoryController::class);

        // Orders
        Route::apiResource('orders', OrderController::class);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::get('orders/stats/daily', [OrderController::class, 'dailyStats']);

        // Discounts
        Route::apiResource('discounts', DiscountController::class);
        Route::post('discounts/validate', [DiscountController::class, 'validateCode']);

        // Users (protected by admin middleware)
        Route::middleware(['role:admin'])->group(function () {
            Route::apiResource('users', UserController::class);
        });
    });
});
```

### Product Controller
```php
<?php
class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->when($request->category_id, fn($q) => $q->whereCategoryId($request->category_id))
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->paginate(20);

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());
        return new ProductResource($product);
    }
}
```

### Order Controller
```php
<?php
class OrderController extends Controller
{
    private $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function store(StoreOrderRequest $request)
    {
        try {
            $order = $this->orderService->createOrder($request->validated());
            return new OrderResource($order);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
```

### Order Service
```php
<?php
class OrderService
{
    private $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function createOrder(array $data)
    {
        DB::beginTransaction();
        try {
            // Create order
            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'customer_name' => $data['customer_name'],
                'subtotal' => $data['subtotal'],
                'tax_amount' => $data['tax_amount'],
                'discount_amount' => $data['discount_amount'],
                'total_amount' => $data['total_amount'],
                'payment_method' => $data['payment_method'],
                'created_by' => auth()->id()
            ]);

            // Create order items and adjust inventory
            foreach ($data['items'] as $item) {
                $order->items()->create($item);
                $this->inventoryService->decreaseStock($item['product_id'], $item['quantity']);
            }

            DB::commit();
            return $order;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
```

### Frontend Integration
Frontend Integration
Update the frontend to use these APIs:

 - Create API client service
 - Implement authentication
 - Update components to fetch and send data to the API

#### Example API client setup:
```typescript
// services/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
```

This schema and integration provide a solid foundation for the POS system, supporting all current features with room for expansion.

Key features supported:

 - Product and category management
 - Order processing with inventory tracking
 - User authentication and authorization
 - Discount management
 - Real-time stock updates
 - Sales reporting
 - Multi-user support with role-based access
  
#### Remember to:

 - Implement proper validation
 - Add indexes for frequently queried columns
 - Set up proper error handling
 - Implement caching where appropriate
 - Add API documentation
 - Set up proper logging
 - Implement rate limiting
 - Set up database backups