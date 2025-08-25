import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Flag, User } from 'lucide-react';

export default function AdminPage() {
  const isAdminMode = process.env.NEXT_PUBLIC_ADMIN_MODE === '1';

  if (!isAdminMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-xl text-gray-600 mb-8">
              Admin mode is required to access this page.
            </p>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage system settings, feature flags, and user configurations
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature Flags */}
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="mr-2 h-5 w-5 text-primary" />
                  Feature Flags
                </CardTitle>
                <CardDescription>
                  Enable or disable platform modules and features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pt-3">
                  <Link href="/admin/flags">
                    <Button className="w-full">
                      <Flag className="mr-2 h-4 w-4" />
                      Manage Feature Flags
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-primary" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Monitor API health, builds, and content metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pt-3">
                  <Link href="/admin/status">
                    <Button className="w-full" variant="outline">
                      <Activity className="mr-2 h-4 w-4" />
                      View Status
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* App Settings */}
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-primary" />
                  App Settings
                </CardTitle>
                <CardDescription>
                  Configure branding, contact info, and site-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pt-3">
                  <Link href="/admin/app-settings">
                    <Button className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage App Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* User Settings */}
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  User Settings
                </CardTitle>
                <CardDescription>
                  Configure personal preferences and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pt-3">
                  <Link href="/settings">
                    <Button className="w-full" variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      My Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>
              <div className="flex justify-center space-x-4">
                <Link href="/">
                  <Button variant="outline">
                    Return to Home
                  </Button>
                </Link>
                <Link href="/health">
                  <Button variant="outline">
                    System Health
                  </Button>
                </Link>
                    <User className="mr-2 h-4 w-4" />
            </div>
          </div>
        </div>
          {/* App Settings */}
          <Card className="group hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                App Settings
              </CardTitle>
              <CardDescription>
                Configure branding, contact info, and site-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="pt-3">
                <Link href="/admin/app-settings">
                  <Button className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage App Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

      </div>
    </div>
  );
}
  )
}
  )
}