import { Type } from "class-transformer";
import { Repartition } from "./Repartition";

export class Operation {
    id?: number;
    title?: string;
    amount?: number;
    operation_date?: Date;
    initiator?: number;  
    tricount_id?: number;
    
    @Type(() => Repartition)
    repartitions?: Repartition[];
    
    initiatorName?: string;  
}