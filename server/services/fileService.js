import path from 'node:path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

const ALLOWED_EXTENSIONS = new Set(['.txt', '.md', '.markdown', '.pdf', '.docx']);

// Neutralize prompt-injection phrases in untrusted uploaded content
function sanitizeUntrustedText(rawText) {
  return rawText
    .replace(/ignore\s+all\s+(?:previous|prior)\s+instructions/gi, '[sanitized-prompt-injection-attempt]')
    .replace(/you\s+are\s+now\s+(?:DAN|unfiltered|jailbroken|an\s+AI\s+without\s+rules)/gi, '[sanitized-jailbreak-attempt]')
    .replace(/disregard\s+(?:the\s+above|system\s+prompts?)/gi, '[sanitized-system-override-attempt]');
}

export async function extractUploadedFiles(files = []) {
  const results = [];
  for (const file of files) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new Error(`Unsupported file type: ${extension || 'unknown'}. Upload TXT, Markdown, PDF or DOCX files.`);
    }

    let text = '';
    let pageCount = 1;

    if (['.txt', '.md', '.markdown'].includes(extension)) {
      text = file.buffer.toString('utf8');
    } else if (extension === '.pdf') {
      const parsed = await pdfParse(file.buffer);
      text = parsed.text;
      pageCount = parsed.numpages || 1;
    } else if (extension === '.docx') {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      text = parsed.value;
    }

    text = String(text ?? '').replace(/\u0000/g, '').trim();
    if (!text) {
      throw new Error(`No readable text was found in ${file.originalname}.`);
    }

    const sanitized = sanitizeUntrustedText(text);

    results.push({
      originalName: file.originalname,
      extension,
      sizeBytes: file.size,
      pageCount,
      text: sanitized.slice(0, 150_000)
    });
  }

  return results;
}
