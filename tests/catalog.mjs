import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import express from 'express';
const catalog=JSON.parse(readFileSync(new URL('../content/catalog.json',import.meta.url)));
assert.equal(catalog.length,540);
assert.equal(new Set(catalog.map(e=>e.id)).size,540);
assert.equal(new Set(catalog.map(e=>e.solution)).size,540);
const groups={};const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const errors=[];let sqlChecks=0;
const graderSource=readFileSync(new URL('../lib/catalog.ts',import.meta.url),'utf8').replace("import catalog from '@/content/catalog.json';",'const catalog=[];');
const js=ts.transpileModule(graderSource,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {grade,normalizeAnswer}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
assert.notEqual(normalizeAnswer('g e t'),normalizeAnswer('get'));
assert.notEqual(normalizeAnswer('get;'),normalizeAnswer('get'));
assert.equal(normalizeAnswer("['/a', '/b']"),normalizeAnswer('["/a","/b"]'));

for(const e of catalog){
 assert.equal(grade(e,e.answers).correct,true,e.id+' gabarito aceito');
 groups[e.topic+'-'+e.level]=(groups[e.topic+'-'+e.level]??0)+1;
 assert.equal([...e.template.matchAll(/___\d+___/g)].length,e.answers.length,e.id);
 const complete=e.template.replace(/___(\d+)___/g,(_,n)=>e.answers[Number(n)-1]);
 // Expansion of literal newline answers inside a JS string is preserved.
 assert.equal(complete,e.solution,e.id+' template round trip');
 const source=e.header+e.solution+e.footer;
 const ast=ts.createSourceFile(e.id+'.mjs',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 assert.equal(ast.parseDiagnostics.length,0,e.id+' syntax');
 const sql=[];
 function visit(n){if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.expression.getText(ast)==='db'&&n.expression.name.text==='prepare'&&ts.isStringLiteral(n.arguments[0]))sql.push(n.arguments[0].text);ts.forEachChild(n,visit);}visit(ast);
 const app=express();app.listen=()=>({close:cb=>cb?.()});
 try {
  const executable=source.replace("import express from 'express';",'').replace('const app = express();','').replace("import { DatabaseSync } from 'node:sqlite';","const { DatabaseSync } = await import('node:sqlite');");
  await new AsyncFunction('app','express','process','queries',executable+(e.topic==='database'?'\nfor(const sql of queries) db.prepare(sql); db.close();':''))(app,express,{env:{NODE_ENV:'test'},once:()=>{},exit:()=>{}},sql);
  sqlChecks+=sql.length;
 }catch(err){errors.push({id:e.id,error:err.message});}
}
assert.equal(Object.keys(groups).length,18);for(const count of Object.values(groups))assert.equal(count,30);
if(errors.length){console.error(errors);process.exitCode=1;}else console.log(`PASS: ${catalog.length} exercícios, 18 grupos de 30, 540 inicializações Express 5, ${sqlChecks} consultas SQLite preparadas.`);
