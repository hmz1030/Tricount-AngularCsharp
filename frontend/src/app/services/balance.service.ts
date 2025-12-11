import { HttpClient } from "@angular/common/http";
import { map, Observable, of, switchMap, tap } from "rxjs";
import { Tricount } from "../models/Tricount";
import { plainToInstance } from "class-transformer";
import { Inject, Injectable } from "@angular/core";
import { BASE_URL } from "src/main";
import { UserBalance } from "../models/UserBalance";
import { AuthenticationService } from "./authentication.service";

@Injectable({
    providedIn: 'root'
})

export class BalanceService{

    private balances : Map<Number,UserBalance[]> = new Map<Number,UserBalance[]>();

    get getbalances(): Map<Number,UserBalance[]> {
        return this.balances;
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
            tap(balances => this.balances.set(id,balances))
        );
    }

    getUserBalanceForTricount(userId: number, tricountId: number): UserBalance|undefined{
        return this.balances.get(tricountId)?.find(balance => balance.user == userId)
    }
}