# 🛒 Pragya Yog Shop Backend & Payment Asia Integration

This directory contains the complete Core PHP backend for the Pragya Yog E-Commerce Shop and Payment Asia payment gateway integration.

---

## 📁 Folder Structure

```
shop_backend/
├── schema.sql                   # MySQL database tables and seed data
├── api.php                      # Core PHP API for catalog, orders, and Payment Asia HMAC
├── webhook_payment_asia.php     # Payment Asia background notification listener
└── README.md                    # Integration & deployment guide
```

---

## 🚀 Setup Instructions

### 1. Import Database Schema
Import `shop_backend/schema.sql` into your MySQL database via phpMyAdmin or command line:
```bash
mysql -u root -p pragyayog_db < shop_backend/schema.sql
```

### 2. Configure Environment Variables / Credentials
In `shop_backend/api.php` and `shop_backend/webhook_payment_asia.php`, set your Payment Asia Merchant ID and Secret Key:
```php
define('PAYMENT_ASIA_MERCHANT_ID', 'YOUR_MERCHANT_ID');
define('PAYMENT_ASIA_SECRET_KEY',  'YOUR_SECRET_KEY');
```

### 3. Integrate with Existing Main Website `api_v2.php`
To merge this shop backend into your existing website backend (`api_v2.php`), simply include `shop_backend/api.php` inside your action handler:

```php
// Inside api_v2.php
switch ($action) {
    case 'get_shop_products':
    case 'get_product_detail':
    case 'apply_shop_coupon':
    case 'init_payment_asia':
    case 'admin_save_product':
    case 'admin_delete_product':
        require_once __DIR__ . '/shop_backend/api.php';
        $response = handleShopAction($action, $_POST, $pdo);
        echo json_encode($response);
        exit();
}
```

### 4. Configure Payment Asia Webhook URL
In your Payment Asia Merchant Portal, set the **Data Feed / Notification URL** to:
`https://your-domain.com/shop_backend/webhook_payment_asia.php`
