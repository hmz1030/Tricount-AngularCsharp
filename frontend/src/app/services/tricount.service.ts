import { HttpClient } from "@angular/common/http";
import { catchError, map, Observable, of, switchMap, tap, throwError } from "rxjs";
import { Tricount } from "../models/Tricount";
import { plainToInstance } from "class-transformer";
import { Inject, Injectable } from "@angular/core";
import { BASE_URL } from "src/main";
import { UserBalance } from "../models/UserBalance";
import { AuthenticationService } from "./authentication.service";
import { BalanceService } from "./balance.service";

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
        private authService: AuthenticationService,
        private balanceService: BalanceService
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
        const currentUser = this.authService.currentUser!;
        
        // Créer le tricount temporaire avec tous les participants selected
        //avant l'erreur c que je prenais que le current User !
        const tempTricount: Tricount = {
            ...tricount,
            id: tempId,
            created_at: new Date().toISOString(),
            creator: currentUser.id!,
            participants: this.authService.allUsers.filter(
                user => participantIds.includes(user.id!)
            ),
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
        const existingTricount = this._tricounts.find(t => t.id === tricount.id);
        
        if (existingTricount) {
            existingTricount.title = tricount.title;
            existingTricount.description = tricount.description;
            // Mise à jour optimiste des participants
            existingTricount.participants = this.authService.allUsers.filter(
                user => participantIds.includes(user.id!)
            );
        }
        
        return this.http.post<any>(`${this.baseUrl}rpc/save_tricount`, {
            id: tricount.id,
            title: tricount.title,
            description: tricount.description,
            participants: participantIds
        }).pipe(
            map(json => plainToInstance(Tricount, json, { enableImplicitConversion: true })),
            switchMap(realTricount => this.getMyTricounts(true).pipe(map(_ => realTricount))),
            tap(realTricount => {
                this.balanceService.getTricountBalance(tricount.id, true).subscribe();
            })
        );
    }

    deleteTricount(id : number): Observable<any>{
        const index = this._tricounts.findIndex(t => t.id === id);
        const removed = index >= 0 ? this._tricounts[index] : undefined;

        if(index >= 0) {
            this._tricounts.splice(index, 1);
        }
        this.balanceService.invalidateBalance(id);
        
        return this.http.post<any>(`${this.baseUrl}rpc/delete_tricount`,{
            tricount_id: id
        }).pipe(
            switchMap(() => this.getMyTricounts(true)),
            map(() => undefined),

            catchError(err => {
                if(removed) {
                    const safeIndex = Math.min(Math.max(index, 0), this._tricounts.length);
                    this._tricounts.splice(safeIndex, 0, removed)
                }
                return throwError(() => err)
            })
        );
    }
    
    isTricountTitleAvailable(title: string, tricountId: number = 0): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}rpc/check_tricount_title_available`, { 
            title,
            tricount_id: tricountId 
        });
    }
}