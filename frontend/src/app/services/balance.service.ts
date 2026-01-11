import { HttpClient } from "@angular/common/http";
import { map, Observable, of, tap } from "rxjs";
import { plainToInstance } from "class-transformer";
import { Inject, Injectable } from "@angular/core";
import { BASE_URL } from "src/main";
import { UserBalance } from "../models/UserBalance";
import { AuthenticationService } from "./authentication.service";

@Injectable({
    providedIn: 'root'
})

export class BalanceService{

    private balances : Map<number, UserBalance[]> = new Map<number, UserBalance[]>();
    // les ids tricounts dont le mytotal est en "calculating"
    private pendingLoads: Set<number> = new Set();

    get getbalances(): Map<number, UserBalance[]> {
        return this.balances;
    }

    clearcash():void{
        this.balances = new Map<number, UserBalance[]>();
        this.pendingLoads.clear();
    }

    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string,
        private authService: AuthenticationService
    ) {}

    

    getTricountBalance(id: number,forceRefresh: boolean = false): Observable<UserBalance[]>{
        console.log("bool: ",forceRefresh)
        if(this.balances.has(id) && !forceRefresh){
            console.log("in",this.balances.get(id))
            return of( this.balances.get(id)!);
        }
        console.log("out",this.balances)

        return this.http.get<any[]>(`${this.baseUrl}rpc/get_tricount_balance?tricount_id=${id}`).pipe(
            map(json => plainToInstance(UserBalance, json, {
                enableImplicitConversion: true
            })),
            tap(balances => {
                this.balances.set(id,balances);
            })
            
        );
    }

    getUserBalanceForTricount(userId: number, tricountId: number): UserBalance|undefined{
        return this.balances.get(tricountId)?.find(balance => balance.user == userId)
    }

    // ici on supp la balance du cache pour forcer le "calculating"
    // pendant que les appels au back se font
    invalidateBalance(tricountId: number): void {
        this.balances.delete(tricountId);
        this.pendingLoads.add(tricountId);
    }

    isLoadingInBackground(tricountId: number): boolean {
        return this.pendingLoads.has(tricountId);
    }

    clearPendingLoad(tricountId: number): void {
        this.pendingLoads.delete(tricountId);
    }
}