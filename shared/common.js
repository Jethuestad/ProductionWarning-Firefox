"use strict";

// Shared between the content script, popup and options page.

const PW_PALETTE = [
    { name: "Red", value: "#e3262f" },
    { name: "Orange", value: "#f28c00" },
    { name: "Yellow", value: "#f5c400" },
    { name: "Green", value: "#1f9d4c" },
    { name: "Aqua", value: "#00b3c7" },
    { name: "Blue", value: "#2563eb" },
    { name: "Purple", value: "#8b3fd9" }
];

const PW_DEFAULTS = {
    enabled: true,
    defaultColor: "#e3262f",
    borderWidth: 6,
    tabIcon: true,
    overlay: true,
    label: true,
    labelText: "PRODUKSJON",
    // Each rule: { pattern: "pas", color: "#2563eb" }
    rules: []
};

const PW_PRODUCTION_HOST = /(^|\.)(eksamen|prover|elev|kandidat)\.udir\.no$/i;

async function pwLoadSettings() {
    const stored = await browser.storage.sync.get(PW_DEFAULTS);
    return Object.assign({}, PW_DEFAULTS, stored);
}

function pwIsProductionHost(host) {
    return PW_PRODUCTION_HOST.test(host || "");
}

// A rule pattern matches the full host name, or the first label of the host
// (also allowing the "name--suffix" and "name--c" forms the Chrome version supported).
function pwRuleMatches(pattern, host) {
    pattern = (pattern || "").trim().toLowerCase();
    host = (host || "").toLowerCase();
    if (!pattern) {
        return false;
    }
    if (host === pattern) {
        return true;
    }
    const firstLabel = host.split(".")[0];
    return firstLabel === pattern || firstLabel.split("--")[0] === pattern;
}

function pwColorFor(settings, host) {
    const rule = settings.rules.find(r => pwRuleMatches(r.pattern, host));
    return (rule && rule.color) || settings.defaultColor;
}

function pwColorName(value) {
    const entry = PW_PALETTE.find(c => c.value.toLowerCase() === (value || "").toLowerCase());
    return entry ? entry.name : value;
}
