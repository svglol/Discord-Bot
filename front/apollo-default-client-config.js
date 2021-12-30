export default function ({ $config }) {
    return {
        httpEndpoint: $config.baseUrl || 'http://localhost:3000/graphql',
    }
}