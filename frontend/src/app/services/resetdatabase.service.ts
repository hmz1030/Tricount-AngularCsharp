import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "src/main";

@Injectable({
    providedIn: 'root'
})

export class ResetDataBaseService {
    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string
    ){}

    resetDataBase(): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}rpc/reset_database`, {});
    }
}