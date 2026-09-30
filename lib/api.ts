import { getChatGPTUser } from '@/app/chatgpt-auth';
export async function userId(){return (await getChatGPTUser())?.userId ?? null;}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin;}
export function localDay(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function unavailable(error:unknown){console.error('Express Lab storage:',error);return json({error:'Não foi possível acessar o banco. Suas respostas foram preservadas; tente novamente.'},503);}
