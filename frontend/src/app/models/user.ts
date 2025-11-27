import {Type} from 'class-transformer';
import 'reflect-metadata';

export enum Role {
    User = 0,
    Admin = 1
}
export class User {
    id?: number;
    email?: string;
    password?: string;
    fullName?: string;
    iban?: string;
    role:Role = Role.User;
    token?: string;
    
    public get roleAsString(): string {
        return Role[this.role];
    }
    public get display(): string {
        return `${this.fullName || 'Unknown'} (${this.email})`;
    }

    public get isAdmin(): boolean {
        return this.role === Role.Admin;
    }

    
}
