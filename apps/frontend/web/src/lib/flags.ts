import { FeatureFlags } from '@repo/core';

// Parse environment flags as fallback
function parseEnvFlags(): FeatureFlags {
  const envFlags = process.env.NEXT_PUBLIC_FLAGS || '';
  const parsed: Partial<FeatureFlags> = {};
  
  envFlags.split(',').forEach(pair => {
    const [key, value] = pair.split(':');
    if (key && value !== undefined) {
      parsed[key as keyof FeatureFlags] = value === '1';
    }
  });
  
  return {
    lexicon: false,
    directory: false,
    microsites: false,
    profiles: false,
    webinars: false,
    tv: false,
    trainings: false,
    projects: false,
    lounge: false,
    community: false,
    inbox: false,
    gamification: false,
    quiz: false,
    waterMinute: false,
    credentials: false,
    ...parsed
  };
}

// Fetch remote flags if enabled
async function fetchRemoteFlags(): Promise<FeatureFlags | null> {
  if (process.env.NEXT_PUBLIC_REMOTE_FLAGS !== '1') {
    return null;
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/admin/flags`, { cache: 'no-store' });
    
    if (!response.ok) {
      console.warn('Failed to fetch remote flags, using environment fallback');
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.warn('Error fetching remote flags:', error);
    return null;
  }
}

// Get effective feature flags (remote overrides environment)
export async function getEffectiveFlags(): Promise<FeatureFlags> {
  const envFlags = parseEnvFlags();
  const remoteFlags = await fetchRemoteFlags();
  
  return remoteFlags ? { ...envFlags, ...remoteFlags } : envFlags;
}