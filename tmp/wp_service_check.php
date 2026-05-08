<?php
$wpconfig = file_get_contents('/opt/bitnami/wordpress/wp-config.php');
preg_match("/define\s*\(\s*'DB_NAME'\s*,\s*'([^']+)'/m", $wpconfig, $m); $db = $m[1];
preg_match("/define\s*\(\s*'DB_USER'\s*,\s*'([^']+)'/m", $wpconfig, $m); $user = $m[1];
preg_match("/define\s*\(\s*'DB_PASSWORD'\s*,\s*'([^']+)'/m", $wpconfig, $m); $pass = $m[1];
$conn = new mysqli('127.0.0.1', $user, $pass, $db);

echo "=== /service ページの最終更新 ===\n";
$r = $conn->query("SELECT ID, post_title, post_status, post_modified, post_name FROM wp_posts WHERE post_name='service' OR post_name LIKE '%service%' ORDER BY post_modified DESC LIMIT 5");
while ($row = $r->fetch_assoc()) {
    echo "ID:{$row['ID']} | {$row['post_name']} | {$row['post_title']} | {$row['post_status']} | 更新:{$row['post_modified']}\n";
}

echo "\n=== Elementor CSS（/service ページ用）最終生成日時 ===\n";
$r = $conn->query("SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id IN (SELECT ID FROM wp_posts WHERE post_name='service') AND meta_key IN ('_elementor_css', '_elementor_data', '_elementor_version') ORDER BY meta_key");
while ($row = $r->fetch_assoc()) {
    $val = strlen($row['meta_value']) > 100 ? substr($row['meta_value'], 0, 100) . '...' : $row['meta_value'];
    echo $row['meta_key'] . ": " . $val . "\n";
}

echo "\n=== 直近の投稿更新一覧（3/26以降） ===\n";
$r = $conn->query("SELECT ID, post_name, post_title, post_status, post_modified FROM wp_posts WHERE post_modified >= '2026-03-26' AND post_type IN ('page','post') ORDER BY post_modified DESC LIMIT 20");
while ($row = $r->fetch_assoc()) {
    echo "ID:{$row['ID']} | {$row['post_name']} | {$row['post_title']} | {$row['post_status']} | {$row['post_modified']}\n";
}
