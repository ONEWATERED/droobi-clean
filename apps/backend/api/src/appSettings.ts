import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APP_SETTINGS_PATH = resolve(__dirname, '../../../../data/seeds/admin/app-settings.json');

export interface AppSettings {
  brandName: string;
  brandTagline: string;
  logoUrl: string;
  supportEmail: string;
  privacyUrl: string;
  termsUrl: string;
  social: {
    x: string;
    linkedin: string;
    youtube: string;
  };
  footerLinks: Array<{
    label: string;
    href: string;
  }>;
  aboutHtml: string;
}

export interface PublicAppSettings {
  brandName: string;
  brandTagline: string;
  logoUrl: string;
  supportEmail: string;
  privacyUrl: string;
  termsUrl: string;
  social: {
    x: string;
    linkedin: string;
    youtube: string;
  };
  footerLinks: Array<{
    label: string;
    href: string;
  }>;
  aboutHtml: string;
}

let cache: AppSettings | null = null;

async function load(): Promise<AppSettings> {
  if (cache) return cache;
  
  if (!existsSync(APP_SETTINGS_PATH)) {
    // Return default settings if file doesn't exist
    cache = {
      brandName: 'Droobi',
      brandTagline: 'One Water. One Platform.',
      logoUrl: '',
      supportEmail: 'support@example.com',
      privacyUrl: '',
      termsUrl: '',
      social: {
        x: '',
        linkedin: '',
        youtube: ''
      },
      footerLinks: [
        { label: 'About', href: '/about' },
        { label: 'Privacy', href: 'https://example.com/privacy' },
        { label: 'Terms', href: 'https://example.com/terms' }
      ],
      aboutHtml: '<p>Droobi accelerates One Water collaboration: vendors, utilities, projects, and learning in one place.</p>'
    };
    return cache;
  }
  
  const raw = await readFile(APP_SETTINGS_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache!;
}

async function save(settings: AppSettings): Promise<void> {
  cache = settings;
  await writeFile(APP_SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

export async function getAppSettings(): Promise<AppSettings> {
  return load();
}

export async function setAppSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const currentSettings = await load();
  
  // Deep merge for nested objects like social
  const updatedSettings: AppSettings = {
    ...currentSettings,
    ...patch,
    social: {
      ...currentSettings.social,
      ...(patch.social || {})
    }
  };
  
  await save(updatedSettings);
  return updatedSettings;
}

export async function getPublicAppSettings(): Promise<PublicAppSettings> {
  const settings = await load();
  
  // Return all fields as they're all considered safe for public consumption
  return {
    brandName: settings.brandName,
    brandTagline: settings.brandTagline,
    logoUrl: settings.logoUrl,
    supportEmail: settings.supportEmail,
    privacyUrl: settings.privacyUrl,
    termsUrl: settings.termsUrl,
    social: settings.social,
    footerLinks: settings.footerLinks,
    aboutHtml: settings.aboutHtml
  };
}