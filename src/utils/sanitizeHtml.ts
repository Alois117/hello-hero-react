/**
 * Minimal HTML sanitizer for rendering trusted-ish HTML (e.g. AI responses).
 * Allows only a strict whitelist of tags and attributes to prevent XSS.
 */

const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "br",
  "p",
  "ul",
  "ol",
  "li",
  "a",
  "span",
  "div",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
};

/**
 * Decode HTML entities like &amp; &lt; &gt; &quot;
 */
export const decodeHtmlEntities = (str: string): string => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
};

/**
 * Extract the first <a href="..."> URL from an HTML string.
 * Decodes HTML entities in the href.
 */
export const extractZabbixUrl = (html: string): string | null => {
  if (!html) return null;
  // Match href value from anchor tags (handles &amp; entities)
  const match = html.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (match?.[1]) {
    return decodeHtmlEntities(match[1]);
  }
  return null;
};

/**
 * Sanitize an HTML string, keeping only whitelisted tags and attributes.
 * Also converts \n to <br> for readability.
 */
export const sanitizeHtml = (dirty: string): string => {
  if (!dirty) return "";

  // Convert literal \n to <br> before parsing
  let prepared = dirty.replace(/\\n/g, "\n").replace(/\n/g, "<br>");

  const doc = new DOMParser().parseFromString(prepared, "text/html");
  const clean = sanitizeNode(doc.body);
  return clean;
};

function sanitizeNode(node: Node): string {
  let result = "";

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      result += escapeText(child.textContent || "");
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const el = child as Element;
    const tag = el.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      // Still process children (strip the tag but keep inner content)
      result += sanitizeNode(el);
      return;
    }

    // Build opening tag with filtered attributes
    let attrs = "";
    const allowedAttrs = ALLOWED_ATTRS[tag];
    if (allowedAttrs) {
      for (const attr of Array.from(el.attributes)) {
        if (!allowedAttrs.has(attr.name.toLowerCase())) continue;
        let value = attr.value;

        // Block javascript: protocol in hrefs
        if (attr.name.toLowerCase() === "href") {
          const normalized = value.trim().toLowerCase();
          if (
            normalized.startsWith("javascript:") ||
            normalized.startsWith("data:")
          ) {
            continue;
          }
        }

        attrs += ` ${attr.name}="${escapeAttr(value)}"`;
      }

      // Force target/rel on anchors for safety
      if (tag === "a") {
        if (!attrs.includes("target=")) {
          attrs += ' target="_blank"';
        }
        if (!attrs.includes("rel=")) {
          attrs += ' rel="noopener noreferrer"';
        }
      }
    }

    const selfClosing = tag === "br";
    if (selfClosing) {
      result += `<${tag}${attrs} />`;
    } else {
      result += `<${tag}${attrs}>${sanitizeNode(el)}</${tag}>`;
    }
  });

  return result;
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
