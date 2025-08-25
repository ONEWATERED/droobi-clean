export interface FeatureFlags {
  lexicon: boolean;
  directory: boolean;
  microsites: boolean;
  profiles: boolean;
  webinars: boolean;
  tv: boolean;
  trainings: boolean;
  projects: boolean;
  lounge: boolean;
  community: boolean;
  inbox: boolean;
  gamification: boolean;
  quiz: boolean;
  waterMinute: boolean;
  credentials: boolean;
}

export const featureFlags: FeatureFlags = {
  lexicon: true,
  directory: true,
  microsites: false,
  profiles: true,
  webinars: false,
  tv: false,
  trainings: false,
  projects: true,
  lounge: false,
  community: false,
  inbox: false,
  gamification: false,
  quiz: false,
  waterMinute: false,
  credentials: false,
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
  {
    key: 'webinars',
    title: 'Events',
    description: 'Webinars and educational workshops',
    path: '/events',
  },
  {
    key: 'tv',
    title: 'TV',
    description: 'Educational videos and content library',
    path: '/tv',
  },
  {
    key: 'trainings',
    title: 'Trainings',
    description: 'Structured learning courses and progress tracking',
    path: '/trainings',
  },
  {
    key: 'projects',
    title: 'Projects',
    description: 'RFP opportunities and collaborative bid rooms',
    path: '/projects',
  },
  {
    key: 'lounge',
    title: 'Lounge',
    description: 'Community chat rooms and real-time discussions',
    path: '/lounge',
  },
  {
    key: 'community',
    title: 'Community',
    description: 'Discussion posts and knowledge sharing',
    path: '/community',
  },
  {
    key: 'inbox',
    title: 'Inbox',
    description: 'Notifications and activity updates',
    path: '/inbox',
  },
  {
    key: 'gamification',
    title: 'Gamification',
    description: 'Points, badges, and leaderboard system',
    path: '/gamification',
  },
  {
    key: 'quiz',
    title: 'Quiz',
    description: 'Daily knowledge questions and community stats',
    path: '/quiz',
  },
  {
    key: 'waterMinute',
    title: 'Water Minute',
    description: 'Daily 60-second insights on water technology and trends',
    path: '/water-minute',
  },
  {
    key: 'credentials',
    title: 'Credentials',
    description: 'Professional licenses, certifications, and resume management',
    path: '/credentials',
  },
];