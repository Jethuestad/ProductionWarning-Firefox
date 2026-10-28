# ProductionWarning-Firefox

Firefox version of the PAS production warning extension. Puts a red border and some stripes on eksamen/prover/elev/kandidat.udir.no so you notice you're in prod. Works in Zen too.

## Install

1. Download the latest `.xpi` from [Releases](https://github.com/Jethuestad/ProductionWarning-Firefox/releases)
2. Drag it into a Firefox window (or `about:addons` → ⚙ → Install Add-on From File)
3. Click Add

Settings are under the toolbar icon.

## Making a new release

Firefox only installs signed add-ons, so it has to go through Mozilla (free, and it doesn't get listed publicly).

1. Bump `version` in `manifest.json`
2. `npx web-ext build --overwrite-dest`
3. Upload the zip from `web-ext-artifacts/` at https://addons.mozilla.org/developers/ → Submit a New Add-on → "On your own"
4. Download the signed `.xpi`, rename it to `pas_production_warning-<version>.xpi` and attach it to a GitHub release tagged `v<version>`
5. Add the new version to `updates.json` and push. Installed copies update themselves within a day or so

For quick testing without signing: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → pick `manifest.json`.

Based on [fagerli93/ProductionWarning-Chrome](https://github.com/fagerli93/ProductionWarning-Chrome). MPL 2.0, see LICENSE.
