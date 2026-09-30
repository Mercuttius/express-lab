import { readFileSync,readdirSync,existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
const file='work/test-sessions.json';
if(!existsSync(file)){console.log('Nenhuma sessão de teste registrada.');process.exit(0);}
const ids=JSON.parse(readFileSync(file,'utf8'));
if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id)))throw Error('Lista inválida');
const path='.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
for(const name of readdirSync(path).filter(x=>x.endsWith('.sqlite'))){const db=new DatabaseSync(path+'/'+name);try{
 if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='attempts'").get())continue;
 db.exec('BEGIN');for(const id of ids){db.prepare('DELETE FROM attempts WHERE session_id=?').run(id);db.prepare('DELETE FROM practice_sessions WHERE id=?').run(id);}db.exec('COMMIT');
}finally{db.close();}}
console.log(`Removidas somente as ${ids.length} sessões de teste registradas e suas tentativas locais.`);
