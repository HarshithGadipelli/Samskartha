import { Router } from 'express';
import multer from 'multer';
import {
  listPlatformProfiles,
  getPlatformProfile,
  listTaskTemplates,
  getTaskTemplate,
  listKnowledgeSources,
  listBenchmarks
} from '../services/profileRepository.js';
import { generatePackage, compareAllPlatforms } from '../services/generationService.js';
import { analyzeRequirements } from '../services/inputAnalysisService.js';
import {
  getDatabaseStats,
  getCollectionDocuments,
  getGenerationHistory,
  deleteHistoryItem
} from '../services/databaseService.js';

const router = Router();
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 10);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadMb * 1024 * 1024, files: 5 }
});

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'samskartha-api',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    firestoreConfigured: process.env.FIRESTORE_ENABLED === 'true'
  });
});

router.get('/platforms', async (_req, res, next) => {
  try {
    const profiles = await listPlatformProfiles();
    res.json(profiles.map(({ id, name, url, destinationUrl, promptStyle, rules, lastVerified, profileVersion }) => ({
      id,
      name,
      url: destinationUrl || url,
      promptStyle,
      ruleCount: (rules || []).length,
      rules: rules || [],
      lastVerified,
      profileVersion
    })));
  } catch (error) { next(error); }
});

router.get('/platforms/:platformId', async (req, res, next) => {
  try {
    const profile = await getPlatformProfile(req.params.platformId);
    if (!profile) return res.status(404).json({ error: 'Platform profile not found.' });
    res.json(profile);
  } catch (error) { next(error); }
});

router.get('/tasks', async (_req, res, next) => {
  try {
    const tasks = await listTaskTemplates();
    res.json(tasks);
  } catch (error) { next(error); }
});

router.post('/analyze', async (req, res, next) => {
  try {
    const originalRequest = String(req.body.originalRequest ?? '').trim();
    const taskType = req.body.taskType ? String(req.body.taskType).trim() : null;

    if (originalRequest.length < 10) {
      return res.status(400).json({ error: 'Please enter a request with at least 10 characters.' });
    }
    const requirements = await analyzeRequirements(originalRequest, taskType);
    res.json(requirements);
  } catch (error) { next(error); }
});

router.post('/generate', upload.array('files', 5), async (req, res, next) => {
  try {
    const originalRequest = String(req.body.originalRequest ?? '').trim();
    const platformId = String(req.body.platformId ?? '').trim();
    const taskType = req.body.taskType ? String(req.body.taskType).trim() : null;
    
    // Optional advanced retrieval parameters from client
    const lambda = req.body.lambda ? Number(req.body.lambda) : 0.7;

    if (originalRequest.length < 10) {
      return res.status(400).json({ error: 'Please enter a request with at least 10 characters.' });
    }
    if (originalRequest.length > 25_000) {
      return res.status(400).json({ error: 'Request is too long. Please keep it under 25,000 characters.' });
    }
    if (!platformId) {
      return res.status(400).json({ error: 'Please select a target platform.' });
    }

    const result = await generatePackage({
      originalRequest,
      platformId,
      taskType,
      files: req.files ?? [],
      options: { lambda }
    });
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/compare', async (req, res, next) => {
  try {
    const originalRequest = String(req.body.originalRequest ?? '').trim();
    const taskType = req.body.taskType ? String(req.body.taskType).trim() : null;
    if (originalRequest.length < 10) {
      return res.status(400).json({ error: 'Please enter a request with at least 10 characters.' });
    }
    const comparison = await compareAllPlatforms({ originalRequest, taskType });
    res.json(comparison);
  } catch (error) { next(error); }
});

router.get('/database/stats', async (_req, res, next) => {
  try {
    const stats = await getDatabaseStats();
    res.json(stats);
  } catch (error) { next(error); }
});

router.get('/database/collections/:collection', async (req, res, next) => {
  try {
    const docs = await getCollectionDocuments(req.params.collection);
    res.json({ collection: req.params.collection, count: docs.length, documents: docs });
  } catch (error) { next(error); }
});

router.get('/history', (_req, res) => {
  res.json(getGenerationHistory());
});

router.delete('/history/:id', (req, res) => {
  const deleted = deleteHistoryItem(req.params.id);
  res.json({ success: deleted });
});

router.get('/knowledge/sources', async (_req, res, next) => {
  try {
    const sources = await listKnowledgeSources();
    res.json(sources);
  } catch (error) { next(error); }
});

router.get('/benchmarks', async (_req, res, next) => {
  try {
    const benchmarks = await listBenchmarks();
    res.json(benchmarks);
  } catch (error) { next(error); }
});

export default router;
