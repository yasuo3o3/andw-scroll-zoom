<?php
/**
 * ANDW Scroll Zoom - アンインストール処理
 * プラグイン削除時の設定・データクリーンアップ
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// andw_ プレフィックスのオプションを削除
$option_keys = array(
	'andw_zoom_settings',
	'andw_zoom_version',
);

foreach ( $option_keys as $key ) {
	delete_option( $key );
	delete_site_option( $key );
}

// andw_ プレフィックスのtransientsを削除
$transient_keys = array(
	'andw_zoom_cache',
	'andw_zoom_config',
);

foreach ( $transient_keys as $key ) {
	delete_transient( $key );
	delete_site_transient( $key );
}

// 自作のオブジェクトキャッシュをクリア（andw_プレフィックスのみ）
if ( function_exists( 'wp_cache_delete' ) ) {
	// 具体的なキャッシュキーがある場合はここで削除
	wp_cache_delete( 'andw_zoom_elements', 'andw_zoom' );
	wp_cache_delete( 'andw_zoom_settings', 'andw_zoom' );
}

// メタデータの削除（必要に応じて）
// 注意：wp_cache_flush() は使用しない（他プラグインに影響するため）