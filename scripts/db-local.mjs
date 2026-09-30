import { readdirSync,readFileSync,existsSync,mkdirSync,writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const directory='.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
// Adopt the already-applied first schema from this prepared checkout.
const files=existsSync(directory)?readdirSync(directory).filter(f=>f.endsWith('.sqlite')):[];
for(const file of files){const db=new DatabaseSync(directory+'/'+file);try{
 const existing=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('attempts','practice_sessions')").all();
 if(existing.length===2){db.exec('CREATE TABLE IF NOT EXISTS d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE,applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)');db.prepare('INSERT OR IGNORE INTO d1_migrations (name) VALUES (?)').run('0000_light_black_knight.sql');}
}finally{db.close();}}
const built=JSON.parse(readFileSync('dist/server/wrangler.json','utf8'));
mkdirSync('.sites-runtime',{recursive:true});
writeFileSync('.sites-runtime/db-local.json',JSON.stringify({name:'express-lab-local',compatibility_date:built.compatibility_date,d1_databases:built.d1_databases.map(d=>({...d,migrations_dir:resolve('drizzle')}))}));
const result=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','migrations','apply','DB','--local','--config','.sites-runtime/db-local.json','--persist-to','.wrangler/state'],{stdio:'inherit'});
process.exitCode=result.status??1;
