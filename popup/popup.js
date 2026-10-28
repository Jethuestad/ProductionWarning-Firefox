"use strict";

async function init() {
    const settings = await pwLoadSettings();
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    // tab.url is only visible to us on the udir.no hosts we have permission for.
    let host = "";
    try {
        host = tab && tab.url ? new URL(tab.url).hostname : "";
    } catch (e) {
        host = "";
    }

    const toggles = document.querySelectorAll("input[data-key]");
    toggles.forEach(input => {
        input.checked = Boolean(settings[input.dataset.key]);
        input.addEventListener("change", async () => {
            settings[input.dataset.key] = input.checked;
            await browser.storage.sync.set({ [input.dataset.key]: input.checked });
            renderStatus(settings, host);
        });
    });

    renderStatus(settings, host);

    document.querySelector("#options").addEventListener("click", () => {
        browser.runtime.openOptionsPage();
        window.close();
    });
}

function renderStatus(settings, host) {
    const status = document.querySelector("#status");
    const title = document.querySelector("#statusTitle");
    const hostEl = document.querySelector("#statusHost");
    document.querySelector(".toggles").classList.toggle("disabled", !settings.enabled);

    if (!pwIsProductionHost(host)) {
        status.classList.add("inactive");
        status.style.borderLeftColor = "var(--border)";
        title.textContent = "Not a PAS production site";
        hostEl.textContent = host || "This tab is outside udir.no";
        return;
    }

    const color = pwColorFor(settings, host);
    status.classList.remove("inactive");
    status.style.borderLeftColor = settings.enabled ? color : "var(--border)";
    document.querySelector("#statusSwatch").style.background = color;
    title.textContent = settings.enabled ? "Production – warning shown" : "Production – warning paused";
    hostEl.textContent = host + " · " + pwColorName(color);
}

init();
