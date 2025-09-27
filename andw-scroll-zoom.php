<?php
/**
 * Plugin Name: andW Scroll Zoom
 * Description: 画像が画面に完全に入ったら拡大／縮小するスクロール演出プラグイン
 * Version: 0.01
 * Author: Netservice
 * Author URI: https://netservice.jp/
 * License: GPLv2 or later
 * Text Domain: andw-scroll-zoom
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ANDW_ZOOM_VERSION', '0.01' );
define( 'ANDW_ZOOM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ANDW_ZOOM_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );

class ANDW_Scroll_Zoom {

	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * フロントエンドでのスクリプト・スタイル読み込み
	 */
	public function enqueue_scripts() {
		if ( is_admin() ) {
			return;
		}

		wp_enqueue_style(
			'andw-scroll-zoom',
			ANDW_ZOOM_PLUGIN_URL . 'assets/andw-scroll-zoom.css',
			array(),
			ANDW_ZOOM_VERSION
		);

		wp_enqueue_script(
			'andw-scroll-zoom',
			ANDW_ZOOM_PLUGIN_URL . 'assets/andw-scroll-zoom.js',
			array(),
			ANDW_ZOOM_VERSION,
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
		);
	}
}

function andw_zoom_init() {
	new ANDW_Scroll_Zoom();
}
add_action( 'init', 'andw_zoom_init' );