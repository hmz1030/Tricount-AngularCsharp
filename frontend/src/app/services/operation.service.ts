import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "src/main";
import { Operation } from "../models/Operation";

@Injectable({
    providedIn: 'root'
})

export class OperationService{

    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string,
    ) {}

    
}