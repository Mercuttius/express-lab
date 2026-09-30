# Express Lab

Site pessoal de exercícios de completar lacunas em Express 5. São **540 exercícios**: 6 assuntos × 3 níveis × 30 exercícios. Interface em português inspirada no Apple Music para Mac, com biblioteca lateral e controles de semáforo.

## Recursos

- Rotas, entrada de dados, respostas, middlewares, validação/erros e SQLite.
- Correção no servidor, feedback por lacuna e contadores persistentes de acertos e erros.
- Copiar código completo ou baixar `.mjs`, com imports, inicialização do servidor e dados de treino quando necessários.
- Repetição de exercícios; consulta de solução identificada como prática assistida.
- Aprendizado com atividade diária (Brasília), gráfico de 14 dias, desempenho por assunto e exercícios mais repetidos.
- Proficiência baseada nas últimas 5 tentativas independentes por exercício, ponderada por dificuldade e cobertura. Práticas assistidas não aumentam a proficiência.
- Banco D1/SQLite com isolamento por usuário autenticado, operações parametrizadas e proteção contra duplicação de tentativas/requisições concorrentes.

## Rodar o site localmente

Requer Node.js 22.13 ou superior.

```sh
npm ci
npm run build
npm run db:local
npm run dev
```

Abra a URL exibida no terminal. No ambiente local, **Entrar e salvar progresso** usa uma identidade simulada (`local_seedy`), sem pedir credenciais. A publicação usa a autenticação fornecida pelo Sites. Os dados locais são separados dos dados publicados e ficam em `.wrangler/state/`; não apague essa pasta se quiser preservá-los. O comando `db:local` registra migrations e não reaplica as que já foram executadas por ele.

Se você usa esta cópia já preparada, basta `npm run dev`: o banco e as dependências já foram instalados.

## Praticar no VS Code

Crie outra pasta e execute `npm init -y` e `npm install express@5`. Copie um exercício para `exercicio.mjs`, complete as lacunas e execute `node exercicio.mjs`. A maioria dos exemplos usa a porta 3000; encerre o anterior com Ctrl+C. O próprio exemplo indica o caminho e método HTTP. Para POST/PUT/PATCH/DELETE use um cliente HTTP.

Nos exercícios SQLite, o banco de treino é criado em memória com tabelas e registros iniciais e reinicia a cada execução. Isso não afeta o banco persistente de progresso do site. Exemplos de autenticação didática são identificados como demonstração; não são sistemas prontos de autenticação para produção.

## Conteúdo e validação

Os enunciados e códigos estão em `content/*.txt`. Cada seção tem 30 linhas: `título|instrução|código`, com lacunas entre `«` e `»`. Rode `npm run catalog:build` após alterações.

```sh
npm run test:catalog
npm run typecheck
npm run build
```

`test:catalog` confere a distribuição, lacunas, sintaxe, inicialização das 540 aplicações Express e preparação das consultas SQL fixas. O teste não afirma cobrir todos os comportamentos possíveis de todos os exemplos.

`npm run test:api` exige a prévia local ligada. Verifica erro/acerto, idempotência, concorrência, repetição, assistência, autenticação e estatísticas. Cria sessões de teste locais listadas em `work/test-sessions.json`. Use `npm run test:cleanup` depois para remover **apenas** essas sessões e suas tentativas. Não rode testes de escrita contra produção.

## Arquitetura

Interface React/Vinext; runtime Cloudflare Worker; banco D1; migrações Drizzle. As APIs de prática ficam em `app/api/`, a correção em `lib/catalog.ts` e o esquema em `db/schema.ts`. A plataforma autentica os visitantes e os registros são vinculados ao identificador do usuário. O navegador não decide se a resposta está correta.

A proficiência é uma estimativa de prática, não uma certificação: para cada assunto, precisão ponderada × raiz quadrada da cobertura ponderada. Fácil pesa 1, médio 2, difícil 3. A pontuação geral é a média dos seis assuntos.

## Referências

- [Express 5](https://expressjs.com/en/5x/api/)
- [Migração para Express 5](https://expressjs.com/en/guide/migrating-5/)
- [Node.js SQLite](https://nodejs.org/api/sqlite.html)
