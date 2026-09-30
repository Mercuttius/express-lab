import { database } from '@/db/raw';
import { exercises } from '@/lib/catalog';
import { emptySnapshot } from '@/lib/progress';
import { userId,json,localDay,unavailable } from '@/lib/api';
export async function GET(){try{
 const user=await userId();if(!user)return json({error:'Entre para carregar seu aprendizado.'},401);
 const db=database();
 const batches=await db.batch([
  db.prepare('SELECT exercise_id,SUM(correct) AS correct,SUM(1-correct) AS wrong,SUM(CASE WHEN correct=1 AND assisted=1 THEN 1 ELSE 0 END) AS assisted,MAX(created_at) AS last_at FROM attempts WHERE user_id=? GROUP BY exercise_id').bind(user),
  db.prepare('SELECT local_day,COUNT(DISTINCT CASE WHEN correct=1 THEN exercise_id END) AS completed,SUM(correct) AS correct,SUM(1-correct) AS wrong FROM attempts WHERE user_id=? AND local_day>=? GROUP BY local_day ORDER BY local_day').bind(user,localDay(new Date(Date.now()-13*86400000))),
  db.prepare('WITH ranked AS (SELECT exercise_id,correct,ROW_NUMBER() OVER (PARTITION BY exercise_id ORDER BY created_at DESC,id DESC) AS rn FROM attempts WHERE user_id=? AND assisted=0) SELECT exercise_id,AVG(correct) AS precision FROM ranked WHERE rn<=5 GROUP BY exercise_id').bind(user),
  db.prepare('SELECT COUNT(DISTINCT exercise_id) AS independent FROM attempts WHERE user_id=? AND correct=1 AND assisted=0').bind(user)
 ]);
 const s=emptySnapshot();
 for(const row of batches[0].results as any[]){s.counts[row.exercise_id]={correct:Number(row.correct),wrong:Number(row.wrong),assisted:Number(row.assisted),lastAt:row.last_at};}
 const precision=new Map((batches[2].results as any[]).map(r=>[r.exercise_id,Number(r.precision)]));
 for(const t of s.topics){let weightedAccuracy=0,practicedWeight=0;
  for(const e of exercises.filter(e=>e.topic===t.id)){
   const c=s.counts[e.id];if(c){t.correct+=c.correct;t.wrong+=c.wrong;if(c.correct)t.completed++;if(c.correct>c.assisted)t.independent++;}
   if(precision.has(e.id)){const weight=e.level==='easy'?1:e.level==='medium'?2:3;practicedWeight+=weight;weightedAccuracy+=weight*precision.get(e.id)!;}
  }
  t.coverage=practicedWeight/180*100;t.accuracy=practicedWeight?weightedAccuracy/practicedWeight*100:0;
  t.score=t.accuracy*Math.sqrt(t.coverage/100);
 }
 for(let n=13;n>=0;n--){const day=localDay(new Date(Date.now()-n*86400000));const r=(batches[1].results as any[]).find(r=>r.local_day===day);s.days.push({day,completed:Number(r?.completed??0),correct:Number(r?.correct??0),wrong:Number(r?.wrong??0)});}
 s.today=s.days.at(-1)!;
 s.totals={completed:Object.values(s.counts).filter(c=>c.correct>0).length,correct:Object.values(s.counts).reduce((a,c)=>a+c.correct,0),wrong:Object.values(s.counts).reduce((a,c)=>a+c.wrong,0),assisted:Object.values(s.counts).reduce((a,c)=>a+c.assisted,0),independent:Number((batches[3].results[0] as any)?.independent??0),score:s.topics.reduce((a,t)=>a+t.score,0)/6,accuracy:0};
 const attempted=s.totals.correct+s.totals.wrong;s.totals.accuracy=attempted?s.totals.correct/attempted*100:0;
 s.repeated=Object.entries(s.counts).filter(([,v])=>v.correct>1).map(([id,v])=>({id,times:v.correct,wrong:v.wrong})).sort((a,b)=>b.times-a.times||a.id.localeCompare(b.id)).slice(0,10);
 return json(s);
}catch(e){return unavailable(e);}}
