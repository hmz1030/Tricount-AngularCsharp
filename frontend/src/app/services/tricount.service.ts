import { HttpClient } from "@angular/common/http";
import { map, Observable, of, tap } from "rxjs";
import { Tricount } from "../models/Tricount";
import { plainToInstance } from "class-transformer";
import { Inject, Injectable } from "@angular/core";
import { BASE_URL } from "src/main";
import { UserBalance } from "../models/UserBalance";

@Injectable({
    providedIn: 'root'
})

export class TricountService{
    private readonly STORAGE_KEY = 'tricounts';
    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string
    ) {}

    getMyTricounts(forceRefresh: boolean = false): Observable<Tricount[]> {

        if(!forceRefresh) {
            const cached = this.getTricountsFromStorage();
            if(cached && cached.length > 0)
                return of(cached);
        }
        
        return this.http.get<any[]>(`${this.baseUrl}rpc/get_my_tricounts`).pipe(
            map(json => plainToInstance(Tricount, json, {
                enableImplicitConversion: true
            })),
            tap(tricounts => this.saveTricountToStorage(tricounts))
        );
    }

    private saveTricountToStorage(tricounts: Tricount[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tricounts));
        } catch (error) {
            console.error('Error saving triocunts to localstorage', error);
        }
    }

    private getTricountsFromStorage(): Tricount[] {
        try{
            const data = localStorage.getItem(this.STORAGE_KEY);
            if(data) {
                const parsed = JSON.parse(data);
                return plainToInstance(Tricount, parsed as any[]);
            }
        } catch (error) {
            console.error('Error reading tricounts from localstorage:', error);
        }
        return [];
    }

    clearCache(): void {
        localStorage.removeItem(this.STORAGE_KEY);
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