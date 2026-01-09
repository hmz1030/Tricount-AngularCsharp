import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { map, Observable, switchMap, tap } from "rxjs";
import { BASE_URL } from "src/main";
import { Operation } from "../models/Operation";
import { Repartition } from "../models/Repartition";
import { plainToInstance } from "class-transformer";
import { TricountService } from "./tricount.service";
import { BalanceService } from "./balance.service";

@Injectable({
    providedIn: 'root'
})

export class OperationService{

    constructor(
        private http: HttpClient,
        @Inject(BASE_URL) private baseUrl: string,
        private tricountService: TricountService,
        private balanceService: BalanceService
    ) {}

    saveOperation(operation: Operation, repartitions: Repartition[]): Observable<Operation> {
        const isCreate = !operation.id || operation.id <= 0;
        
        if (isCreate) {
            return this.createOperation(operation, repartitions);
        } else {
            return this.updateOperation(operation, repartitions);
        }
    }

    private createOperation(operation: Operation, repartitions: Repartition[]): Observable<Operation> {
        const tempId = -Date.now();
        const tempOperation = { ...operation, id: tempId };
        const tricount = this.tricountService.tricounts.find(t => t.id === operation.tricount_id);
        
        if (tricount) {
            tricount.operations.unshift(tempOperation);
        }

        this.balanceService.invalidateBalance(operation.tricount_id!);

        const operationDate = new Date(operation.operation_date!);
        const formattedDate = operationDate.toISOString().split('T')[0];

        return this.http.post<any>(`${this.baseUrl}rpc/save_operation`, {
            id: 0,
            title: operation.title,
            amount: operation.amount,
            operation_date: formattedDate,
            tricount_id: operation.tricount_id,
            initiator: operation.initiator,
            repartitions: repartitions.map(r => ({
                user: r.user_id,
                weight: r.weight
            }))
        }).pipe(
            map(json => plainToInstance(Operation, json, {
                enableImplicitConversion: true
            })),
            tap(realOperation => {
                const tricount = this.tricountService.tricounts.find(t => t.id === operation.tricount_id);
                if (tricount) {
                    const index = tricount.operations.findIndex(op => op.id === tempId);
                    if (index >= 0) {
                        tricount.operations[index] = realOperation;
                    }
                }
            }),
            switchMap(realOperation => 
                this.tricountService.getMyTricounts(true).pipe(
                    switchMap(() => this.balanceService.getTricountBalance(operation.tricount_id!, true)),
                    tap(() => this.balanceService.clearPendingLoad(operation.tricount_id!)),
                    map(() => realOperation)
                )
            )
        );
    }

    private updateOperation(operation: Operation, repartitions: Repartition[]): Observable<Operation> {
        const tricount = this.tricountService.tricounts.find(t => t.id === operation.tricount_id);
        
        if (tricount) {
            const existingIndex = tricount.operations.findIndex(op => op.id === operation.id);
            if (existingIndex >= 0) {
                tricount.operations[existingIndex] = {
                    ...tricount.operations[existingIndex],
                    ...operation
                };
            }
        }

        this.balanceService.invalidateBalance(operation.tricount_id!);

        const operationDate = new Date(operation.operation_date!);
        const formattedDate = operationDate.toISOString().split('T')[0];

        return this.http.post<any>(`${this.baseUrl}rpc/save_operation`, {
            id: operation.id,
            title: operation.title,
            amount: operation.amount,
            operation_date: formattedDate,
            tricount_id: operation.tricount_id,
            initiator: operation.initiator,
            repartitions: repartitions.map(r => ({
                user: r.user_id,
                weight: r.weight
            }))
        }).pipe(
            map(json => plainToInstance(Operation, json, {
                enableImplicitConversion: true
            })),
            switchMap(realOperation => 
                this.tricountService.getMyTricounts(true).pipe(
                    switchMap(() => this.balanceService.getTricountBalance(operation.tricount_id!, true)),
                    tap(() => this.balanceService.clearPendingLoad(operation.tricount_id!)),
                    map(() => realOperation)
                )
            )
        );
    }

    deleteOperation(operationId: number | undefined, tricountId: number): Observable<void> {
        const tricount = this.tricountService.tricounts.find(t => t.id === tricountId);
        
        if (tricount) {
            tricount.operations = tricount.operations.filter(op => op.id !== operationId);
        }

        this.balanceService.invalidateBalance(tricountId);

        return this.http.post<void>(`${this.baseUrl}rpc/delete_operation`, {
            id: operationId
        }).pipe(
            switchMap(() => this.tricountService.getMyTricounts(true)),
            switchMap(() => this.balanceService.getTricountBalance(tricountId, true)),
            tap(() => this.balanceService.clearPendingLoad(tricountId)),
            map(() => undefined)
        );
    }
}