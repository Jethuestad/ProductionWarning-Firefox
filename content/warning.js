"use strict";

(function () {
    const host = window.location.hostname;
    if (!pwIsProductionHost(host)) {
        return;
    }

    let container = null;
    let shadow = null;
    let faviconLink = null;
    let removedIcons = [];
    let headObserver = null;

    // ---- Border, overlay and label (rendered in a closed shadow root so page CSS can't touch them) ----

    function ensureContainer() {
        if (container && container.isConnected) {
            return;
        }
        container = document.createElement("production-warning");
        container.style.cssText = "all: initial; position: fixed; inset: 0; pointer-events: none; z-index: 2147483647;";
        shadow = container.attachShadow({ mode: "closed" });
        document.documentElement.appendChild(container);
    }

    const STYLE = `
                .frame, .overlay {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                }
                .frame {
                    box-sizing: border-box;
                    border: var(--w) solid var(--c);
                    box-shadow: inset 0 0 12px color-mix(in srgb, var(--c) 45%, transparent);
                }
                .overlay {
                    background: repeating-linear-gradient(
                        45deg,
                        transparent 0 14px,
                        color-mix(in srgb, var(--c) 7%, transparent) 14px 28px
                    );
                }
                .label {
                    position: fixed;
                    top: var(--w);
                    left: 50%;
                    transform: translateX(-50%);
                    pointer-events: none;
                    padding: 2px 12px 4px;
                    border-radius: 0 0 8px 8px;
                    background: var(--c);
                    color: #fff;
                    font: 700 11px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
                    letter-spacing: 0.08em;
                    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.35);
                    white-space: nowrap;
                    opacity: 0.92;
                }
                .label small {
                    font-weight: 500;
                    letter-spacing: 0;
                    opacity: 0.85;
                    margin-left: 6px;
                }
    `;

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        if (text) {
            node.textContent = text;
        }
        return node;
    }

    function render(settings, color) {
        ensureContainer();
        const width = Math.max(1, Math.min(30, Number(settings.borderWidth) || PW_DEFAULTS.borderWidth));
        container.style.setProperty("--c", color);
        container.style.setProperty("--w", width + "px");

        const nodes = [el("style", "", STYLE)];
        if (settings.overlay) {
            nodes.push(el("div", "overlay"));
        }
        nodes.push(el("div", "frame"));
        if (settings.label) {
            const label = el("div", "label", settings.labelText || PW_DEFAULTS.labelText);
            label.appendChild(el("small", "", host));
            nodes.push(label);
        }
        shadow.replaceChildren(...nodes);
    }

    function removeWarning() {
        if (container) {
            container.remove();
            container = null;
            shadow = null;
        }
    }


    // ---- Tab icon ----

    function faviconHref(color) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="1" y="1" width="30" height="30" rx="7" fill="${color}"/>
            <rect x="14" y="6" width="4" height="13" rx="2" fill="#fff"/>
            <circle cx="16" cy="24.5" r="2.5" fill="#fff"/>
        </svg>`;
        return "data:image/svg+xml," + encodeURIComponent(svg);
    }

    function isIconLink(node) {
        return node.nodeName === "LINK" && /\bicon\b/i.test(node.getAttribute("rel") || "") && node !== faviconLink;
    }

    function applyFavicon(color) {
        if (!document.head) {
            document.addEventListener("DOMContentLoaded", () => applyFavicon(color), { once: true });
            return;
        }
        document.head.querySelectorAll("link").forEach(node => {
            if (isIconLink(node)) {
                removedIcons.push(node);
                node.remove();
            }
        });
        if (!faviconLink) {
            faviconLink = document.createElement("link");
            faviconLink.rel = "icon";
            faviconLink.type = "image/svg+xml";
        }
        faviconLink.href = faviconHref(color);
        if (!faviconLink.isConnected) {
            document.head.appendChild(faviconLink);
        }

        // Single-page apps may swap the favicon later; keep ours on top.
        if (!headObserver) {
            headObserver = new MutationObserver(mutations => {
                for (const m of mutations) {
                    m.addedNodes.forEach(node => {
                        if (isIconLink(node)) {
                            removedIcons.push(node);
                            node.remove();
                        }
                    });
                }
                if (faviconLink && !faviconLink.isConnected) {
                    document.head.appendChild(faviconLink);
                }
            });
            headObserver.observe(document.head, { childList: true });
        }
    }

    function restoreFavicon() {
        if (headObserver) {
            headObserver.disconnect();
            headObserver = null;
        }
        if (faviconLink) {
            faviconLink.remove();
            faviconLink = null;
        }
        if (document.head) {
            removedIcons.forEach(node => document.head.appendChild(node));
        }
        removedIcons = [];
    }

    // ---- Wiring ----

    async function update() {
        const settings = await pwLoadSettings();
        if (!settings.enabled) {
            removeWarning();
            restoreFavicon();
            return;
        }
        const color = pwColorFor(settings, host);
        render(settings, color);
        if (settings.tabIcon) {
            applyFavicon(color);
        } else {
            restoreFavicon();
        }
    }

    update();
    // Settings changes apply immediately, no reload needed.
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === "sync") {
            update();
        }
    });
})();
