//@ts-check

const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
const ContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: http: ${
      process.env.NODE_ENV === 'production' ? '' : `'unsafe-eval'`
    };

    style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline';
    img-src 'self' blob: data: https://authjs.dev;
    font-src 'self' data: https://cdn.jsdelivr.net fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://login.microsoftonline.com;
    frame-ancestors ${process.env.ALLOWED_FRAME_ANCESTORS ?? "'none'"};
    ${process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests;' : ''}
`;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1500mb', // 1.5GB
    },
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/((?!api/v1).*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate', // Adjust as needed
          },
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\n/g, '').trim(),
          },
        ],
      },
      {
        source: '/api/auth/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\n/g, '').trim(),
          },
        ],
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
