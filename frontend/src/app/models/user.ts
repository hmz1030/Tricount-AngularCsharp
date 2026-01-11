import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import 'reflect-metadata';

export enum Role {
    User = 0,
    Admin = 1
}
export class User {
    id?: number;
    email?: string;
    password?: string;
    full_name?: string;
    iban?: string;
    role:Role = Role.User;
    token?: string;
    
    public get roleAsString(): string {
        return Role[this.role];
    }
    public get display(): string {
        return `${this.full_name || 'Unknown'} (${this.email})`;
    }

    public get isAdmin(): boolean {
        return this.role === Role.Admin;
    }

    hasUpperCase(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const hasUpper = /[A-Z]/.test(control.value);
            return hasUpper ? null : { noUpperCase: true };
        };
    }

    hasNumber(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const hasNum = /[0-9]/.test(control.value);
            return hasNum ? null : { noNumber: true };
        };
    }

    hasSpecialChar(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const hasSpecial = /[!@#$%^&*,]/.test(control.value);
            return hasSpecial ? null : { noSpecialChar: true };
        };
    }

    strictEmail(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null; // Ne pas valider si vide (c'est le rôle de 'required')
            }
            // Regex stricte : name@epfc.eu 
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(control.value) ? null : { email: true };
        };
    }

    isValidIban(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const iban = control.value;
            if (!iban || iban.trim() === '') {
                return null; // IBAN is optional
            }


            const cleanedIban = iban.replace(/\s/g, '').toUpperCase();


            const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{12,30}$/;

            return ibanRegex.test(cleanedIban) ? null : { invalidIban: true };
        };
    }
    
    hasLowerCase(control: FormControl): { [key: string]: boolean } | null {
        if (!control.value) return null;
        return /[a-z]/.test(control.value) ? null : { hasLowerCase: true };
    }

    

    
}
