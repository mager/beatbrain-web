const { withSuperjson } = require('next-superjson')

module.exports = withSuperjson()({
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.scdn.co',
                port: '',
                pathname: '**',
            },
        ],
    },
})