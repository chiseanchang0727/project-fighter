# Project Fighter

Personal health-record app for tracking lab results over time (iOS and Android, built with Expo).

All data is stored on the device in SQLite. Nothing is uploaded.

## Development

```bash
npm install
npx expo start          # then press i (iOS simulator) or a (Android emulator), or scan the QR code with Expo Go
npm run typecheck
npm run lint
npm run doctor
```

Expo Go does not include every native module this app uses, so for a full test build run
`eas build --profile development` (see below).

## Architecture

The app opens on Home, with Add Record and a combined Records & Trends button.
That button and the matching tab button open a small chooser for the record list
or trend charts. Debbie’s profile is in Settings; profile defaults live in
`src/domain/profile.ts`.

The Template tab selects which lab markers appear on new records. Use Add marker
to create a custom marker with a name, abbreviation, unit, and optional reference
limits, then save the template. The selection persists on this device; existing
records keep their recorded fields. JSON backups include reports and custom marker
definitions and marker explanations, but not template selections. Older report-only backups still import.

Open a marker in the separate Definitions tab to read or edit its definition and
what low/high values may mean. This works for built-in and custom markers. Info
buttons in records, forms, and trends open the explanation page; a saved result
also shows its value and reference range. Explanations can be edited and include
Chinese/English defaults for all 11 built-in markers, summarized from MedlinePlus
and the National Cancer Institute with source links (checked 2026-10-25). Saved user
notes take precedence over defaults, including intentionally cleared fields. Custom
markers start empty. Backups restore explanations by marker ID and replace notes for IDs
included in the backup; older backups leave existing notes untouched.

The explanation page defaults to Chinese, has a compact 中文/EN switch, and displays one language at a
time. The explanation editor also stores each language separately and preserves
the other language when editing. Existing bilingual text remains compatible;
custom markers need user-provided translations.

- `src/app/` — screens (Expo Router). `(tabs)/` holds the five tabs; `report/` holds add/edit and `marker/` holds explanations.
- `src/domain/` — pure logic: marker definitions, reference ranges, flags, backup validation, seed data.
- `src/storage/` — persistence. The UI only uses the `Repository` interface (`repository.ts`).
  The SQLite implementation is in `sqlite.ts`. To change backends, change `createRepository`
  in `index.ts`. Database schema changes go in `migrate()` with a new `user_version`.

## Release (App Store / Google Play)

Requires an Expo account, an Apple Developer Program membership, and a Google Play Console account.

1. Set your real identifiers in `app.json`: `ios.bundleIdentifier` and `android.package`
   (currently `com.example.projectfighter`).
2. `npx eas-cli@latest login` and `npx eas-cli@latest build:configure`
3. `npx eas-cli@latest build --profile production --platform all`
4. `npx eas-cli@latest submit --profile production --platform all`

Store listings need a privacy policy URL. The data never leaves the device, so the policy can say so.
