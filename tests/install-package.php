<?php
// Disposable Playground integration test. No theme source directory is mounted.
if (!defined('DOCUMENT_PACKAGE_TEST')) { return; }
register_shutdown_function(function() { $error = error_get_last(); if ($error && in_array($error['type'], [E_ERROR,E_PARSE,E_COMPILE_ERROR])) file_put_contents('/test-artifacts/last-fatal.json',json_encode($error)); });
require '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
require_once ABSPATH . 'wp-admin/includes/theme.php';
wp_set_current_user(1);
if (!defined('FS_METHOD')) define('FS_METHOD', 'direct');
$results = [];
foreach (['default', 'pclzip'] as $engine) {
    if ($engine === 'pclzip') add_filter('unzip_file_use_ziparchive', '__return_false');
    $skin = new WP_Ajax_Upgrader_Skin();
    $upgrader = new Theme_Upgrader($skin);
    ob_start();
    $installed = $upgrader->install('/test-artifacts/' . DOCUMENT_PACKAGE_TEST, ['overwrite_package' => true]);
    $output = ob_get_clean();
    $overwritten = $installed === true ? $upgrader->install('/test-artifacts/' . DOCUMENT_PACKAGE_TEST, ['overwrite_package' => true]) : false;
    $theme = wp_get_theme('theme-document');
    $results[$engine] = [
        'success' => $installed === true,
        'overwriteSuccess' => $overwritten === true,
        'installedDirectory' => $theme->get_stylesheet_directory(),
        'result' => is_wp_error($installed) ? $installed->get_error_messages() : $installed,
        'skinErrors' => $skin->get_errors()->get_error_messages(),
        'themeExists' => $theme->exists(),
        'themeErrors' => $theme->errors() ? $theme->errors()->get_error_messages() : [],
        'name' => $theme->get('Name'),
        'version' => $theme->get('Version'),
        'zipArchiveAvailable' => class_exists('ZipArchive'),
        'output' => $output,
    ];
    if ($theme->exists()) delete_theme('theme-document');
    remove_filter('upgrader_source_selection', [$upgrader, 'check_package']);
    remove_filter('upgrader_pre_install', [$upgrader, 'current_before']);
    remove_filter('upgrader_post_install', [$upgrader, 'current_after']);
}
file_put_contents('/test-artifacts/' . DOCUMENT_PACKAGE_TEST . '.result.json', json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
