<?php
// WP設定ファイルから DB認証情報を取得
$wpconfig = file_get_contents('/opt/bitnami/wordpress/wp-config.php');
preg_match("/define\s*\(\s*'DB_NAME'\s*,\s*'([^']+)'/m", $wpconfig, $m); $db = $m[1] ?? 'bitnami_wordpress';
preg_match("/define\s*\(\s*'DB_USER'\s*,\s*'([^']+)'/m", $wpconfig, $m); $user = $m[1] ?? 'bn_wordpress';
preg_match("/define\s*\(\s*'DB_PASSWORD'\s*,\s*'([^']+)'/m", $wpconfig, $m); $pass = $m[1] ?? '';
preg_match("/define\s*\(\s*'DB_HOST'\s*,\s*'([^']+)'/m", $wpconfig, $m); $host = $m[1] ?? '127.0.0.1';
preg_match("/\\\$table_prefix\s*=\s*'([^']+)'/m", $wpconfig, $m); $prefix = $m[1] ?? 'wp_';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) { die("Connect failed: " . $conn->connect_error . "\n"); }

echo "=== WPS Hide Login 設定 ===\n";
$r = $conn->query("SELECT option_name, option_value FROM {$prefix}options WHERE option_name IN ('whl_page','whl_redirect','siteurl','blogurl','home') ORDER BY option_name");
while ($row = $r->fetch_assoc()) {
    echo $row['option_name'] . " = " . $row['option_value'] . "\n";
}

echo "\n=== WP セッション設定 ===\n";
$r = $conn->query("SELECT option_name, option_value FROM {$prefix}options WHERE option_name LIKE '%session%' OR option_name LIKE '%auth_key%' OR option_name LIKE '%cookie%' ORDER BY option_name LIMIT 10");
while ($row = $r->fetch_assoc()) {
    $val = strlen($row['option_value']) > 60 ? substr($row['option_value'], 0, 60) . '...' : $row['option_value'];
    echo $row['option_name'] . " = " . $val . "\n";
}

echo "\n=== アクティブプラグイン ===\n";
$r = $conn->query("SELECT option_value FROM {$prefix}options WHERE option_name = 'active_plugins'");
$row = $r->fetch_assoc();
$plugins = unserialize($row['option_value']);
foreach ($plugins as $p) { echo "  " . $p . "\n"; }

echo "\n=== WPS Hide Login プラグイン詳細 ===\n";
$plugin_file = '/opt/bitnami/wordpress/wp-content/plugins/wps-hide-login/wps-hide-login.php';
if (file_exists($plugin_file)) {
    $content = file_get_contents($plugin_file);
    // Version
    preg_match('/Version:\s*(.+)/m', $content, $m);
    echo "Version: " . ($m[1] ?? 'unknown') . "\n";
}

// wps-hide-login の動作原理チェック
$main_file = '/opt/bitnami/wordpress/wp-content/plugins/wps-hide-login/includes/class-wps-hide-login.php';
if (file_exists($main_file)) {
    $content = file_get_contents($main_file);
    // セッション/クッキーに関する処理を探す
    if (strpos($content, 'setcookie') !== false) {
        echo "★ setcookie() 使用あり（独自クッキー管理）\n";
    }
    if (strpos($content, '$_COOKIE') !== false) {
        echo "★ \$_COOKIE チェックあり\n";
    }
    // リダイレクト先
    preg_match_all('/redirect.*?404|404.*?redirect/i', $content, $matches);
    if (!empty($matches[0])) {
        echo "404リダイレクト処理あり\n";
    }
}
