export async function downloadFromApiRoute(url: string) {
  const res = await fetch(url, { method: 'GET' });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }

  const blob = await res.blob();

  const cd = res.headers.get('content-disposition') || '';
  const filename = parseFilenameFromContentDisposition(cd) ?? 'audit_logs.zip';

  const blobUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

function parseFilenameFromContentDisposition(cd: string): string | undefined {
  const match = cd.match(/filename\*?=(?:UTF-8''|")?([^;"\n]+)"?/i);
  if (!match?.[1]) return undefined;

  const raw = match[1].trim();
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
