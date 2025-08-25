import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const featureFlags = {
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

const modulesRegistry = [
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Droobi Clean</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modular platform providing essential tools and services for modern workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modulesRegistry.map((module) => {
            const isEnabled = featureFlags[module.key as keyof typeof featureFlags];
            
            return (
              <Card key={module.key} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {module.title}
                    {isEnabled ? (
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {module.description}
                  </CardDescription>
                  
                  {isEnabled ? (
                    <Link
                      href={module.key === 'profiles' ? '/me' : module.path}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Launch module
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  ) : (
                    <div className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-md">
                      <Clock className="mr-2 h-3 w-3" />
                      Coming soon
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/health"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            System Health Check
          </Link>
        </div>
      </div>
    </div>
  );
}