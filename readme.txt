=== ANDW Scroll Zoom ===
Contributors: netservice
Tags: scroll, zoom, animation, images, intersection
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 0.01
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

画像が画面に完全に入ったら拡大／縮小するスクロール演出プラグイン。IntersectionObserver使用で高パフォーマンス。

== Description ==

**ANDW Scroll Zoom** は、画像のスクロール連動拡大/縮小エフェクトを提供するWordPressプラグインです。

### 主な機能

* **個別指定**: `.andw-zoom` クラスまたは `[data-andw-zoom]` 属性で個別要素を対象
* **グループ指定**: `.andw-zoom-group` で子の `img` 要素をまとめて制御
* **継承ルール**: 親要素の設定を子が継承、子の個別設定が優先
* **動作モード**: `out`（小→大）、`in`（大→小）
* **高パフォーマンス**: IntersectionObserver使用、設定ごとにプール管理
* **アクセシビリティ**: `prefers-reduced-motion` 対応
* **動的対応**: MutationObserverでlazyload等に対応

### 使用方法

#### 基本的な使い方

```html
<!-- 個別指定 -->
<img src="image.jpg" class="andw-zoom" alt="画像">

<!-- グループ指定 -->
<div class="andw-zoom-group">
    <img src="image1.jpg" alt="画像1">
    <img src="image2.jpg" alt="画像2">
</div>
```

#### カスタマイズ

| データ属性 | 説明 | 既定値 |
|------------|------|--------|
| `data-andw-zoom-mode` | `out`(小→大) / `in`(大→小) | `out` |
| `data-andw-zoom-from` | 開始スケール値 | `0.92` |
| `data-andw-zoom-to` | 終了スケール値 | `1.0` |
| `data-andw-threshold` | 表示判定閾値(0.0-1.0) | `1.0` |
| `data-andw-root-margin` | 判定マージン | `0px` |
| `data-andw-repeat` | 繰り返し(`true`/`false`) | `true` |
| `data-andw-media` | メディアクエリ条件 | なし |

#### 継承の例

```html
<div class="andw-zoom-group" data-andw-zoom-mode="in" data-andw-zoom-from="0.8">
    <img src="image1.jpg" alt="画像1"> <!-- 親設定を継承 -->
    <img src="image2.jpg" data-andw-zoom-from="0.9" alt="画像2"> <!-- 子設定が優先 -->
</div>
```

### 動作環境

* **ブラウザ対応**: IntersectionObserver対応ブラウザ（IE11以外）
* **フォールバック**: 非対応環境では静的表示
* **CLS対策**: 画像寸法指定推奨

== Installation ==

1. プラグインをアップロードして有効化
2. 対象画像に `.andw-zoom` クラスまたは `[data-andw-zoom]` 属性を追加
3. 必要に応じてデータ属性でカスタマイズ

== Frequently Asked Questions ==

= 画像がちらつくのですが？ =

画像に `width`/`height` 属性または CSS の `aspect-ratio` を指定してください。CLS（Cumulative Layout Shift）回避のため寸法指定が重要です。

= iOS Safari で動作しないのですが？ =

iOS 12.2 以降の Safari が必要です。それ以前のバージョンでは静的表示となります。

= 動的に追加された画像に適用されませんか？ =

MutationObserver により自動検出されます。ただし、画像読み込み完了後に適用されるため、若干の遅延が発生する場合があります。

== Changelog ==

= 0.01 =
* 初回リリース
* 基本的なスクロール連動拡大/縮小機能
* IntersectionObserver使用の高パフォーマンス実装
* グループ継承機能
* アクセシビリティ対応（prefers-reduced-motion）
* 動的要素対応（MutationObserver）

== Upgrade Notice ==

= 0.01 =
初回リリース