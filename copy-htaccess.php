<?php
$source = __DIR__ . '/.htaccess';
$dirs = array_filter(glob(__DIR__ . '/../*'), 'is_dir');
foreach ($dirs as $dir) {
    if (realpath($dir) !== realpath(__DIR__) && is_dir($dir)) {
        copy($source, $dir . '/.htaccess');
        echo "Copiado a " . basename($dir) . "/.htaccess<br>";
    }
}
echo "✅ Listo";