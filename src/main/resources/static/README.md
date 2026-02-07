# 運命の数字チャレンジ - プロジェクト構成

## 📁 ファイル構成

```
project/
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート（完全版）
├── app.ts              # TypeScriptソースコード
├── app.js              # JavaScriptコンパイル済み（ブラウザ用）
└── README.md           # このファイル
```

## 🚀 クイックスタート

### 方法1: そのまま使う（推奨）
1. すべてのファイルを同じフォルダに配置
2. `index.html`をブラウザで開く
3. すぐにプレイ可能！

### 方法2: TypeScriptから開発
1. TypeScriptをインストール
```bash
npm install -g typescript
```

2. TypeScriptをJavaScriptにコンパイル
```bash
tsc app.ts --target ES2017 --lib ES2017,DOM
```

3. `index.html`をブラウザで開く

## 📋 ファイル詳細

### index.html
- セマンティックHTML5
- ARIA属性でアクセシビリティ対応
- 外部CSS・JS読み込み

### style.css
- CSS変数でテーマ管理
- 1位の豪華アニメーション（グロー、パルス、スキャンライン）
- レスポンシブデザイン
- 全747行の完全版

### app.ts / app.js
- TypeScript型定義
- 週リセット機能（月曜日0:00）
- 日次リセット機能
- バリデーション強化
- Enterキー対応
- localStorage永続化

## ✨ 主な機能

### 🎮 ゲームフロー
1. **数字入力**: 0〜99,999,999の範囲
2. **解析演出**: 3秒間のガタガタアニメーション
3. **結果表示**: 誤差を週間合計に加算
4. **制限**: 1日1回まで挑戦可能
5. **リセット**: 毎週月曜0:00に週間合計リセット

### 🔒 安全性
- ✅ 入力バリデーション（数字のみ、範囲チェック）
- ✅ XSS対策（innerTextを使用）
- ✅ エラーハンドリング
- ✅ localStorage安全処理

### 🎨 アニメーション
- 1位カード: グロー、パルス、スキャンライン
- 2-5位: スライドイン（時間差）
- モーダル: バウンス演出
- 結果カード: 回転＆スケール

### ⌨️ キーボード操作
- Enter: 数字送信
- Esc: モーダルを閉じる（オプション実装可）
- Tab: フォーカス移動

## 🎨 カスタマイズ

### 色変更
`style.css`の`:root`セクションを編集
```css
:root {
  --gold-main: #fbbf24;    /* ゴールド色 */
  --purple-main: #7c3aed;  /* パープル色 */
}
```

### 目標スコア変更
`app.ts`または`app.js`の定数を編集
```typescript
const TARGET_SCORE: number = 9824017;
```

### 演出時間変更
```typescript
const ANALYZING_TIME_MS: number = 3000; // ミリ秒
```

### 週の開始曜日変更
`getWeekStartDate`関数を編集
```typescript
// 月曜始まり（デフォルト）
const diff = d.getDate() - day + (day === 0 ? -6 : 1);

// 日曜始まり
const diff = d.getDate() - day;
```

## 🐛 トラブルシューティング

### アニメーションが動かない
- ブラウザのキャッシュをクリア
- `style.css`が正しく読み込まれているか確認

### データが保存されない
- localStorage が有効か確認
- プライベートブラウジングモードでないか確認
- ブラウザの設定でCookieが許可されているか確認

### TypeScriptのコンパイルエラー
```bash
# strict モードを無効化
tsc app.ts --strict false
```

## 📱 ブラウザ対応

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11（非対応）

## 🔧 今後の拡張案

### バックエンド連携
- [ ] リアルタイムランキング
- [ ] ユーザー認証（Firebase Auth等）
- [ ] データベース連携（Firestore等）

### SNS機能
- [ ] Twitter共有ボタン
- [ ] LINE共有ボタン
- [ ] OGP画像自動生成

### 実績システム
- [ ] バッジコレクション
- [ ] 連続プレイ記録
- [ ] レベルアップシステム

### PWA化
- [ ] Service Worker
- [ ] オフライン対応
- [ ] ホーム画面追加

## 📄 ライセンス

MIT License - 自由に使用・改変してください

## 🙋 サポート

質問や不具合報告は、GitHubのIssueまでお願いします。

---

**楽しいゲーム開発を！** 🎮✨
