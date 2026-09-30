import { readFileSync, writeFileSync } from 'node:fs';
const topics = ['routes','data','responses','middleware','validation','database'];
function newlines(code) {
  let out='', quote=null, regex=false, group=false;
  for(let i=0;i<code.length;i++) {
    const c=code[i];
    if(quote) { out+=c; if(c==='\\'){out+=code[++i]??'';} else if(c===quote)quote=null; continue; }
    if(regex) {out+=c; if(c==='\\'){out+=code[++i]??'';} else if(c==='[')group=true; else if(c===']')group=false; else if(c==='/'&&!group)regex=false; continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;out+=c;continue;}
    if(c==='/' && (code[i+1]==='^'||code[i+1]==='[')){regex=true;out+=c;continue;}
    if(c==='\\' && code[i+1]==='n'){out+='\n';i++;continue;}
    out+=c;
  }
  return out;
}
const dbSetup = `import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(':memory:');
// Banco de treino: recriado ao iniciar. Valores monetários em centavos.
db.exec(\`
  PRAGMA foreign_keys = ON;
  CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, preco INTEGER NOT NULL CHECK(preco >= 0), estoque INTEGER NOT NULL DEFAULT 0 CHECK(estoque >= 0), categoria TEXT, ativo INTEGER NOT NULL DEFAULT 1, criado_em TEXT NOT NULL DEFAULT '2026-01-01T00:00:00Z', versao INTEGER NOT NULL DEFAULT 1);
  CREATE TABLE usuarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE);
  CREATE TABLE pedidos (id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id), total INTEGER NOT NULL, status TEXT NOT NULL, criado_em TEXT NOT NULL);
  CREATE TABLE itens_pedido (id INTEGER PRIMARY KEY, pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE, produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL, quantidade INTEGER NOT NULL);
  CREATE TABLE contas (id INTEGER PRIMARY KEY, saldo INTEGER NOT NULL CHECK(saldo >= 0));
  CREATE TABLE auditoria (id INTEGER PRIMARY KEY, acao TEXT NOT NULL, criado_em TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')));
  INSERT INTO produtos (nome, preco, estoque, categoria) VALUES ('Livro Node', 2500, 10, 'livros'), ('Livro Express', 3500, 5, 'livros'), ('Curso API', 9000, 20, 'cursos'), ('Caderno', 1000, 0, NULL);
  INSERT INTO usuarios (nome,email) VALUES ('Ana','ana@exemplo.test'), ('Lia','lia@exemplo.test'), ('Caio','caio@exemplo.test');
  INSERT INTO pedidos VALUES (1,1,8500,'pago','2026-01-01T10:00:00Z'), (2,1,3500,'aberto','2026-01-02T11:00:00Z'), (3,2,9000,'pago','2026-01-03T12:00:00Z');
  INSERT INTO itens_pedido (pedido_id,produto_id,quantidade) VALUES (1,1,2), (1,2,1), (2,2,1), (3,3,1);
  INSERT INTO contas VALUES (1,1000), (2,500);
\`);
`;
const exercises=[];
for(const topic of topics){let level='easy',number=0;
 for(const line of readFileSync(new URL(topic+'.txt',import.meta.url),'utf8').split('\n')){
  if(line.startsWith('# ')){level=line.slice(2);number=0;continue;}
  if(!line.trim())continue;
  const a=line.indexOf('|'),b=line.indexOf('|',a+1);
  const title=line.slice(0,a), instruction=line.slice(a+1,b), raw=line.slice(b+1);
  const answers=[];
  const template=newlines(raw.replace(/«([^»]+)»/g,(_,v)=>{answers.push(v);return `___${answers.length}___`;}));
  const solved=newlines(raw.replace(/«([^»]+)»/g,'$1'));
  const noDefaultParser=/express\.(json|raw)\(/.test(solved)||/express\.text\(\{ type: 'application\/json'/.test(solved);
  const header=`// ${title}\n// ${instruction}\n// Instale: npm install express@5\n// Salve como exercicio.mjs e rode: node exercicio.mjs\n// Requer Node.js 22.13+; rotas são exemplos locais de estudo.\nimport express from 'express';\nconst app = express();\n${noDefaultParser?'':"app.use(express.json());\n"}${topic==='database'?dbSetup:''}\n`;
  const footer=solved.includes('app.listen(')||solved.includes('app.___')?'':"\n\napp.listen(3000, () => console.log('Servidor em http://localhost:3000'));\n";
  exercises.push({id:`${topic}-${level}-${String(++number).padStart(2,'0')}`,topic,level,number,title,instruction,template,answers,solution:solved,header,footer,source:topic==='database'?'https://nodejs.org/api/sqlite.html':'https://expressjs.com/en/5x/api/'});
 }
}
const counts={}; for(const e of exercises){counts[e.topic+'-'+e.level]=(counts[e.topic+'-'+e.level]??0)+1;if(!e.answers.length)throw Error(e.id+' sem lacunas');}
if(exercises.length!==540 || Object.values(counts).some(n=>n!==30))throw Error(JSON.stringify(counts));
writeFileSync(new URL('catalog.json',import.meta.url),JSON.stringify(exercises,null,2)+'\n');
console.log(`${exercises.length} exercícios; 18 grupos de 30. ${new Set(exercises.map(e=>e.solution)).size} soluções únicas.`);
