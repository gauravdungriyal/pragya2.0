<?php
/**
 * ==============================================================================
 * 💳 PAYMENT ASIA WEBHOOK LISTENER (webhook_payment_asia.php)
 * ==============================================================================
 * Payment Asia sends background server-to-server POST notifications to this
 * endpoint when a customer completes payment.
 *
 * Verifies SHA-256 HMAC Signature, marks order as 'paid', and deducts stock.
 * ==============================================================================
 */

header('Content-Type: text/plain; charset=utf-8');

define('PAYMENT_ASIA_SECRET_KEY', getenv('PAYMENT_ASIA_SECRET_KEY') ?: 'SECRET_KEY_DEMO_456');

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: $_POST;

if (empty($data)) {
    http_response_code(400);
    echo "ERROR: Empty Payload";
    exit();
}

$merchantId = $data['merchant_id'] ?? '';
$orderRef   = $data['order_ref'] ?? '';
$amount     = $data['amount'] ?? '';
$currency   = $data['currency'] ?? 'HKD';
$receivedSign = $data['signature'] ?? '';
$payStatus   = strtolower($data['status'] ?? '');
$payRef      = $data['pay_ref'] ?? $data['transaction_id'] ?? 'PA-' . time();

// 1. Verify SHA-256 HMAC Signature
$secretKey = PAYMENT_ASIA_SECRET_KEY;
$expectedSignString = $merchantId . $orderRef . $amount . $currency . $secretKey;
$calculatedSignature = hash('sha256', $expectedSignString);

if (!hash_equals($calculatedSignature, $receivedSign)) {
    http_response_code(400);
    echo "ERROR: Invalid Signature Verification";
    exit();
}

// 2. Database Connection
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbName = getenv('DB_NAME') ?: 'pragyayog_db';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    if ($payStatus === 'success' || $payStatus === 'approved' || $payStatus === 'paid') {
        // Mark Order as Paid
        $stmt = $pdo->prepare("UPDATE shop_orders SET payment_status = 'paid', order_status = 'processing', payment_asia_ref = ? WHERE order_number = ?");
        $stmt->execute([$payRef, $orderRef]);

        // Atomic Stock Deduction for Order Line Items
        $itemsStmt = $pdo->prepare("SELECT product_id, quantity FROM shop_order_items oi JOIN shop_orders o ON oi.order_id = o.id WHERE o.order_number = ?");
        $itemsStmt->execute([$orderRef]);
        $items = $itemsStmt->fetchAll();

        foreach ($items as $item) {
            $deductStmt = $pdo->prepare("UPDATE shop_products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?");
            $deductStmt->execute([intval($item['quantity']), intval($item['product_id'])]);
        }

        http_response_code(200);
        echo "OK: Order {$orderRef} Marked Paid";
    } else {
        $stmt = $pdo->prepare("UPDATE shop_orders SET payment_status = 'failed' WHERE order_number = ?");
        $stmt->execute([$orderRef]);

        http_response_code(200);
        echo "OK: Order {$orderRef} Marked Failed";
    }
} catch (Exception $e) {
    http_response_code(500);
    echo "SERVER ERROR: " . $e->getMessage();
}
