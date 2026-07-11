const fs = require('fs');
const path = require('path');

/**
 * AI Document Testing / Verification Engine
 * ───────────────────────────────────────────────────────────────────────────
 * Runs a battery of automated integrity checks against an uploaded property
 * document (title deed, NOC, floor plan, etc.) and produces a confidence
 * score (0-100) plus human-readable notes, similar to how an AI document
 * verification pipeline would flag suspicious uploads for human review.
 *
 * This is a deterministic, explainable rules engine (file existence, type,
 * size, naming heuristics, basic PDF structure sniffing) — no external AI
 * API key required, so it works out of the box.
 */

const EXPECTED_EXTENSIONS = {
  title_deed: ['.pdf'],
  noc: ['.pdf'],
  floor_plan: ['.pdf', '.doc', '.docx'],
  other: ['.pdf', '.doc', '.docx'],
};

const SUSPICIOUS_NAME_PATTERNS = [/\bsample\b/i, /\bfake\b/i, /\btest\b/i, /\bdummy\b/i, /\btemplate\b/i, /\bwatermark\b/i];

function checkPdfStructure(filePath) {
  // Very lightweight structural sniff: valid PDFs start with %PDF- and
  // contain an EOF marker. This flags obviously corrupt/truncated uploads.
  try {
    const buffer = fs.readFileSync(filePath);
    const header = buffer.slice(0, 8).toString('latin1');
    const hasHeader = header.startsWith('%PDF-');
    const tail = buffer.slice(Math.max(0, buffer.length - 1024)).toString('latin1');
    const hasEOF = tail.includes('%%EOF');
    return { hasHeader, hasEOF };
  } catch {
    return { hasHeader: false, hasEOF: false };
  }
}

/**
 * Analyze a single property document.
 * @param {Object} doc - subdocument with { filename, path, originalName, docType }
 * @param {String} rootDir - backend root dir (for resolving absolute path)
 * @returns {{status: 'verified'|'flagged', score: number, notes: string[]}}
 */
function analyzeDocument(doc, rootDir) {
  const notes = [];
  let score = 100;

  const absolutePath = path.join(rootDir, doc.path.replace(/^\//, ''));
  const ext = path.extname(doc.originalName || doc.filename || '').toLowerCase();

  // 1. File presence check
  const exists = fs.existsSync(absolutePath);
  if (!exists) {
    return { status: 'flagged', score: 0, notes: ['File could not be located on the server.'] };
  }

  // 2. File size sanity check
  const stats = fs.statSync(absolutePath);
  const sizeKB = stats.size / 1024;
  if (sizeKB < 5) {
    score -= 40;
    notes.push('File size is unusually small for a legal document — possibly blank or corrupt.');
  } else if (sizeKB > 10240) {
    score -= 10;
    notes.push('File size is very large; consider re-scanning at a lower resolution.');
  } else {
    notes.push(`File size (${sizeKB.toFixed(0)} KB) is within a normal range.`);
  }

  // 3. Extension vs expected doc type
  const expected = EXPECTED_EXTENSIONS[doc.docType] || EXPECTED_EXTENSIONS.other;
  if (!expected.includes(ext)) {
    score -= 25;
    notes.push(`Unexpected file type "${ext || 'unknown'}" for a ${doc.docType?.replace('_', ' ')} document.`);
  } else {
    notes.push('File type matches the expected format for this document category.');
  }

  // 4. Naming heuristics (placeholder / sample documents)
  const nameToCheck = doc.originalName || '';
  const suspicious = SUSPICIOUS_NAME_PATTERNS.some((re) => re.test(nameToCheck));
  if (suspicious) {
    score -= 35;
    notes.push('File name suggests this may be a placeholder, sample, or template rather than an original document.');
  }

  // 5. PDF structural integrity
  if (ext === '.pdf') {
    const { hasHeader, hasEOF } = checkPdfStructure(absolutePath);
    if (!hasHeader) {
      score -= 30;
      notes.push('File does not have a valid PDF header — it may be mislabeled or corrupted.');
    }
    if (!hasEOF) {
      score -= 15;
      notes.push('PDF end-of-file marker is missing — the upload may be incomplete.');
    }
    if (hasHeader && hasEOF) {
      notes.push('PDF structural integrity check passed.');
    }
  }

  score = Math.max(0, Math.min(100, score));
  const status = score >= 60 ? 'verified' : 'flagged';

  if (status === 'verified') {
    notes.push('Document passed automated verification checks.');
  } else {
    notes.push('Document was flagged for manual review by an admin before the listing is trusted.');
  }

  return { status, score, notes };
}

module.exports = { analyzeDocument };
