import { Type } from "class-transformer";
import { Repartition } from "./Repartition";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

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



    static minAMount(min: number = 0.01): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if(!control.value && control.value !== 0) {
                return null;
            }

            const value = Number(control.value);

            if(isNaN(value)) {
                return {invalidNumber: true};
            }

            if (value < min) {
                return { 
                    minAmount: { 
                        value: value,
                        min: min 
                    } 
                };
            }

            return null;
        }
    }

    // Valider que la date d'opération est entre la création du tricount et aujourd'hui
    static operationDateRange(tricountCreationDate: Date): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null; 
            }

            const operationDate = new Date(control.value);
            const today = new Date();
            today.setHours(23, 59, 59, 999); 
            
            const tricountDate = new Date(tricountCreationDate);
            tricountDate.setHours(0, 0, 0, 0);

            if (operationDate < tricountDate) {
                return { 
                    dateBeforeTricount: { 
                        value: control.value,
                        tricountDate: tricountCreationDate 
                    } 
                };
            }

            if (operationDate > today) {
                return { 
                    dateFuture: { 
                        value: control.value 
                    } 
                };
            }

            return null;
        };
    }
}