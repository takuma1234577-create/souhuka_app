# パッケージ化（Capacitor）の使い方

## コマンド

| コマンド | 説明 |
|----------|------|
| `npm run cap:sync` | ビルドしてから Web を Android/iOS に同期 |
| `npm run cap:android` | Android Studio を開く |
| `npm run cap:ios` | Xcode を開く（Mac のみ） |

## 手順

### 1. ビルドと同期

```bash
npm run cap:sync
```

- `npm run build` で `dist/` を生成
- `dist/` を Android / iOS のネイティブプロジェクトにコピー

### 2. Android（Google Play 用）

1. `npm run cap:android` で Android Studio を開く
2. 実機 or エミュレータで実行して動作確認
3. **Build → Generate Signed Bundle / App Bundle** で AAB を作成
4. [Google Play Console](https://play.google.com/console) で AAB をアップロード

### 3. iOS（App Store 用）

1. **Mac と Xcode が必要です**
2. `npm run cap:ios` で Xcode を開く
3. 実機 or シミュレータで実行して動作確認
4. **Product → Archive** でアーカイブ作成
5. **Distribute App** で App Store Connect にアップロード

## 設定

- **capacitor.config.ts** … `appId`, `appName`, `webDir` を変更できます
- **appId** … ストア用の一意ID（例: `com.souhukaapp.tracker`）
- **appName** … 端末に表示されるアプリ名

## 注意

- コードを変更したら、必ず `npm run cap:sync` を実行してからネイティブでビルドしてください
- 環境変数（.env）はビルド時に埋め込まれるため、ストア用ビルド時は本番用 .env で `npm run cap:sync` を実行してください
