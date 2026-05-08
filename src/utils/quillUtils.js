/**
 * Strip all HTML tags from a Quill HTML string and return normalised plain
 * text.  The browser's own HTML parser handles entity decoding (&nbsp;, &amp;,
 * …) so the result is entity-free regardless of how the HTML was serialised.
 * Whitespace is collapsed so that structural differences introduced by Quill
 * v2's internal normalisation do not affect change-detection comparisons.
 *
 * @param {string} html
 * @returns {string}
 */
export function htmlToPlainText(html) {
    if (!html) return "";
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").replace(/\s+/g, ' ').trim();
}

/**
 * Normalise an empty Quill editor value to an empty string.  Quill v2
 * represents a blank editor as `<p><br></p>` or `<p></p>`; both are treated
 * as no content so that saving a never-edited field does not produce a
 * non-empty HTML string.
 *
 * @param {string} html
 * @returns {string}
 */
export function normalizeQuillHtml(html) {
    if (!html) return "";
    if (html === '<p><br></p>' || html === '<p></p>') return "";
    return html;
}
