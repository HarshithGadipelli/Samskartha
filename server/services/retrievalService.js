import crypto from 'node:crypto';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in',
  'into', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'with',
  'you', 'your', 'we', 'our', 'what', 'which', 'who', 'will', 'can', 'should'
]);

export function tokenize(text = '') {
  return String(text)
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9_-]*/g)
    ?.filter((word) => word.length > 1 && !STOP_WORDS.has(word)) ?? [];
}

export function computeContentHash(content) {
  return crypto.createHash('sha256').update(content.trim().toLowerCase()).digest('hex');
}

export function splitIntoChunks(text, maxChars = 1400, overlap = 180, metadata = {}) {
  const clean = String(text ?? '').replace(/\r/g, '').replace(/[\t ]+\n/g, '\n').trim();
  if (!clean) return [];

  const chunks = [];
  let start = 0;
  let chunkIndex = 1;

  while (start < clean.length) {
    let end = Math.min(start + maxChars, clean.length);

    if (end < clean.length) {
      // Find a clean break at paragraph boundary, markdown header, sentence boundary, or whitespace
      const paragraphBreak = clean.lastIndexOf('\n\n', end);
      const headingBreak = clean.lastIndexOf('\n#', end);
      const sentenceBreak = clean.lastIndexOf('. ', end);
      const spaceBreak = clean.lastIndexOf(' ', end);

      const optimalBreak = Math.max(paragraphBreak, headingBreak, sentenceBreak, spaceBreak);
      if (optimalBreak > start + Math.floor(maxChars * 0.5)) {
        end = optimalBreak + 1;
      }
    }

    const content = clean.slice(start, end).trim();
    if (content) {
      // Check for heading in chunk
      const headingMatch = content.match(/^(?:#{1,4}\s+([^\n]+)|([A-Z0-9\s-]{3,40})\n)/m);
      const section = headingMatch ? (headingMatch[1] || headingMatch[2]).trim() : `Section ${chunkIndex}`;

      chunks.push({
        chunkId: `chk-${chunkIndex}`,
        documentId: metadata.documentId || 'doc-1',
        fileName: metadata.fileName || 'document.txt',
        sourceType: metadata.sourceType || 'user-file',
        section,
        content,
        contentHash: computeContentHash(content),
        start,
        end
      });
      chunkIndex++;
    }

    if (end >= clean.length) break;
    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
}

export function calculateJaccardSimilarity(termsA, termsB) {
  const setA = new Set(termsA);
  const setB = new Set(termsB);
  if (setA.size === 0 && setB.size === 0) return 1.0;
  let intersection = 0;
  for (const term of setA) {
    if (setB.has(term)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function deduplicateChunks(chunks, nearDuplicateThreshold = 0.85) {
  const seenHashes = new Set();
  const tokenizedList = [];
  const uniqueChunks = [];

  for (const chunk of chunks) {
    // Exact hash check
    const hash = chunk.contentHash || computeContentHash(chunk.content);
    if (seenHashes.has(hash)) continue;

    // Near-duplicate check using tokenized Jaccard similarity
    const tokens = tokenize(chunk.content);
    let isNearDuplicate = false;
    for (const existingTokens of tokenizedList) {
      if (calculateJaccardSimilarity(tokens, existingTokens) >= nearDuplicateThreshold) {
        isNearDuplicate = true;
        break;
      }
    }

    if (!isNearDuplicate) {
      seenHashes.add(hash);
      tokenizedList.push(tokens);
      uniqueChunks.push(chunk);
    }
  }

  return uniqueChunks;
}

// BM25 Lexical Retrieval
export function rankByBM25(query, documents, limit = 10) {
  const queryTerms = [...new Set(tokenize(query))];
  if (!queryTerms.length || !documents.length) return [];

  const tokenizedDocs = documents.map((doc) => tokenize(doc.content));
  const totalLength = tokenizedDocs.reduce((sum, terms) => sum + terms.length, 0);
  const avgdl = totalLength / tokenizedDocs.length || 1;

  const docFreqMap = new Map();
  for (const term of queryTerms) {
    const count = tokenizedDocs.filter((terms) => terms.includes(term)).length;
    docFreqMap.set(term, count);
  }

  const k1 = 1.5;
  const b = 0.75;
  const scored = [];

  for (let i = 0; i < documents.length; i++) {
    const terms = tokenizedDocs[i];
    let score = 0;

    for (const term of queryTerms) {
      const freq = terms.filter((t) => t === term).length;
      if (!freq) continue;

      const df = docFreqMap.get(term) || 0;
      // Robertson-Spärck Jones IDF
      const idf = Math.log(1 + (documents.length - df + 0.5) / (df + 0.5));
      const numerator = freq * (k1 + 1);
      const denominator = freq + k1 * (1 - b + b * (terms.length / avgdl));
      score += idf * (numerator / denominator);
    }

    if (score > 0) {
      scored.push({
        ...documents[i],
        terms,
        bm25Score: score
      });
    }
  }

  scored.sort((a, b) => b.bm25Score - a.bm25Score);
  return scored.slice(0, limit);
}

// Maximal Marginal Relevance (MMR) for diverse, non-redundant context selection
export function selectByMMR(rankedCandidates, maxSelect = 5, lambda = 0.7) {
  if (!rankedCandidates.length) return [];
  if (rankedCandidates.length <= maxSelect) return rankedCandidates;

  // Normalize BM25 scores to [0, 1]
  const maxScore = Math.max(...rankedCandidates.map((c) => c.bm25Score), 0.001);
  const candidates = rankedCandidates.map((c) => ({
    ...c,
    normScore: c.bm25Score / maxScore
  }));

  const selected = [];
  const remaining = [...candidates];

  // Pick the top scoring element first
  const first = remaining.shift();
  selected.push(first);

  while (selected.length < maxSelect && remaining.length > 0) {
    let bestIdx = -1;
    let bestMMR = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      // Max similarity to any already selected chunk
      let maxSim = 0;
      for (const sel of selected) {
        const sim = calculateJaccardSimilarity(candidate.terms, sel.terms);
        if (sim > maxSim) maxSim = sim;
      }

      // MMR formula: lambda * Sim(d, q) - (1 - lambda) * max Sim(d, s)
      const mmrScore = lambda * candidate.normScore - (1 - lambda) * maxSim;
      if (mmrScore > bestMMR) {
        bestMMR = mmrScore;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      selected.push(remaining.splice(bestIdx, 1)[0]);
    } else {
      break;
    }
  }

  return selected;
}

// Evidence-preserving context compression
export function compressContextEvidence(selectedChunks) {
  if (!selectedChunks.length) {
    return {
      compactSummary: 'No uploaded context documents provided.',
      detailedPackage: 'No uploaded context documents provided.'
    };
  }

  const detailedParts = selectedChunks.map((chunk, idx) => {
    return `### Source [${idx + 1}]: ${chunk.fileName} (${chunk.section || 'General'})\n${chunk.content}`;
  });

  const compactLines = selectedChunks.map((chunk, idx) => {
    // Extract first 2 sentences or 220 chars of core evidence
    const snippet = chunk.content.split('\n')[0].slice(0, 240);
    return `[Source ${idx + 1}: ${chunk.fileName}] ${snippet}...`;
  });

  return {
    compactSummary: compactLines.join('\n\n'),
    detailedPackage: detailedParts.join('\n\n')
  };
}

export function retrieveContext(requirements, profile, uploadedFiles = [], options = {}) {
  const query = [
    requirements?.objective,
    requirements?.task_type,
    requirements?.intended_audience,
    ...(requirements?.functional_requirements || []),
    ...(requirements?.constraints || [])
  ].filter(Boolean).join(' ');

  const platformDocs = [
    {
      sourceType: 'platform-profile',
      fileName: `${profile.name} Guidance`,
      section: 'Core Principles',
      content: [profile.promptStyle, ...(profile.principles ?? []), profile.contextStrategy, profile.outputGuidance].join('\n')
    },
    ...(profile.references ?? []).map((ref) => ({
      sourceType: 'official-reference',
      fileName: ref.title,
      sourceUrl: ref.url,
      section: 'Official Documentation',
      content: `${ref.title}. Verified public guidance for ${profile.name}. Reference URL: ${ref.url}. ${ref.whyRelevant || ''}`
    }))
  ];

  const userDocs = uploadedFiles.flatMap((file, fileIdx) =>
    splitIntoChunks(file.text, 1400, 180, {
      documentId: `doc-${fileIdx + 1}`,
      fileName: file.originalName,
      sourceType: 'user-file'
    })
  );

  const allChunks = deduplicateChunks([...userDocs, ...platformDocs]);
  const ranked = rankByBM25(query, allChunks, 12);
  const mmrSelected = selectByMMR(ranked, 6, options.lambda || 0.7);

  const finalItems = mmrSelected.length ? mmrSelected : platformDocs.slice(0, 2);
  let userItems = finalItems.filter((item) => item.sourceType === 'user-file');
  if (userDocs.length > 0 && userItems.length === 0) {
    userItems = userDocs.slice(0, 4);
  }
  const evidence = compressContextEvidence(userItems);

  return {
    query,
    items: finalItems.map(({ terms, bm25Score, normScore, ...item }) => ({
      ...item,
      relevanceScore: Number((bm25Score ?? 0).toFixed(3))
    })),
    compactSummary: evidence.compactSummary,
    detailedPackage: evidence.detailedPackage,
    uploadedFileCount: uploadedFiles.length,
    chunkCount: userDocs.length,
    method: 'Structure-Aware BM25 + MMR Diversity Retrieval'
  };
}
