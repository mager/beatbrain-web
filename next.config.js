module.exports = {
    async redirects() {
      return [{ source: '/:path*', has: [{ type: 'host', value: 'www.beatbrain.xyz' }], destination: 'https://beatbrain.xyz/:path*', permanent: true }];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.scdn.co',
                port: '',
                pathname: '/image/**',
            },
            {
                protocol: 'https',
                hostname: 'static.hypem.com',
                port: '',
                pathname: '/items_images/**',
            },
            {
                protocol: 'https',
                hostname: 'github.com',
                port: '',
                pathname: '**',
            },
        ],
    },
}
