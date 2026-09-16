/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
  outputFiles: {
    './src/store/api/api.generated.ts': {
      schemaFile: '../server/openapi.json',
      apiFile: './src/store/api/api.ts',
      exportName: 'api',
      hooks: true,
    },
    './src/store/brasil-api/api.generated.ts': {
      schemaFile: './brasil-api-openapi.json',
      apiFile: './src/store/brasil-api/api.ts',
      apiImport: 'brasilApi',
      exportName: 'brasilApi',
      hooks: true,
      filterEndpoints: (_operationName, operation) =>
        operation.path === '/ibge/municipios/v1/{uf}',
      isDataResponse: (code, _includeDefault, response) =>
        code === '200' &&
        (Boolean(response.content?.['application/json']?.schema) ||
          response.content?.['application/json']?.example !== undefined),
    },
  },
}

module.exports = config
