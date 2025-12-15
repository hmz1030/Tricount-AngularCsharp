import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { map, Observable, tap } from "rxjs";
import { BASE_URL } from "src/main";
import { Operation } from "../models/Operation";
import { Repartition } from "../models/Repartition";
import { Title } from "@angular/platform-browser";
import { plainToInstance } from "class-transformer";
import { C } from "node_modules/@angular/cdk/focus-monitor.d-2iZxjw4R";

@Injectable({
    providedIn: 'root'
})

export class OperationService{

    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string,
    ) {}

    saveOperation(operation: Operation, repartitions: Repartition[]): Observable<Operation> {
        const isCreate = !operation.id || operation.id <= 0;
        
        const operationDate = new Date(operation.operation_date!);
        // Format DateOnly pour le bon format attendu par le backend : "YYYY-MM-DD"
        const formattedDate = operationDate.toISOString().split('T')[0];

        return this.http.post<any>(`${this.baseUrl}rpc/save_operation`, {
            id: isCreate ? 0 : operation.id!,
            title: operation.title,
            amount: operation.amount,
            operation_date: formattedDate,
            tricount_id: operation.tricount_id,
            initiator: operation.initiator,
            repartitions: repartitions.map (r => ({
                user: r.user_id,
                weight: r.weight
            }))
        }).pipe(
            map(json => plainToInstance(Operation, json, {
                enableImplicitConversion: true
            })),
            tap(op => console.log(isCreate ? 'Operation created:' : 'Operation edited:', op))
        );
    }

    deleteOperation(operationId :number | undefined): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}rpc/delete_operation`,{
            id: operationId
        });
    }
}