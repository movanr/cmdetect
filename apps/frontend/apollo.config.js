module.exports = {
  client: {
    service: {
      name: 'local-schema',
      localSchemaFile: './schema.graphql'
    },
    includes: [
      'src/**/*.{ts,tsx,js,jsx,graphql,gql}'
    ]
  }
};