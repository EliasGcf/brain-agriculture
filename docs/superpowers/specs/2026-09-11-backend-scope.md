# Escopo inicial do backend — Brain Agriculture

Status: escopo aprovado pelo usuário. Arquitetura detalhada e plano de implementação pendentes.

Referência: [challenge.md](../../../challenge.md).

## Objetivo e limites desta etapa

Resolver o desafio com uma entrega utilizável, documentada e testada, tendo deploy como objetivo posterior. Não há prazo definido. Esta especificação registra o escopo funcional e a base técnica aprovados; não autoriza iniciar a implementação nem resolve os detalhes técnicos explicitamente adiados.

O frontend não será implementado nesta etapa. O backend fornecerá as operações e os dados necessários ao dashboard.

## Acesso

- O sistema será utilizado pela equipe interna, responsável por cadastrar os produtores.
- Todos os usuários internos terão as mesmas permissões.
- O acesso utilizará login com e-mail e senha e token de acesso com expiração.
- Não haverá refresh token: ao expirar, será necessário realizar novo login.
- As contas serão configuradas via seed, com credenciais de demonstração diretamente na seed, conforme escolha do usuário.
- Cadastro público, gestão de usuários e recuperação de senha ficam fora desta versão.
- Usuário de acesso e produtor cadastrado são conceitos distintos.
- Login de produtores e uma visualização própria do dashboard são evoluções futuras. O vínculo entre usuário e produtor e suas regras de autorização não serão implementados agora.

## Produtores

- Cadastrar, consultar, editar e excluir produtores rurais.
- Dados: identificador interno estável, nome e um único campo de documento, contendo CPF ou CNPJ.
- O documento é obrigatório, válido, único no sistema e armazenado sem pontuação.
- O documento pode ser corrigido, mantendo validação e unicidade, sem alterar o identificador interno ou os vínculos do produtor.
- Um produtor pode possuir zero ou várias propriedades.
- A exclusão de um produtor será bloqueada enquanto houver propriedades vinculadas.

## Propriedades rurais

- Cadastrar, consultar, editar e excluir propriedades.
- Dados: nome, produtor, cidade, estado, área total, área agricultável e área de vegetação.
- Cada propriedade pertence a exatamente um produtor.
- Não haverá copropriedade nem transferência de propriedade entre produtores nesta versão.
- Cidade e estado serão recebidos como texto, sem validação geográfica ou catálogo no backend. O catálogo para seleção pertence ao frontend futuro.
- Uma propriedade pode existir sem safras ou culturas plantadas.
- Excluir uma propriedade removerá também suas safras e culturas plantadas em uma única transação.
- Exclusão lógica, recuperação e histórico de transferências ficam fora desta versão.

### Áreas

- Unidade: hectares, com duas casas decimais.
- A área total deve ser maior que zero.
- As áreas agricultável e de vegetação devem ser maiores ou iguais a zero.
- A soma das áreas agricultável e de vegetação não pode ultrapassar a área total.
- A diferença entre a área total e essa soma será considerada área de outros usos no dashboard.
- Não haverá registro de hectares por cultura nesta versão.

## Safras e culturas plantadas

- Cada propriedade terá seus próprios registros de safra.
- A safra terá nome livre, sem exigência de ano ou intervalo estruturado.
- Uma safra poderá ser cadastrada sem culturas e receber culturas posteriormente.
- Safras de propriedades diferentes serão independentes, mesmo que tenham o mesmo nome.
- Cada cultura plantada terá nome livre e pertencerá a uma safra da propriedade.
- Será possível gerenciar safras e incluir, consultar, editar e excluir suas culturas plantadas.
- Não haverá catálogo compartilhado de safras ou culturas.
- As comparações de nomes de safra e cultura ignorarão diferenças entre maiúsculas e minúsculas e espaços nas extremidades, preservando o texto para exibição.
- A mesma cultura não poderá se repetir na mesma safra da mesma propriedade.
- A mesma cultura poderá aparecer em safras diferentes e em propriedades diferentes.
- Não haverá interpretação de sinônimos: por exemplo, “milho” e “milho safrinha” continuarão distintos.

## Listagens

- Listagens com paginação e ordenação estável.
- Produtores: busca por nome ou documento.
- Propriedades: busca por nome e filtros por produtor, estado e cidade.
- Formatos de paginação, critérios exatos de busca, campos de ordenação e contratos HTTP serão detalhados posteriormente.

## Dashboard

O dashboard será global, sem filtros nesta primeira versão.

| Indicador | Definição aprovada |
| --- | --- |
| Total de propriedades | Quantidade de propriedades cadastradas, contando cada uma uma única vez. |
| Total de hectares | Soma das áreas totais das propriedades, sem multiplicação por safra ou cultura. |
| Distribuição por estado | Quantidade de propriedades por estado. |
| Distribuição por cultura | Quantidade de propriedades distintas que possuem cada cultura, considerando todas as safras. |
| Uso do solo | Soma de hectares agricultáveis, de vegetação e de outros usos. |

Uma propriedade com soja em três safras conta uma vez para soja. Se também possuir milho, conta uma vez para milho. Portanto, a distribuição por cultura representa associações entre propriedades e culturas; não representa hectares nem grupos mutuamente exclusivos de propriedades. Para a pizza, o denominador é a soma dessas associações.

## Base técnica aprovada

- API REST em TypeScript com NestJS.
- Monólito modular.
- Drizzle para acesso ao PostgreSQL.
- Docker Compose somente para PostgreSQL; a API não fará parte do Compose.
- Dockerfile próprio para a API.
- Migrações versionadas e seed de demonstração.

DDD, Clean Architecture, limites e estrutura definitiva dos módulos, interfaces internas e detalhes dos containers serão discutidos posteriormente. Não há decisão final de estrutura de diretórios, padrões de repositórios ou camadas nesta especificação.

## Qualidade e critério de conclusão

A futura entrega do backend deve incluir:

- Operações e indicadores descritos nesta especificação.
- Documentação OpenAPI/Swagger.
- README com instruções de execução.
- Migrações, seed de demonstração e dados de teste.
- Docker Compose do PostgreSQL e Dockerfile da API.
- Logs estruturados.
- Testes unitários de regras de negócio e testes de integração com banco real.
- CI executando as verificações.

A cobertura deve verificar especialmente autenticação, validade e duplicidade de documentos, limites de área, relacionamentos, duplicidade de culturas, exclusões e cálculos do dashboard. Os testes de métricas devem contemplar uma cultura repetida em safras diferentes e múltiplas culturas na mesma propriedade.

## Decisões explicitamente adiadas

- Detalhamento de DDD, Clean Architecture e organização interna do monólito.
- Detalhes do Dockerfile, do Compose e do fluxo de execução.
- Provedor, custo, configuração, automação e demais decisões de deploy.
- Contratos detalhados de endpoints, respostas, erros, paginação e ordenação.
- Detalhes de sessão, duração do token e implementação da autenticação.
- Regras operacionais ainda não discutidas para safras, como exclusão de uma safra com culturas e unicidade de seu nome dentro da propriedade.
- Plano de implementação, a ser elaborado após o detalhamento técnico.

Esses pontos não impedem a aprovação do escopo inicial, mas devem ser resolvidos antes da implementação correspondente. Não foram adotadas soluções implícitas para eles.
