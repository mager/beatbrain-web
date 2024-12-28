const { withSuperjson } = require('next-superjson')

module.exports = withSuperjson()({
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
})