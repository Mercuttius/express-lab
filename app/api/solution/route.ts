import { database } from '@/db/raw';
import { findExercise } from '@/lib/catalog';
import { userId,json,sameOrigin,unavailable } from '@/lib/api';
export async function POST(req:Request){try{
 const user=await userId();if(!user)return json({error:'Entre para consultar e registrar o aprendizado.'},401);
 if(!sameOrigin(req))return json({error:'Origem inválida'},403);
 const body:any=await req.json().catch(()=>null);if(typeof body?.sessionId!=='string')return json({error:'Sessão inválida'},400);
 const db=database();const session=await db.prepare('SELECT exercise_id,closed_at FROM practice_sessions WHERE id=? AND user_id=?').bind(body.sessionId,user).first<{exercise_id:string;closed_at:string|null}>();
 if(!session)return json({error:'Sessão não encontrada'},404);
 if(!session.closed_at)await db.prepare('UPDATE practice_sessions SET assisted=1 WHERE id=? AND user_id=?').bind(body.sessionId,user).run();
 const exercise=findExercise(session.exercise_id)!;
 return json({answers:exercise.answers,solution:exercise.solution,explanation:exercise.instruction});
}catch(e){return unavailable(e);}}
