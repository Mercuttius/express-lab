import { database } from '@/db/raw';
import { findExercise } from '@/lib/catalog';
import { userId,json,sameOrigin,unavailable } from '@/lib/api';
export async function POST(req:Request){try{
 const user=await userId(); if(!user)return json({error:'Entre para salvar seu aprendizado.'},401);
 if(!sameOrigin(req))return json({error:'Origem inválida'},403);
 const body:any=await req.json().catch(()=>null); const exercise=findExercise(body?.exerciseId);
 if(!exercise)return json({error:'Exercício inválido'},400);
 const id=crypto.randomUUID();
 await database().prepare('INSERT INTO practice_sessions (id,user_id,exercise_id,created_at) VALUES (?,?,?,?)').bind(id,user,exercise.id,new Date().toISOString()).run();
 return json({id},201);
}catch(e){return unavailable(e);}}
