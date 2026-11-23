// Serialize JSON-LD safely inside <script>: "<" can't close the tag.
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
