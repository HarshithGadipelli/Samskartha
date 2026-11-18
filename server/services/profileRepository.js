import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const platformProfilesDir = path.join(__dirname, '..', 'data', 'platform-profiles');
const taskTemplatesDir = path.join(__dirname, '..', 'data', 'task-templates');
const benchmarkCasesPath = path.join(__dirname, '..', 'data', 'benchmark-cases', 'benchmarks.json');

let firestorePromise;

async function getFirestore() {
  if (process.env.FIRESTORE_ENABLED !== 'true') return null;
  if (!firestorePromise) {
    firestorePromise = (async () => {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (!raw) throw new Error('FIRESTORE_ENABLED is true but FIREBASE_SERVICE_ACCOUNT_JSON is missing.');
      const serviceAccount = JSON.parse(raw);
      const { initializeApp, cert, getApps } = await import('firebase-admin/app');
      const { getFirestore } = await import('firebase-admin/firestore');
      const app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
      return getFirestore(app);
    })();
  }
  return firestorePromise;
}

export async function listPlatformProfiles() {
  const files = (await fs.readdir(platformProfilesDir)).filter((file) => file.endsWith('.json'));
  const profiles = await Promise.all(
    files.map(async (file) => JSON.parse(await fs.readFile(path.join(platformProfilesDir, file), 'utf8')))
  );
  return profiles.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPlatformProfile(platformId) {
  const localProfiles = await listPlatformProfiles();
  const local = localProfiles.find((profile) => profile.id === platformId);
  if (!local) return null;

  const db = await getFirestore();
  if (!db) return local;
  const collectionName = process.env.FIRESTORE_PLATFORM_COLLECTION || 'platform_profiles';
  const snapshot = await db.collection(collectionName).doc(platformId).get();
  return snapshot.exists ? { ...local, ...snapshot.data(), id: platformId } : local;
}

export async function listTaskTemplates() {
  const files = (await fs.readdir(taskTemplatesDir)).filter((file) => file.endsWith('.json'));
  const templates = await Promise.all(
    files.map(async (file) => JSON.parse(await fs.readFile(path.join(taskTemplatesDir, file), 'utf8')))
  );
  return templates.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTaskTemplate(taskTypeId) {
  const templates = await listTaskTemplates();
  const found = templates.find((t) => t.id === taskTypeId);
  if (found) return found;

  // Fallback to match normalized name or first template
  const matched = templates.find((t) => t.id.includes(taskTypeId) || taskTypeId.includes(t.id));
  return matched || templates[0];
}

export async function listKnowledgeSources() {
  const profiles = await listPlatformProfiles();
  const sources = [];
  for (const profile of profiles) {
    for (const ref of profile.references || []) {
      sources.push({
        platformId: profile.id,
        platformName: profile.name,
        title: ref.title,
        url: ref.url,
        whyRelevant: ref.whyRelevant,
        lastVerified: profile.lastVerified,
        profileVersion: profile.profileVersion
      });
    }
  }
  return sources;
}

export async function listBenchmarks() {
  try {
    const raw = await fs.readFile(benchmarkCasesPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
