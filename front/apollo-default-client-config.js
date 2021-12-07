export default function ({ $config }) {
    return {
        httpEndpoint: $config.baseUrl || 'http://localhost:4000/graphql',
    }
}