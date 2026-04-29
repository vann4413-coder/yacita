# Store Submission Checklist

## 1. Generate PNG assets

```bash
cd apps/mobile
pnpm add -D sharp          # if not installed
pnpm assets:generate
```

This produces from the SVG sources:

| File | Size | Used by |
|---|---|---|
| `assets/icon.png` | 1024×1024 | Expo icon, App Store |
| `assets/adaptive-icon.png` | 1024×1024 | Android adaptive icon |
| `assets/splash.png` | 1284×2778 | iOS/Android splash |
| `assets/favicon.png` | 48×48 | Expo Web |
| `assets/notification-icon.png` | 96×96 | Android push icon |

## 2. Screenshot export

Open each `store/screenshots/screen-0*.svg` in a browser (or Inkscape/Figma) and export as PNG at 1290×2796. Required sets:

- **iOS App Store**: 6.7" (1290×2796) — 3 screenshots minimum, up to 10
- **Google Play**: Phone (1290×2796) — 2 screenshots minimum, up to 8

Screenshots to export:
1. `screen-01-explore.svg` — "Huecos cerca de ti"
2. `screen-02-gap-detail.svg` — "Reserva en 2 minutos"
3. `screen-03-bookings.svg` — "Tus citas, siempre a mano"
4. `screen-04-notification.svg` — "Alertas en tiempo real"

## 3. Feature Graphic (Google Play only)

Export `store/android/feature-graphic.svg` → PNG 1024×500.

## 4. EAS setup

```bash
# Login
eas login

# Link project (updates extra.eas.projectId in app.json)
eas project:init

# Configure credentials (first time only)
eas credentials
```

## 5. Build & submit

```bash
# iOS production build
pnpm build:prod --platform ios

# Android AAB production build
pnpm build:prod --platform android

# Submit to App Store (requires Apple credentials in eas.json)
pnpm submit:ios

# Submit to Google Play (requires google-service-account.json)
pnpm submit:android
```

## 6. App Store Connect — required metadata

- **Name**: Yacita
- **Subtitle**: `store/ios/subtitle.txt`
- **Description**: `store/ios/description.txt`
- **Promotional text**: `store/ios/promotional-text.txt`
- **Keywords**: `store/ios/keywords.txt`
- **Release notes**: `store/ios/release-notes.txt`
- **Category**: Health & Fitness (primary), Medical (secondary)
- **Age rating**: 4+
- **Privacy policy URL**: https://yacita.es/legal/privacidad

## 7. Google Play Console — required metadata

- **App name**: Yacita
- **Short description**: `store/android/short-description.txt`
- **Full description**: `store/android/full-description.txt`
- **Release notes**: `store/android/release-notes.txt`
- **Feature Graphic**: `store/android/feature-graphic.png` (1024×500)
- **Category**: Health & Fitness
- **Content rating**: Everyone
- **Privacy policy URL**: https://yacita.es/legal/privacidad

## 8. Fonts

Download and place in `assets/fonts/`:
- Plus Jakarta Sans: https://fonts.google.com/specimen/Plus+Jakarta+Sans
  - PlusJakartaSans-Regular.ttf
  - PlusJakartaSans-SemiBold.ttf
  - PlusJakartaSans-Bold.ttf
- Inter: https://fonts.google.com/specimen/Inter
  - Inter-Regular.ttf
  - Inter-Medium.ttf
  - Inter-SemiBold.ttf
