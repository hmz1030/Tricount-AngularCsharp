import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Tricount } from "../models/Tricount";
import { plainToInstance } from "class-transformer";
import { Inject, Injectable } from "@angular/core";
import { BASE_URL } from "src/main";

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
}