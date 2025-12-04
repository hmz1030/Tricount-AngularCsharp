import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Tricount } from "../models/Tricount";
import { plainToInstance } from "class-transformer";
import { Inject, Injectable } from "@angular/core";
import { BASE_URL } from "src/main";
import { UserBalance } from "../models/UserBalance";

@Injectable({
    providedIn: 'root'
})

export class TricountService{
    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string
    ) {}

    getMyTricounts(): Observable<Tricount[]> {
        return this.http.get<any[]>(`${this.baseUrl}rpc/get_my_tricounts`).pipe(
            map(json => plainToInstance(Tricount, json, {
                enableImplicitConversion: true
            }))
        );
    }

    getTricountBalance(id: number): Observable<UserBalance[]>{
        return this.http.get<any[]>(`${this.baseUrl}rpc/get_tricount_balance?tricount_id=${id}`).pipe(
            map(json => plainToInstance(UserBalance, json, {
                enableImplicitConversion: true
            }))
        );
    }
    saveTricount(tricount: Tricount): Observable<Tricount> {
        return this.http.post<any>(`${this.baseUrl}rpc/save_tricount`, tricount).pipe(
            map(json => plainToInstance(Tricount, json, {
                enableImplicitConversion: true
            }))
        );
    }

}