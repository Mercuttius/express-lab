import catalog from '@/content/catalog.json';
export type Level = 'easy' | 'medium' | 'hard';
export type Exercise = {id:string;topic:string;level:Level;number:number;title:string;instruction:string;template:string;header:string;footer:string;source:string;blanks:number};
export const exercises = catalog;
export const publicCatalog: Exercise[] = catalog.map(({answers, solution, ...e}) => ({...e,level:e.level as Level,blanks:answers.length}));
export function findExercise(id: string) {return exercises.find(e=>e.id===id);}
// Canonicalize lexical tokens, preserving case and the contents of strings.
export function normalizeAnswer(value:string) {
  const s=value.trim();
  const tokens=s.match(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|[a-zA-Z_$][\w$]*|\d+(?:\.\d+)?|===|!==|=>|==|!=|&&|\|\||\?\?|\?\.|<=|>=|\.\.\.|\S/g)??[];
  return tokens.filter(t=>!/^\s+$/.test(t)).map(t=>{
    if((t[0]==="'"||t[0]==='"')&&t.at(-1)===t[0]) return JSON.stringify(t.slice(1,-1).replace(/\\'/g,"'").replace(/\\"/g,'"'));
    return t;
  }).join('\u0001');
}
export function grade(exercise:typeof catalog[number], answers:string[]) {
  const fields=exercise.answers.map((expected,i)=>(exercise.topic==='database' && /^[A-Z][A-Z _(),.*=?<>]+$/.test(expected) ? normalizeAnswer(expected).toLowerCase()===normalizeAnswer(answers[i]??'').toLowerCase() : normalizeAnswer(expected)===normalizeAnswer(answers[i]??'')));
  return {correct:fields.every(Boolean),fields};
}
