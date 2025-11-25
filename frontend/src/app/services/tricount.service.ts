import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Tricount } from "../models/Tricount";
import { plainToInstance } from "class-transformer";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class TricountService{
    private readonly baseUrl = "http://localhost:3000/rpc"

    constructor (private http: HttpClient) {}

    getMyTricounts(): Observable<Tricount[]> {
        return this.http.get<any[]>(`${this.baseUrl}/get_my_tricounts`).pipe(
            map(json => plainToInstance(Tricount, json, {
                enableImplicitConversion: true
            }))
        );
    }
}