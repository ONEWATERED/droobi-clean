export interface FeatureFlags {
  lexicon: boolean;
  directory: boolean;
  microsites: boolean;
  profiles: boolean;
}

export const featureFlags: FeatureFlags = {
  lexicon: true,
  directory: true,
  microsites: false,
  profiles: true,
};

export interface ModuleRegistryItem {
  key: keyof FeatureFlags;
  title: string;
  description: string;
  path: string;
}

export const modulesRegistry: ModuleRegistryItem[] = [
  {
    key: 'lexicon',
    title: 'Lexicon',
    description: 'Comprehensive terminology management system',
    path: '/lexicon',
  },
  {
    key: 'directory',
    title: 'Directory',
    description: 'Professional contact and resource directory',
    path: '/directory',
  },
  {
    key: 'microsites',
    title: 'Microsites',
    description: 'Create and manage dedicated project sites',
    path: '/microsites',
  },
  {
    key: 'profiles',
    title: 'Profiles',
    description: 'User profile and portfolio management',
    path: '/profiles',
  },
];