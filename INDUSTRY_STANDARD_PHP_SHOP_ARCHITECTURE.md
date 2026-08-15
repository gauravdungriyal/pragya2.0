# 🏛️ Custom PHP E-Commerce Backend Architecture (Payment Asia Exclusive)

This document presents a production-grade, high-performance, and secure **Headless E-Commerce Architecture** designed for custom PHP backends serving modern React frontends (like Pragya Yog), exclusively integrated with **Payment Asia**.

---

## 🏗️ 1. Database Schema (3rd Normal Form + Payment Asia Schema)

```sql
-- 1. Categories Table (Supports Hierarchical Categories)
CREATE TABLE IF NOT EXISTS `shop_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `parent_id` INT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `shop_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Master Products Table
CREATE TABLE IF NOT EXISTS `shop_products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `category_id` INT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `sale_price` DECIMAL(10,2) DEFAULT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `stock_status` ENUM('In Stock', 'Out of Stock', 'Backorder') DEFAULT 'In Stock',
  `badge` VARCHAR(50) DEFAULT NULL,
  `badge_color` VARCHAR(20) DEFAULT 'amber',
  `image` VARCHAR(550) NOT NULL,
  `gallery_json` JSON DEFAULT NULL,
  `specs_json` JSON DEFAULT NULL,
  `description` TEXT,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `rating_avg` DECIMAL(3,2) DEFAULT 5.00,
  `rating_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `shop_categories`(`id`) ON DELETE SET NULL,
  INDEX idx_category (`category_id`),
  INDEX idx_active (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Product Variants (Handles Sizes, Colors, Options)
CREATE TABLE IF NOT EXISTS `shop_product_variants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `variant_title` VARCHAR(100) NOT NULL, -- e.g., "Medium / Amber"
  `price_adjustment` DECIMAL(10,2) DEFAULT 0.00,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`product_id`) REFERENCES `shop_products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Customer Orders Table (Exclusive Payment Asia Gateway)
CREATE TABLE IF NOT EXISTS `shop_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(32) NOT NULL UNIQUE,
  `idempotency_key` VARCHAR(64) DEFAULT NULL UNIQUE,
  `user_id` INT DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `shipping_address` JSON NOT NULL,
  `payment_method` ENUM('payment_asia') NOT NULL DEFAULT 'payment_asia',
  `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  `order_status` ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
  `subtotal_amount` DECIMAL(10,2) NOT NULL,
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00,
  `shipping_cost` DECIMAL(10,2) DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `coupon_code` VARCHAR(50) DEFAULT NULL,
  `payment_asia_ref` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_user (`user_id`),
  INDEX idx_order_status (`order_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Order Line Items Table
CREATE TABLE IF NOT EXISTS `shop_order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `variant_id` INT DEFAULT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `shop_orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Coupons & Discounts Table
CREATE TABLE IF NOT EXISTS `shop_coupons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_type` ENUM('percentage', 'fixed') NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_spend` DECIMAL(10,2) DEFAULT 0.00,
  `usage_limit` INT DEFAULT NULL,
  `used_count` INT DEFAULT 0,
  `expires_at` DATETIME DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 💳 2. Payment Asia Exclusive Integration Workflow

Payment Asia is configured as the **sole, exclusive payment processor**. It handles Credit Cards (Visa/Mastercard), FPS, WeChat Pay, Alipay, UnionPay, and Octopus through a single unified endpoint.

```
[Customer clicks "Pay with Payment Asia" in React Cart]
                      │
                      ▼
 1. React POSTs to PHP API (`action=init_payment_asia`)
                      │
                      ▼
 2. PHP computes SHA-256 HMAC Signature using `Merchant ID` + `Secret Key`
                      │
                      ▼
 3. PHP returns Payment Asia Hosted Gateway URL + Signature
                      │
                      ▼
 4. Customer completes payment on Payment Asia Gateway
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
 5. [Server Webhook Listener]   6. [Client Return URL]
    Payment Asia POSTs to        Customer redirected back to
    `/webhook_payment_asia.php`  `https://pragya-yog.com/payment-success`
    PHP verifies SHA-256 sign    React shows Order Confirmation!
    & sets order_status = 'paid'
```

### PHP Signature Generation (`init_payment_asia`)
```php
$merchantId = "YOUR_PAYMENT_ASIA_MERCHANT_ID";
$secretKey  = "YOUR_PAYMENT_ASIA_SECRET_KEY";
$orderRef   = "ORD-" . time() . "-" . rand(1000, 9999);
$amount     = number_format($cartTotal, 2, '.', ''); // e.g. "480.00"
$currency   = "HKD";

// Generate SHA-256 HMAC Signature
$rawString = $merchantId . $orderRef . $amount . $currency . $secretKey;
$signature = hash('sha256', $rawString);

echo json_encode([
  "status"      => true,
  "payment_url" => "https://payment.paymentasia.com/checkout",
  "merchant_id" => $merchantId,
  "order_ref"   => $orderRef,
  "amount"      => $amount,
  "currency"    => $currency,
  "signature"   => $signature
]);
```

### PHP Server Webhook Listener (`webhook_payment_asia.php`)
```php
$rawInput = file_get_contents('php://input');
$payload  = json_decode($rawInput, true) ?: $_POST;

$receivedSign = $payload['signature'] ?? '';
$calculatedSign = hash('sha256', $payload['merchant_id'] . $payload['order_ref'] . $payload['amount'] . $payload['currency'] . $secretKey);

if (hash_equals($calculatedSign, $receivedSign) && $payload['status'] === 'success') {
    // Mark Order as Paid
    $stmt = $pdo->prepare("UPDATE shop_orders SET payment_status = 'paid', order_status = 'processing', payment_asia_ref = ? WHERE order_number = ?");
    $stmt->execute([$payload['pay_ref'], $payload['order_ref']]);
    
    http_response_code(200);
    echo "SUCCESS";
} else {
    http_response_code(400);
    echo "INVALID_SIGNATURE";
}
```

---

## 🔌 3. REST API Endpoint Specification

### Public Client Endpoints

| Endpoint Action | Method | Description |
| :--- | :--- | :--- |
| `get_shop_products` | `POST` | Fetch products with category filter, search, price range, and pagination. |
| `get_product_detail` | `POST` | Fetch single product metadata, gallery images, and variants. |
| `apply_shop_coupon` | `POST` | Validate coupon code against order total and expiration date. |
| `init_payment_asia` | `POST` | Generate Payment Asia checkout signature & payload for order. |

### Protected Admin Endpoints (Requires Admin JWT Token)

| Endpoint Action | Method | Description |
| :--- | :--- | :--- |
| `admin_save_product` | `POST` | Create or update product details, inventory, and images. |
| `admin_delete_product` | `POST` | Soft-delete / deactivate product from catalog. |
| `admin_get_orders` | `POST` | List all customer orders with filtering by order status. |
| `admin_update_order_status` | `POST` | Update order state (`processing` -> `shipped` -> `completed`). |
| `admin_save_coupon` | `POST` | Create or modify promotional coupon codes. |
