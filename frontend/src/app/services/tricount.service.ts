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

    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string,
        private authService: AuthenticationService
    ) {}

    getMyTricounts(forceRefresh: boolean = false): Observable<Tricount[]> {

        if(!forceRefresh && this._tricounts.length > 0) {
            console.log("Returning from cache")
            return of(this._tricounts)
        }
        
        console.log("returning from server")
        return this.http.get<any[]>(`${this.baseUrl}rpc/get_my_tricounts`).pipe(
            map(json => plainToInstance(Tricount, json, {
                enableImplicitConversion: true
            })),
            tap(tricounts => this._tricounts = tricounts)
        );
    }


    clearCache(): void {
        this._tricounts = [];
    }

    getTricountBalance(id: number): Observable<UserBalance[]>{
        return this.http.get<any[]>(`${this.baseUrl}rpc/get_tricount_balance?tricount_id=${id}`).pipe(
            map(json => plainToInstance(UserBalance, json, {
                enableImplicitConversion: true
            }))
        );
    }
    saveTricount(tricount: Tricount, participantIds: number[]): Observable<Tricount> {
        if(tricount.id === 0 || tricount.id < 0){
            return this.createTricount(tricount, participantIds);
        }
        else{
            return this.updateTricount(tricount, participantIds);
        }
    }
    
    private createTricount(tricount: Tricount, participantIds: number[]): Observable<Tricount> {
        const tempId = -Date.now();
        const tempTricount: Tricount = {
            ...tricount,
            id: tempId,
            created_at: new Date().toISOString(),
            creator: this.authService.currentUser!.id!,
            participants: [],
            operations: []
        };

        this._tricounts = [tempTricount, ...this._tricounts];

        return this.http.post<any>(`${this.baseUrl}rpc/save_tricount`, {
            id: 0,
            title: tricount.title,
            description: tricount.description,
            participants: participantIds
        }).pipe(
            map(json => plainToInstance(Tricount, json, { enableImplicitConversion: true })),
            tap(realTricount => {
                this._tricounts = this._tricounts.map(t => t.id === tempId ? realTricount : t);
            }),
            switchMap(realTricount => this.getMyTricounts(true).pipe(map(_ => realTricount)))
        );
    }
    
    private updateTricount(tricount: Tricount, participantIds: number[]): Observable<Tricount> {
        const oldTricount = this._tricounts.find(t => t.id === tricount.id);
        
        this._tricounts = this._tricounts.map(t => t.id === tricount.id ? tricount : t);
        
        return this.http.post<any>(`${this.baseUrl}rpc/save_tricount`, {
            id: tricount.id,
            title: tricount.title,
            description: tricount.description,
            participants: participantIds
        }).pipe(
            map(json => plainToInstance(Tricount, json, { enableImplicitConversion: true })),
            tap(realTricount => {
                this._tricounts = this._tricounts.map(t => t.id === tricount.id ? realTricount : t);
            }),
            switchMap(realTricount => this.getMyTricounts(true).pipe(map(_ => realTricount)))
        );
    }

    deleteTricount(id : number): Observable<any>{
        return this.http.post<any>(`${this.baseUrl}rpc/delete_tricount`,{
            tricount_id: id
        })
    }
     isTricountTitleAvailable(title: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}rpc/check_tricount_title_available`, { title });
    }
}