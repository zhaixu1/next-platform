import { post } from "@/lib/request";
export function getAccountList(){
    return post('/api/account').then(res => res.json());
}