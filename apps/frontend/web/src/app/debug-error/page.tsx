import { notFound } from 'next/navigation';

interface PageProps {
  searchParams: { boom?: string };
}

export default function DebugErrorPage({ searchParams }: PageProps) {
  // Throw an error when boom=1 query parameter is present
  if (searchParams.boom === '1') {
    throw new Error('Debug error triggered for testing Sentry capture');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Debug Error Page</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            This page is used to test error monitoring and capture.
          </p>
          
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Test Error Capture</h2>
            <p className="text-gray-600 mb-4">
              Add <code className="bg-gray-100 px-2 py-1 rounded">?boom=1</code> to the URL to trigger a test error.
            </p>
            <a
              href="/debug-error?boom=1"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Trigger Error
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}