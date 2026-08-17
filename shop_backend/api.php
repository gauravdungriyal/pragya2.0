<?php
/**
 * ==============================================================================
 * 🛒 PRAGYA YOG SHOP BACKEND API & PAYMENT ASIA INTEGRATION
 * ==============================================================================
 * This modular PHP script handles E-Commerce Catalog, Order Processing, and
 * Payment Asia SHA-256 HMAC Signature Generation & Webhook Callbacks.
 *
 * Can be run standalone or included inside api_v2.php via:
 * require_once __DIR__ . '/shop_backend/api.php';
 * ==============================================================================
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Idempotency-Key');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration Constants (Update with your credentials)
define('PAYMENT_ASIA_MERCHANT_ID', getenv('PAYMENT_ASIA_MERCHANT_ID') ?: 'MERCHANT_DEMO_123');
define('PAYMENT_ASIA_SECRET_KEY',  getenv('PAYMENT_ASIA_SECRET_KEY')  ?: 'SECRET_KEY_DEMO_456');
define('PAYMENT_ASIA_CHECKOUT_URL', getenv('PAYMENT_ASIA_CHECKOUT_URL') ?: 'https://payment.paymentasia.com/checkout');

/**
 * Handle dispatching shop actions
 */
function handleShopAction($action, $input, $pdo) {
    switch ($action) {
        case 'get_shop_products':
            return getShopProducts($input, $pdo);
        case 'get_product_detail':
            return getProductDetail($input, $pdo);
        case 'apply_shop_coupon':
            return applyShopCoupon($input, $pdo);
        case 'init_payment_asia':
            return initPaymentAsia($input, $pdo);
        case 'get_shop_filters':
            return getShopFilters($input, $pdo);
        case 'admin_save_product':
            return adminSaveProduct($input, $pdo);
        case 'admin_delete_product':
            return adminDeleteProduct($input, $pdo);
        default:
            return ['status' => false, 'message' => 'Invalid shop action'];
    }
}

/**
 * 1. Fetch products catalog with category filter & pagination
 */
function getShopProducts($input, $pdo) {
    try {
        $category = $input['category'] ?? 'ALL';
        $search = trim($input['search'] ?? '');
        $limit = isset($input['limit']) ? intval($input['limit']) : 50;

        $sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug 
                FROM shop_products p 
                LEFT JOIN shop_categories c ON p.category_id = c.id 
                WHERE p.is_active = 1";
        $params = [];

        if ($category !== 'ALL' && !empty($category)) {
            $sql .= " AND (c.slug = :cat OR c.id = :cat_id)";
            $params[':cat'] = $category;
            $params[':cat_id'] = is_numeric($category) ? intval($category) : 0;
        }

        if (!empty($search)) {
            $sql .= " AND (p.name LIKE :search OR p.description LIKE :search OR p.sku LIKE :search)";
            $params[':search'] = "%{$search}%";
        }

        $sql .= " ORDER BY p.is_featured DESC, p.id DESC LIMIT " . intval($limit);

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format fields for React frontend compatibility
        $formatted = array_map(function($p) {
            return [
                'id' => String($p['id']),
                'sku' => $p['sku'],
                'name' => $p['name'],
                'category' => $p['category_slug'] ?? 'apparel',
                'categoryName' => $p['category_name'] ?? 'Apparel',
                'price' => floatval($p['price']),
                'discountPrice' => $p['sale_price'] ? floatval($p['sale_price']) : null,
                'currency' => 'HK$',
                'image' => $p['image'],
                'badge' => $p['badge'],
                'badgeColor' => $p['badge_color'] ?? 'amber',
                'description' => $p['description'],
                'stockStatus' => $p['stock_status'],
                'stockQuantity' => intval($p['stock_quantity']),
                'ratingAvg' => floatval($p['rating_avg']),
                'ratingCount' => intval($p['rating_count']),
                'isFeatured' => Boolean($p['is_featured']),
                'isActive' => Boolean($p['is_active']),
            ];
        }, $products);

        return ['status' => true, 'data' => $formatted];
    } catch (Exception $e) {
        return ['status' => false, 'message' => $e->getMessage()];
    }
}

/**
 * 2. Fetch product detail with gallery and variants
 */
function getProductDetail($input, $pdo) {
    try {
        $id = intval($input['id'] ?? 0);
        if (!$id) return ['status' => false, 'message' => 'Product ID required'];

        $stmt = $pdo->prepare("SELECT p.*, c.name AS category_name FROM shop_products p LEFT JOIN shop_categories c ON p.category_id = c.id WHERE p.id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) return ['status' => false, 'message' => 'Product not found'];

        // Variants
        $vStmt = $pdo->prepare("SELECT * FROM shop_product_variants WHERE product_id = ? AND is_active = 1");
        $vStmt->execute([$id]);
        $variants = $vStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'status' => true,
            'data' => array_merge($product, ['variants' => $variants])
        ];
    } catch (Exception $e) {
        return ['status' => false, 'message' => $e->getMessage()];
    }
}

/**
 * 3. Validate coupon code
 */
function applyShopCoupon($input, $pdo) {
    try {
        $code = strtoupper(trim($input['code'] ?? ''));
        $total = floatval($input['total'] ?? 0);

        $stmt = $pdo->prepare("SELECT * FROM shop_coupons WHERE code = ? AND is_active = 1");
        $stmt->execute([$code]);
        $coupon = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$coupon) return ['status' => false, 'message' => 'Invalid or expired coupon code'];

        if ($coupon['expires_at'] && strtotime($coupon['expires_at']) < time()) {
            return ['status' => false, 'message' => 'Coupon has expired'];
        }

        if ($total < floatval($coupon['min_spend'])) {
            return ['status' => false, 'message' => "Minimum spend of HK$" . $coupon['min_spend'] . " required for this coupon"];
        }

        $discount = 0;
        if ($coupon['discount_type'] === 'percentage') {
            $discount = ($total * floatval($coupon['discount_value'])) / 100;
        } else {
            $discount = floatval($coupon['discount_value']);
        }

        return [
            'status' => true,
            'code' => $code,
            'discount_amount' => round($discount, 2),
            'message' => 'Coupon applied successfully!'
        ];
    } catch (Exception $e) {
        return ['status' => false, 'message' => $e->getMessage()];
    }
}

/**
 * 4. Initiate Payment Asia Session (Generates SHA-256 HMAC Signature)
 */
function initPaymentAsia($input, $pdo) {
    try {
        $customerName = trim($input['customer_name'] ?? 'Guest');
        $customerEmail = trim($input['customer_email'] ?? '');
        $customerPhone = trim($input['customer_phone'] ?? '');
        $cartItems = $input['items'] ?? [];
        $couponCode = trim($input['coupon_code'] ?? '');

        if (empty($cartItems)) {
            return ['status' => false, 'message' => 'Cart is empty'];
        }

        // Calculate total amount
        $subtotal = 0;
        foreach ($cartItems as $item) {
            $subtotal += floatval($item['price']) * intval($item['quantity'] ?? 1);
        }

        $discount = 0;
        if (!empty($couponCode)) {
            $couponRes = applyShopCoupon(['code' => $couponCode, 'total' => $subtotal], $pdo);
            if ($couponRes['status']) {
                $discount = $couponRes['discount_amount'];
            }
        }

        $totalAmount = max(0, $subtotal - $discount);
        $orderNum = 'ORD-' . time() . '-' . rand(1000, 9999);
        $idempotencyKey = $input['idempotency_key'] ?? ($orderNum . '-idemp');

        // Check if order already exists (Idempotency check)
        $idempStmt = $pdo->prepare("SELECT order_number FROM shop_orders WHERE idempotency_key = ?");
        $idempStmt->execute([$idempotencyKey]);
        $existingOrder = $idempStmt->fetch(PDO::FETCH_ASSOC);

        if ($existingOrder) {
            $orderNum = $existingOrder['order_number'];
        } else {
            // Create pending order
            $insStmt = $pdo->prepare("INSERT INTO shop_orders 
                (order_number, idempotency_key, customer_name, customer_email, customer_phone, shipping_address, payment_method, payment_status, order_status, subtotal_amount, discount_amount, total_amount, coupon_code) 
                VALUES (?, ?, ?, ?, ?, ?, 'payment_asia', 'pending', 'pending', ?, ?, ?, ?)");
            $insStmt->execute([
                $orderNum,
                $idempotencyKey,
                $customerName,
                $customerEmail,
                $customerPhone,
                json_encode($input['shipping_address'] ?? ['country' => 'Hong Kong']),
                $subtotal,
                $discount,
                $totalAmount,
                $couponCode
            ]);
            $orderId = $pdo->lastInsertId();

            // Insert line items
            $itemStmt = $pdo->prepare("INSERT INTO shop_order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)");
            foreach ($cartItems as $item) {
                $itemStmt->execute([
                    $orderId,
                    intval($item['id'] ?? 0),
                    $item['name'] ?? 'Product',
                    floatval($item['price']),
                    intval($item['quantity'] ?? 1),
                    floatval($item['price']) * intval($item['quantity'] ?? 1)
                ]);
            }
        }

        // Generate Payment Asia SHA-256 HMAC Signature
        $merchantId = PAYMENT_ASIA_MERCHANT_ID;
        $secretKey  = PAYMENT_ASIA_SECRET_KEY;
        $amountStr  = number_format($totalAmount, 2, '.', '');
        $currency   = 'HKD';

        $rawSignString = $merchantId . $orderNum . $amountStr . $currency . $secretKey;
        $signature = hash('sha256', $rawSignString);

        return [
            'status' => true,
            'order_number' => $orderNum,
            'total_amount' => $totalAmount,
            'currency' => $currency,
            'payment_asia' => [
                'checkout_url' => PAYMENT_ASIA_CHECKOUT_URL,
                'merchant_id'  => $merchantId,
                'order_ref'    => $orderNum,
                'amount'       => $amountStr,
                'currency'     => $currency,
                'signature'    => $signature,
                'return_url'   => ($input['return_url'] ?? 'https://pragya-yog.com/payment-success')
            ]
        ];
    } catch (Exception $e) {
        return ['status' => false, 'message' => $e->getMessage()];
    }
}

/**
 * 5. Admin: Save or update product catalog
 */
function adminSaveProduct($input, $pdo) {
    try {
        $id = isset($input['id']) ? intval($input['id']) : 0;
        $name = trim($input['title'] ?? $input['name'] ?? '');
        $sku = trim($input['sku'] ?? ('SKU-' . time()));
        $price = floatval($input['price'] ?? 0);
        $salePrice = isset($input['discountPrice']) ? floatval($input['discountPrice']) : (isset($input['salePrice']) ? floatval($input['salePrice']) : null);
        $stock = intval($input['stockQuantity'] ?? 50);
        $stockStatus = trim($input['stockStatus'] ?? 'In Stock');
        $productType = trim($input['productType'] ?? 'simple');
        $image = trim($input['image'] ?? 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80');
        $desc = trim($input['description'] ?? '');
        $badge = trim($input['badge'] ?? '');
        $galleryJson = isset($input['gallery']) && is_array($input['gallery']) ? json_encode($input['gallery']) : null;
        $specsJson = isset($input['specs']) && is_array($input['specs']) ? json_encode($input['specs']) : null;

        if (empty($name) || $price <= 0) {
            return ['status' => false, 'message' => 'Valid product name and price are required'];
        }

        $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));

        if ($id > 0) {
            $stmt = $pdo->prepare("UPDATE shop_products SET name = ?, sku = ?, price = ?, sale_price = ?, stock_quantity = ?, stock_status = ?, image = ?, description = ?, badge = ?, gallery_json = ?, specs_json = ? WHERE id = ?");
            $stmt->execute([$name, $sku, $price, $salePrice, $stock, $stockStatus, $image, $desc, $badge, $galleryJson, $specsJson, $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO shop_products (sku, name, slug, price, sale_price, stock_quantity, stock_status, image, description, badge, gallery_json, specs_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$sku, $name, $slug, $price, $salePrice, $stock, $stockStatus, $image, $desc, $badge, $galleryJson, $specsJson]);
            $id = $pdo->lastInsertId();
        }

        // Save or sync variants if variable product
        if ($productType === 'variable' && isset($input['variants']) && is_array($input['variants'])) {
            // Soft delete existing variants for re-sync
            $delStmt = $pdo->prepare("UPDATE shop_product_variants SET is_active = 0 WHERE product_id = ?");
            $delStmt->execute([$id]);

            $vInsStmt = $pdo->prepare("INSERT INTO shop_product_variants (product_id, sku, variant_title, price, sale_price, stock_quantity, stock_status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
            foreach ($input['variants'] as $v) {
                $vInsStmt->execute([
                    $id,
                    trim($v['sku'] ?? ($sku . '-' . rand(100,999))),
                    trim($v['variantTitle'] ?? 'Standard'),
                    floatval($v['price'] ?? $price),
                    isset($v['discountPrice']) ? floatval($v['discountPrice']) : null,
                    intval($v['stockQuantity'] ?? 10),
                    trim($v['stockStatus'] ?? 'In Stock')
                ]);
            }
        }

        return ['status' => true, 'id' => $id, 'message' => 'Product saved successfully!'];
    } catch (Exception $e) {
        return ['status' => false, 'message' => $e->getMessage()];
    }
}

/**
 * 6. Admin: Soft delete product
 */
function adminDeleteProduct($input, $pdo) {
    try {
        $id = intval($input['id'] ?? 0);
        if (!$id) return ['status' => false, 'message' => 'Product ID required'];

        $stmt = $pdo->prepare("UPDATE shop_products SET is_active = 0 WHERE id = ?");
        $stmt->execute([$id]);

        return ['status' => true, 'message' => 'Product deleted successfully'];
    } catch (Exception $e) {
        return ['status' => false, 'message' => $e->getMessage()];
    }
}

/**
 * 7. Dynamic shop categories, brands, and audience filter options
 */
function getShopFilters($input, $pdo) {
    try {
        $categories = [];
        try {
            $catStmt = $pdo->query("SELECT id, name, slug FROM shop_categories ORDER BY id ASC");
            if ($catStmt) {
                $dbCats = $catStmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($dbCats as $c) {
                    $categories[] = [
                        'id' => $c['slug'] ?: strval($c['id']),
                        'slug' => $c['slug'] ?: strval($c['id']),
                        'name' => $c['name'],
                        'label' => $c['name']
                    ];
                }
            }
        } catch (Exception $ex) {}

        if (empty($categories)) {
            $categories = [
                ['id' => 'apparel', 'slug' => 'apparel', 'name' => 'Apparel & Yogic Wear', 'label' => 'Apparel & Yogic Wear'],
                ['id' => 'mats', 'slug' => 'mats', 'name' => 'Mats & Accessories', 'label' => 'Mats & Accessories'],
                ['id' => 'wellness', 'slug' => 'wellness', 'name' => 'Wellness & Oils', 'label' => 'Wellness & Oils'],
                ['id' => 'meditation', 'slug' => 'meditation', 'name' => 'Meditation Essentials', 'label' => 'Meditation Essentials'],
                ['id' => 'props', 'slug' => 'props', 'name' => 'Blocks & Props', 'label' => 'Blocks & Props']
            ];
        }

        $defaultBrands = ['Pragya Sanctuary', 'Himalayan Craft', 'Rishikesh Handloom', 'Sattva Essentials'];
        $dbBrands = [];
        try {
            $brandStmt = $pdo->query("SELECT DISTINCT brand FROM shop_products WHERE is_active = 1 AND brand IS NOT NULL AND brand != ''");
            if ($brandStmt) {
                $dbBrands = $brandStmt->fetchAll(PDO::FETCH_COLUMN);
            }
        } catch (Exception $ex) {}

        $brands = array_values(array_unique(array_merge($defaultBrands, array_filter($dbBrands))));

        $audiences = [
            ['id' => 'ALL', 'label' => 'All Items'],
            ['id' => 'Unisex', 'label' => 'Unisex Practice Essentials'],
            ['id' => 'Women', 'label' => 'Women'],
            ['id' => 'Men', 'label' => 'Men']
        ];

        return [
            'status' => true,
            'data' => [
                'categories' => $categories,
                'brands' => $brands,
                'audiences' => $audiences
            ]
        ];
    } catch (Exception $e) {
        return ['status' => false, 'message' => $e->getMessage()];
    }
}

// Standalone execution wrapper (if hit directly via POST)
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    if (empty($action)) {
        $inputData = json_decode(file_get_contents('php://input'), true);
        $action = $inputData['action'] ?? '';
    } else {
        $inputData = $_POST;
    }

    // Database Connection (Fallback demo connection)
    $dbHost = getenv('DB_HOST') ?: '127.0.0.1';
    $dbName = getenv('DB_NAME') ?: 'pragyayog_db';
    $dbUser = getenv('DB_USER') ?: 'root';
    $dbPass = getenv('DB_PASS') ?: '';

    try {
        $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        $response = handleShopAction($action, $inputData, $pdo);
        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode([
            'status' => false,
            'message' => 'Database connection failed: ' . $e->getMessage()
        ]);
    }
}
