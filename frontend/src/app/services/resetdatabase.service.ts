import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { BASE_URL } from "src/main";
import { TricountService } from "./tricount.service";

@Injectable({
    providedIn: 'root'
})

export class ResetDataBaseService {
    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string,
        private tricountService: TricountService
    ){}

    resetDataBase(): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}rpc/reset_database`, {}).pipe(
            tap(() => {
                this.clearCache();
            })
        );
    }

    private clearCache(): void {
        this.tricountService.clearCache();
        sessionStorage.clear();
    }
}