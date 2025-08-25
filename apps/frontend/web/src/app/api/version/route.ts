import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { existsSync } from 'fs';

export async function GET() {
  let version = '1.0.0';
  
  try {
    const packagePath = resolve(process.cwd(), 'package.json');
    if (existsSync(packagePath)) {
      const packageRaw = await readFile(packagePath, 'utf-8');
      const packageInfo = JSON.parse(packageRaw);
      version = packageInfo.version || '1.0.0';
    }
  } catch (error) {
    // Use default version
  }
  
  return NextResponse.json({
    service: 'droobi-web',
    version,
    sha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || ''
  });
}