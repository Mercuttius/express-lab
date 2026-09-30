import { database } from '@/db/raw';
import { findExercise,grade } from '@/lib/catalog';
import { userId,json,sameOrigin,localDay,unavailable } from '@/lib/api';
export async function POST(req:Request){try{
 const user=await userId();if(!user)return json({error:'Entre para salvar seu aprendizado.'},401);
 if(!sameOrigin(req))return json({error:'Origem inválida'},403);
 const body:any=await req.json().catch(()=>null);
 if(!body||typeof body.sessionId!=='string'||typeof body.requestId!=='string'||! /^[a-f0-9-]{36}$/.test(body.requestId)||!Array.isArray(body.answers)||body.answers.length>20||body.answers.some((x:unknown)=>typeof x!=='string'||x.length>500))return json({error:'Respostas inválidas'},400);
 const db=database();
 const previous=await db.prepare('SELECT correct,assisted,fields FROM attempts WHERE id=? AND user_id=?').bind(body.requestId,user).first<{correct:number;assisted:number;fields:string}>();
 if(previous)return json({correct:!!previous.correct,assisted:!!previous.assisted,fields:JSON.parse(previous.fields)});
 const session=await db.prepare('SELECT * FROM practice_sessions WHERE id=? AND user_id=?').bind(body.sessionId,user).first<{exercise_id:string;assisted:number;closed_at:string|null}>();
 if(!session)return json({error:'Sessão não encontrada. Reabra o exercício.'},404);
 if(session.closed_at)return json({error:'Prática concluída. Use Praticar novamente para repetir.'},409);
 const exercise=findExercise(session.exercise_id)!;
 if(body.answers.length!==exercise.answers.length||body.answers.some((s:string)=>!s.trim()))return json({error:'Preencha todas as lacunas.'},400);
 const result=grade(exercise,body.answers);const now=new Date().toISOString();
 const statements=[db.prepare('INSERT INTO attempts (id,user_id,session_id,exercise_id,correct,assisted,fields,created_at,local_day) SELECT ?,user_id,id,exercise_id,?,assisted,?,?,? FROM practice_sessions WHERE id=? AND user_id=? AND closed_at IS NULL ON CONFLICT(id) DO NOTHING').bind(body.requestId,result.correct?1:0,JSON.stringify(result.fields),now,localDay(),body.sessionId,user)];
 if(result.correct)statements.push(db.prepare('UPDATE practice_sessions SET closed_at=? WHERE id=? AND user_id=? AND closed_at IS NULL').bind(now,body.sessionId,user));
 await db.batch(statements);
 const saved=await db.prepare('SELECT correct,assisted,fields FROM attempts WHERE id=? AND user_id=?').bind(body.requestId,user).first<{correct:number;assisted:number;fields:string}>();
 if(!saved)return json({error:'Esta prática já foi concluída em outra aba.'},409);
 return json({correct:!!saved.correct,assisted:!!saved.assisted,fields:JSON.parse(saved.fields)});
}catch(e){return unavailable(e);}}
