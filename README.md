# PAS Production Warning – Firefox

Firefox version of the PAS Production Warning extension. On `eksamen`, `prover`, `elev` and `kandidat.udir.no` it shows:

- a colored border around the page
- faint warning stripes over the page (clicks still go through)
- a small "PRODUKSJON" label at the top with the host name
- a colored tab icon, so production tabs stand out in the tab bar

Everything is on by default, and changes in the popup or settings apply to open tabs immediately – no reload needed.

## Install (temporary, for testing)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Pick `manifest.json` in this folder

Temporary add-ons are removed when Firefox restarts.

## Install permanently

Regular Firefox only installs signed add-ons. Either:

- sign it as an unlisted add-on on [addons.mozilla.org](https://addons.mozilla.org/developers/) (`npx web-ext sign --channel=unlisted` with your API keys), then install the signed `.xpi`, or
- use Firefox Developer Edition / Nightly, set `xpinstall.signatures.required` to `false` in `about:config`, and install `web-ext-artifacts/*.zip` via **about:addons → ⚙ → Install Add-on From File…**

## Settings

Click the toolbar icon for quick toggles, or **Colors & domains…** for the full settings page:

- default color (palette or any custom color) and border width
- label text
- per-domain colors: enter a full host (`pas.eksamen.udir.no`) or its first part (`pas`)

## Development

```bash
npx web-ext lint
npx web-ext run
npx web-ext build --overwrite-dest
```

## Credits and license

Based on the Production Warning Chrome extension by [keal.us](https://keal.us), via a fork adapted for PAS/udir.no. This Firefox version is a rewrite, but builds on the original's design and behavior.

Licensed under the [Mozilla Public License 2.0](LICENSE), the same license as the original.
