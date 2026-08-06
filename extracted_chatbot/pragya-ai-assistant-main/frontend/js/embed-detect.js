/**
 * Runs before first paint: when the page is inside the website widget iframe we
 * fill it edge-to-edge, while standalone visits get the compact floating-card
 * layout. Kept in its own file (rather than an inline <script>) so the Content
 * Security Policy can forbid inline scripts entirely.
 */
try {
  if (window.self !== window.top) document.documentElement.classList.add("embedded");
} catch (e) {
  // Cross-origin framing throws on window.top access — that means we ARE framed.
  document.documentElement.classList.add("embedded");
}
