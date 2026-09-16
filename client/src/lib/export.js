import { slugify, downloadBlob } from './utils.js';

const STYLES = `
  * { box-sizing: border-box; }
  body { font-family: Inter, -apple-system, "Segoe UI", Roboto, sans-serif; color:#0F172A; margin:0; padding:48px; line-height:1.7; }
  h1.doc-title { font-size: 30px; margin:0 0 6px; letter-spacing:-0.02em; }
  .meta { color:#64748B; font-size:13px; margin-bottom:28px; padding-bottom:16px; border-bottom:1px solid #E2E8F0; }
  .badge { display:inline-block; background:#EFF6FF; color:#1D4ED8; border-radius:999px; padding:2px 10px; font-size:12px; margin-right:6px; }
  h1,h2,h3 { line-height:1.3; }
  pre { background:#0F172A; color:#E2E8F0; padding:14px 16px; border-radius:10px; overflow-x:auto; font-size:13px; }
  code { font-family: "JetBrains Mono", ui-monospace, monospace; }
  p code, li code { background:#F1F5F9; border:1px solid #E2E8F0; border-radius:5px; padding:1px 5px; }
  img { max-width:100%; border-radius:10px; }
  blockquote { border-left:3px solid #CBD5E1; padding-left:14px; color:#475569; margin-left:0; }
  ul, ol { padding-left:22px; }
  footer { margin-top:40px; padding-top:14px; border-top:1px solid #E2E8F0; color:#94A3B8; font-size:12px; }
  @media print { body { padding:0; } @page { margin: 18mm 16mm; } }
`;

export const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** HTML -> hidden iframe -> browser print dialog (user "Save as PDF" karega). Koi extra library nahi. */
export const printHtml = (html, title = 'Note') => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${STYLES}</style></head><body>${html}</body></html>`);
  doc.close();

  const done = () => setTimeout(() => iframe.remove(), 500);

  const run = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } finally {
      done();
    }
  };

  // images (Cloudinary) load hone ka wait
  if (iframe.contentWindow.document.readyState === 'complete') setTimeout(run, 350);
  else iframe.onload = () => setTimeout(run, 350);
};

/** Note ko print-friendly HTML wrapper me daal ke export */
export const exportNoteAsPdf = (note) => {
  const tags = (note.tags || []).map((t) => `<span class="badge">#${escapeHtml(t.name)}</span>`).join('');
  const meta = [
    note.folder?.name ? `Folder: ${escapeHtml(note.folder.name)}` : 'Uncategorized',
    note.lastEditedAt ? `Last edited: ${new Date(note.lastEditedAt).toLocaleString('en-IN')}` : '',
    note.wordCount ? `${note.wordCount} words` : '',
  ]
    .filter(Boolean)
    .join('  •  ');

  const html = `
    <h1 class="doc-title">${escapeHtml(note.title || 'Untitled note')}</h1>
    <div class="meta">${meta}<div style="margin-top:8px">${tags}</div></div>
    <div class="content">${note.contentHtml || `<p>${escapeHtml(note.contentText || '')}</p>`}</div>
    <footer>Exported from Notes Heaven • ${new Date().toLocaleDateString('en-IN')}</footer>
  `;

  printHtml(html, slugify(note.title));
};

/** Saare notes ek hi PDF me (print dialog) */
export const exportNotesAsPdf = (notes = []) => {
  const body = notes
    .map(
      (n) => `
      <section style="page-break-after:always">
        <h1 class="doc-title">${escapeHtml(n.title || 'Untitled')}</h1>
        <div class="meta">${n.folder?.name ? `Folder: ${escapeHtml(n.folder.name)} • ` : ''}${new Date(n.updatedAt || Date.now()).toLocaleString('en-IN')}</div>
        <div>${n.contentHtml || `<p>${escapeHtml(n.contentText || '')}</p>`}</div>
      </section>`
    )
    .join('');
  printHtml(body, 'notes-heaven-export');
};

export const exportNoteAsMarkdown = (note) => {
  const md = `# ${note.title || 'Untitled note'}\n\n_${note.folder?.name ? `Folder: ${note.folder.name} | ` : ''}Updated: ${new Date(
    note.lastEditedAt || note.updatedAt || Date.now()
  ).toLocaleString('en-IN')}_\n\n## Content\n\n${note.contentText || ''}\n`;
  downloadBlob(md, `${slugify(note.title)}.md`, 'text/markdown;charset=utf-8');
};

export const exportNoteAsJson = (note) => {
  downloadBlob(
    JSON.stringify(
      {
        title: note.title,
        tags: (note.tags || []).map((t) => t.name),
        folder: note.folder?.name,
        content: note.content,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    `${slugify(note.title)}.json`,
    'application/json'
  );
};
