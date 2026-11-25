function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);

    if (
      url.protocol === "https:" ||
      url.protocol === "http:"
    ) {
      return url.href;
    }
  } catch {}

  return null;
}

export function renderMarkdown(markdown: string) {
  let html = escapeHtml(markdown);

  // Finished HTML fragments (code, links, images) are parked behind
  // placeholders so later rules (bold/italic) can't break them — e.g. an
  // underscore in a URL or in `snake_case` code.
  const parked: string[] = [];
  const park = (fragment: string) => `\u0000${parked.push(fragment) - 1}\u0000`;

  html = html.replace(
    /```(?:([a-zA-Z0-9_-]+)\n)?([\s\S]*?)```/g,
    (_, language, code) =>
      park(`<pre class="my-7 overflow-x-auto rounded-2xl bg-neutral-950 p-5 text-sm leading-7 text-neutral-100"><code>${
        language
          ? `<span class="mb-3 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">${language}</span>`
          : ""
      }${code.trim()}</code></pre>`)
  );

  // Inline code is parked before any emphasis rules run.
  html = html.replace(
    /`([^`\n]+)`/g,
    (_, code) => park(`<code class="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.9em] text-neutral-800">${code}</code>`)
  );

  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="mt-9 mb-3 text-xl font-bold tracking-tight text-neutral-950">$1</h3>'
  );

  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="mt-11 mb-4 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">$1</h2>'
  );

  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="mt-11 mb-5 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">$1</h1>'
  );

  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote class="my-7 border-l-4 border-neutral-300 pl-5 text-[15px] italic leading-8 text-neutral-600">$1</blockquote>'
  );

  html = html.replace(
    /^---$/gm,
    '<hr class="my-10 border-neutral-200" />'
  );

  html = html.replace(
    /^[-*] (.+)$/gm,
    '<li class="ml-6 list-disc leading-8 text-neutral-700">$1</li>'
  );

  html = html.replace(
    /^[\d০-৯]+\. (.+)$/gm,
    '<li class="ml-6 list-decimal leading-8 text-neutral-700">$1</li>'
  );

  html = html.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, alt, url, title) => {
      const safe = safeUrl(url);

      if (!safe) {
        return "";
      }

      return park(`<img src="${safe}" alt="${alt}"${
        title ? ` title="${title}"` : ""
      } class="my-8 w-full rounded-2xl border border-neutral-200 object-cover" loading="lazy" />`);
    }
  );

  // Internal links (e.g. [pricing](/pricing)) open in the same tab; the proxy
  // adds the visitor's language prefix.
  html = html.replace(/\[([^\]]+)\]\((\/(?!\/)[^)\s]*)\)/g, (_, text, path) => {
    return `${park(`<a href="${path}" class="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-800">`)}${text}</a>`;
  });

  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (_, text, url) => {
      const safe = safeUrl(url);

      if (!safe) {
        return text;
      }

      // Link text may still get bold/italic, so only the opening tag is parked.
      return `${park(`<a href="${safe}" target="_blank" rel="noopener noreferrer" class="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-800">`)}${text}</a>`;
    }
  );

  html = html.replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );

  html = html.replace(
    /__(.+?)__/g,
    "<strong>$1</strong>"
  );

  html = html.replace(
    /(?<!\*)\*([^*\n]+?)\*(?!\*)/g,
    "<em>$1</em>"
  );

  html = html.replace(
    /(?<!_)_([^_\n]+?)_(?!_)/g,
    "<em>$1</em>"
  );

  const restore = (value: string): string => value.replace(/\u0000(\d+)\u0000/g, (_, i: string) => restore(parked[Number(i)]));

  return html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = restore(block.trim());

      if (!trimmed) {
        return "";
      }

      // A block of list items becomes its own list, so numbering restarts per list.
      if (trimmed.startsWith("<li")) {
        const ordered = trimmed.startsWith('<li class="ml-6 list-decimal');
        const tag = ordered ? "ol" : "ul";
        return `<${tag} class="mb-5">${trimmed.replace(/<\/li>\n/g, "</li>")}</${tag}>`;
      }

      if (
        trimmed.startsWith("<h1") ||
        trimmed.startsWith("<h2") ||
        trimmed.startsWith("<h3") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<img")
      ) {
        return trimmed;
      }

      return `<p class="mb-5 leading-8 text-neutral-700">${trimmed.replace(
        /\n/g,
        "<br />"
      )}</p>`;
    })
    .join("\n");
}