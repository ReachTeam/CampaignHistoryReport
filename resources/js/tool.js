Nova.booting((Vue, router, store) => {
    router.addRoutes([
        {
            name: 'campaign-history-report',
            path: '/campaign-history-report',
            component: require('./components/Tool'),
        },
    ])
})
