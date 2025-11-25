import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BASE_URL } from 'src/main';
import { User } from '../models/user';
import { plainToInstance } from 'class-transformer';  
import { CommonModule } from '@angular/common';  
interface LoginResponse {
    token: string;
}

@Injectable({ 
    providedIn: 'root' 
})
export class AuthenticationService {
    public currentUser?: User;

    constructor(
        private http: HttpClient, 
        @Inject(BASE_URL) private baseUrl: string
    ) {
        // Check if user is already logged in
        const data = sessionStorage.getItem('currentUser');
        if (data) {
            this.currentUser = plainToInstance(User, JSON.parse(data));
        }
    }

    login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}rpc/login`, { email, password })
        .pipe(map(response => {
            if (response && response.token) {
                sessionStorage.setItem('authToken', response.token);
                const user = plainToInstance(User, response);
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUser = user;
            }
            return response;
        }));
    }
    signup(email: string, password: string, fullName: string, iban?: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}rpc/signup`, { email, password, full_name : fullName, iban })
            .pipe(switchMap(res=>this.login(email,password)));
    }

    logout() {
        sessionStorage.removeItem('currentUser');
        this.currentUser = undefined;
    }
}