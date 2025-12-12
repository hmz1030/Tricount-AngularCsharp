import { Type } from "class-transformer";
import { Repartition } from "./Repartition";
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

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
            if (!control.value && control.value !== 0) {
                return null;
            }

            const value = Number(control.value);

            if (isNaN(value)) {
                return { invalidNumber: true };
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

    static getTitleError(control: AbstractControl | null): string {
        if (control?.hasError('required')) {
            return 'Title is required';
        }
        if (control?.hasError('minlength')) {
            return 'Title must be at least 3 characters';
        }
        return '';
    }

    static getAmountError(control: AbstractControl | null): string {
        if (control?.hasError('required')) {
            return 'Amount is required';
        }
        if (control?.hasError('minAmount')) {
            return 'Amount must be at least €0.01';
        }
        if (control?.hasError('invalidNumber')) {
            return 'Amount must be a valid number';
        }
        return '';
    }

    static getDateError(control: AbstractControl | null): string {
        if (control?.hasError('required')) {
            return 'Date is required';
        }
        if (control?.hasError('dateBeforeTricount')) {
            return 'Date may not be before the tricount creation date';  
        }
        if (control?.hasError('dateFuture')) {
            return 'Date may not be in the future';  
        }
        return '';
    }

    static getPaidByError(control: AbstractControl | null): string {
        if (control?.hasError('required')) {
            return 'Payer is required';
        }
        return '';
    }
}