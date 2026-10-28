"use strict";

let settings = null;
let saveTimer = null;

// ---- Saving ----

function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
        await browser.storage.sync.set(settings);
        const saved = document.querySelector("#saved");
        saved.textContent = "✓ Saved";
        saved.classList.add("show");
        setTimeout(() => saved.classList.remove("show"), 1500);
    }, 250);
    renderPreview();
}

// ---- Color picker: palette swatches + custom color input ----

function colorPicker(value, allowDefault, onChange) {
    const wrap = document.createElement("div");
    wrap.className = "colors";

    const buttons = [];
    function select(newValue) {
        value = newValue;
        buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.value === value)));
        const isCustom = value !== "" && !PW_PALETTE.some(c => c.value === value);
        custom.classList.toggle("active", isCustom);
        if (value) {
            custom.value = value;
        }
    }

    if (allowDefault) {
        const def = document.createElement("button");
        def.type = "button";
        def.className = "default-choice";
        def.textContent = "Default";
        def.title = "Use the default color";
        def.dataset.value = "";
        buttons.push(def);
    }
    PW_PALETTE.forEach(c => {
        const b = document.createElement("button");
        b.type = "button";
        b.style.background = c.value;
        b.title = c.name;
        b.setAttribute("aria-label", c.name);
        b.dataset.value = c.value;
        buttons.push(b);
    });
    buttons.forEach(b => {
        b.addEventListener("click", () => {
            select(b.dataset.value);
            onChange(value);
        });
        wrap.appendChild(b);
    });

    const custom = document.createElement("input");
    custom.type = "color";
    custom.title = "Custom color";
    custom.addEventListener("input", () => {
        select(custom.value);
        onChange(value);
    });
    wrap.appendChild(custom);

    select(value);
    return wrap;
}

// ---- Rules ----

function renderRules() {
    const list = document.querySelector("#rules");
    list.textContent = "";
    document.querySelector("#noRules").hidden = settings.rules.length > 0;

    settings.rules.forEach((rule, index) => {
        const li = document.createElement("li");

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "e.g. pas or pas.eksamen.udir.no";
        input.value = rule.pattern;
        input.addEventListener("input", () => {
            rule.pattern = input.value.trim();
            save();
        });

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove";
        remove.textContent = "×";
        remove.title = "Remove";
        remove.setAttribute("aria-label", "Remove rule");
        remove.addEventListener("click", () => {
            settings.rules.splice(index, 1);
            renderRules();
            save();
        });

        li.append(input, colorPicker(rule.color, true, color => {
            rule.color = color;
            save();
        }), remove);
        list.appendChild(li);
    });
}

// ---- Preview ----

function renderPreview() {
    const preview = document.querySelector("#preview");
    preview.style.setProperty("--c", settings.defaultColor);
    preview.style.setProperty("--w", settings.borderWidth + "px");
    preview.classList.toggle("off", !settings.enabled);
    preview.querySelector(".preview-overlay").hidden = !settings.overlay;
    preview.querySelector(".preview-label").hidden = !settings.label;
    document.querySelector("#previewLabel").textContent = settings.labelText || PW_DEFAULTS.labelText;
    document.querySelector("#borderWidthValue").textContent = settings.borderWidth;
    document.documentElement.style.setProperty("--accent", settings.defaultColor);
}

// ---- Setup ----

function bindInputs() {
    ["enabled", "overlay", "label", "tabIcon"].forEach(key => {
        const input = document.querySelector("#" + key);
        input.checked = settings[key];
        input.onchange = () => {
            settings[key] = input.checked;
            save();
        };
    });

    const width = document.querySelector("#borderWidth");
    width.value = settings.borderWidth;
    width.oninput = () => {
        settings.borderWidth = Number(width.value);
        save();
    };

    const labelText = document.querySelector("#labelText");
    labelText.value = settings.labelText;
    labelText.oninput = () => {
        settings.labelText = labelText.value;
        save();
    };

    const defaultColor = document.querySelector("#defaultColor");
    defaultColor.textContent = "";
    defaultColor.appendChild(colorPicker(settings.defaultColor, false, color => {
        settings.defaultColor = color;
        save();
    }));

    renderRules();
    renderPreview();
}

async function init() {
    settings = await pwLoadSettings();
    settings.rules = settings.rules.map(r => ({ pattern: r.pattern || "", color: r.color || "" }));
    bindInputs();

    document.querySelector("#addRule").addEventListener("click", () => {
        settings.rules.push({ pattern: "", color: "" });
        renderRules();
        const inputs = document.querySelectorAll("#rules input[type=text]");
        inputs[inputs.length - 1].focus();
        save();
    });

    document.querySelector("#reset").addEventListener("click", () => {
        if (!confirm("Reset all settings to their defaults?")) {
            return;
        }
        settings = JSON.parse(JSON.stringify(PW_DEFAULTS));
        bindInputs();
        save();
    });
}

init();
