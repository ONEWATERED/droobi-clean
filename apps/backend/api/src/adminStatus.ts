import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to safely read and count items from JSON files
async function getCountFromFile(relativePath: string): Promise<number> {
  try {
    const fullPath = resolve(__dirname, relativePath);
    if (!existsSync(fullPath)) {
      return 0;
    }
    const raw = await readFile(fullPath, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    return 0;
  }
}

// Helper to read feature flags
async function getFeatureFlags(): Promise<Record<string, boolean>> {
  try {
    const flagsPath = resolve(__dirname, '../../../data/seeds/admin/feature-flags.json');
    if (!existsSync(flagsPath)) {
      return {};
    }
    const raw = await readFile(flagsPath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

// Check if server can read seed files (readiness check)
export async function checkReadiness(): Promise<boolean> {
  try {
    // Try to read at least one seed file to verify filesystem access
    const testPath = resolve(__dirname, '../../../data/seeds/lexicon/terms.json');
    if (existsSync(testPath)) {
      await readFile(testPath, 'utf-8');
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Get comprehensive admin status
export async function getAdminStatus() {
  const startTime = process.hrtime.bigint();
  
  // Get version info
  let version = '1.0.0';
  let packageInfo = {};
  try {
    const packagePath = resolve(__dirname, '../../../package.json');
    if (existsSync(packagePath)) {
      const packageRaw = await readFile(packagePath, 'utf-8');
      packageInfo = JSON.parse(packageRaw);
      version = packageInfo.version || '1.0.0';
    }
  } catch (error) {
    // Use defaults
  }

  // Get content counts
  const counts = {
    lexicon: await getCountFromFile('../../../data/seeds/lexicon/terms.json'),
    directory: await getCountFromFile('../../../data/seeds/directory/orgs.json'),
    webinars: await getCountFromFile('../../../data/seeds/webinars/webinars.json'),
    videos: await getCountFromFile('../../../data/seeds/videos/videos.json'),
    trainings: await getCountFromFile('../../../data/seeds/trainings/trainings.json'),
    projects: await getCountFromFile('../../../data/seeds/projects/projects.json'),
    communityPosts: await getCountFromFile('../../../data/seeds/community/posts.json')
  };

  // Get feature flags (if remote flags enabled)
  const flags = process.env.NEXT_PUBLIC_REMOTE_FLAGS === '1' 
    ? await getFeatureFlags() 
    : {};

  // Calculate uptime
  const uptimeMs = Number(process.hrtime.bigint() - startTime) / 1000000;
  const uptimeSec = Math.floor(uptimeMs / 1000);

  return {
    service: 'droobi-api',
    version,
    sha: process.env.GITHUB_SHA || '',
    node: process.version,
    pid: process.pid,
    uptimeSec,
    envName: process.env.ENV_NAME || 'development',
    dataNs: process.env.DATA_NAMESPACE || 'default',
    health: {
      status: 'ok',
      ready: await checkReadiness()
    },
    flags,
    counts
  };
}