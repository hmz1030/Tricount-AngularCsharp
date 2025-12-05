import { HttpClient } from "@angular/common/http";
import { map, Observable, switchMap, tap } from "rxjs";
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
    
    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string,
        private authService: AuthenticationService
    ) {}

    getMyTricounts(): Observable<Tricount[]> {
        return this.http.get<any[]>(`${this.baseUrl}rpc/get_my_tricounts`).pipe(
            map(json => plainToInstance(Tricount, json, {
                enableImplicitConversion: true
            })),
            tap(tricounts => this._tricounts = tricounts)
        );
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