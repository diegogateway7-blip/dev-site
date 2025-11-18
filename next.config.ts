import type {NextConfig} from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseRemotePattern = (() => {
  if (!supabaseUrl) return null;
  try {
    const parsedUrl = new URL(supabaseUrl);
    return {
      protocol: (parsedUrl.protocol.replace(':', '') || 'https') as 'http' | 'https',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || '',
      pathname: '/storage/v1/object/public/**',
    };
  } catch {
    return null;
  }
})();

const remotePatterns = [
  supabaseRemotePattern,
  {
    protocol: 'https',
    hostname: 'placehold.co',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'picsum.photos',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'storage.googleapis.com',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'raspatudopix.com.br',
    port: '',
    pathname: '/**',
  },
].filter(Boolean) as NonNullable<NextConfig['images']>['remotePatterns'];

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns,
  },
};

export default nextConfig;
