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

export class TricountService{

    private _tricounts : Tricount[] = [];

    get tricounts(): Tricount[] {
        return this._tricounts;
    }
    private readonly STORAGE_KEY = 'tricounts';
    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string,
        private authService: AuthenticationService
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
            tap(tricounts => this.saveTricountToStorage(tricounts)),
            tap(tricounts => this._tricounts = tricounts)
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
    saveTricount(tricount: Tricount, description: string | null, participantIds: number[]): Observable<Tricount> {
        if(tricount.id == 0 || tricount.id < 0){
            return this.createTricount(tricount.title, description, participantIds);
        }
        else{
           return null as any; // À implémenter plus tard
        }
    }
    private createTricount(title: string, description: string | null, participantIds: number[]): Observable<Tricount> {
        //creation d'un id temporaire pour le create 
        const tempId = -Date.now();
        const tempTricount: Tricount = {
            id: tempId,
            title: title,
            description: description,
            created_at: new Date().toISOString(),
            creator: this.authService.currentUser!.id!,
            participants: [],
            operations: []
        };

        this._tricounts = [...this._tricounts,tempTricount];

        return this.http.post<any>(`${this.baseUrl}rpc/save_tricount`, {
            id: 0,
            title: title,
            description: description,
            participants: participantIds
        }).pipe(
            map(json => plainToInstance(Tricount, json, { enableImplicitConversion: true })),
            tap(realTricount => {
                // Remplacer le tricount temporaire par le réel
                this._tricounts = this._tricounts.map(t => t.id === tempId ? realTricount : t);
            }),
            switchMap(realTricount => this.getMyTricounts().pipe(map(_=>realTricount)))
        );
    }
}