import Lab from './lab';
import { publicCatalog } from '@/lib/catalog';
export const dynamic='force-dynamic';
export default function Home(){return <Lab exercises={publicCatalog}/>;}
