/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
  schemaFile: '../server/openapi.json',
  apiFile: './src/store/api.ts',
  outputFile: './src/store/api.generated.ts',
  exportName: 'api',
  hooks: true,
}

module.exports = config
