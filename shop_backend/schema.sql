-- ==============================================================================
-- 🛒 PRAGYA YOG E-COMMERCE DATABASE SCHEMA (EXCLUSIVE PAYMENT ASIA GATEWAY)
-- ==============================================================================
-- Run this SQL script in your MySQL Database (phpMyAdmin / MySQL CLI)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `shop_order_items`;
DROP TABLE IF EXISTS `shop_orders`;
DROP TABLE IF EXISTS `shop_product_variants`;
DROP TABLE IF EXISTS `shop_products`;
DROP TABLE IF EXISTS `shop_categories`;
DROP TABLE IF EXISTS `shop_coupons`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Categories Table (Supports Hierarchical Categories)
CREATE TABLE `shop_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `parent_id` INT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `shop_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Sample Categories
INSERT INTO `shop_categories` (`id`, `name`, `slug`) VALUES
(1, 'Apparel & Yogic Wear', 'apparel'),
(2, 'Mats & Accessories', 'mats'),
(3, 'Wellness & Oils', 'wellness'),
(4, 'Meditation Essentials', 'meditation'),
(5, 'Blocks & Props', 'props');

-- 2. Master Products Table
CREATE TABLE `shop_products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `category_id` INT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `sale_price` DECIMAL(10,2) DEFAULT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 100,
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

-- Seed Sample Products
INSERT INTO `shop_products` 
(`id`, `sku`, `name`, `slug`, `category_id`, `price`, `sale_price`, `stock_quantity`, `badge`, `badge_color`, `image`, `description`, `is_featured`) 
VALUES
(1, 'MAT-PRO-01', 'Eco-Cork Non-Slip Yoga Mat (6mm)', 'eco-cork-yoga-mat', 2, 420.00, 520.00, 50, '100% Organic Cork', 'amber', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80', 'Premium eco-friendly natural cork top with recycled rubber bottom for non-slip sweat grip.', 1),
(2, 'APP-WRAP-02', 'Pragya Seamless Meditation Wrap', 'seamless-meditation-wrap', 1, 480.00, 580.00, 45, 'Ultra-Soft Bamboo', 'amber', 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=1000&q=80', 'Wrap yourself in buttery-soft bamboo thermal fabric to retain body heat during Savasana.', 0),
(3, 'PRO-BLOCK-03', 'Natural Solid Cork Yoga Block Set (Pair)', 'solid-cork-block-set', 5, 260.00, 320.00, 80, 'High Density', 'emerald', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80', 'Sustainable high-density solid cork blocks with bevelled edges for comfortable support.', 0),
(4, 'MED-BOWL-04', 'Hand-Hammered Tibetan Singing Bowl', 'tibetan-singing-bowl-set', 4, 680.00, 850.00, 20, 'Handcrafted', 'purple', 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=1000&q=80', 'Authentic 7-metal Tibetan sound bowl set with wooden striker and hand-cushion ring.', 1);

-- 3. Product Variants Table (Sizes / Colors)
CREATE TABLE `shop_product_variants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `variant_title` VARCHAR(100) NOT NULL,
  `price_adjustment` DECIMAL(10,2) DEFAULT 0.00,
  `stock_quantity` INT NOT NULL DEFAULT 20,
  `is_active` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`product_id`) REFERENCES `shop_products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Customer Orders Table (Payment Asia Exclusive)
CREATE TABLE `shop_orders` (
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
CREATE TABLE `shop_order_items` (
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

-- 6. Coupons Table
CREATE TABLE `shop_coupons` (
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

-- Seed Sample Coupon
INSERT INTO `shop_coupons` (`code`, `discount_type`, `discount_value`, `min_spend`, `expires_at`)
VALUES ('PRAGYA10', 'percentage', 10.00, 200.00, '2030-12-31 23:59:59');
