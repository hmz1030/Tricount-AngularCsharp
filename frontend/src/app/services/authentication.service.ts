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

    login(email: string, password: string): Observable<User> {
        return this.http.post<LoginResponse>(`${this.baseUrl}rpc/login`, { email, password })
            .pipe(
                switchMap(response => {
                    if (response && response.token) {
                        sessionStorage.setItem('authToken', response.token);
                    }
                    // recup data du user login
                    return this.getUserData();
                }),
                map(user => {
                    // Stocker les data du user dans session et dans dans currentuser
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUser = user;
                    return user;
                })
            );
    }
    
    signup(email: string, password: string, fullName: string, iban?: string): Observable<User> {
        return this.http.post<LoginResponse>(`${this.baseUrl}rpc/signup`, { email, password, full_name : fullName, iban })
            .pipe(switchMap(res => this.login(email, password)));
    }

    getUserData(): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}rpc/get_user_data`)
            .pipe(map(res => plainToInstance(User, res, {
                enableImplicitConversion: true
            }))
        );
    }

    logout() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('authToken');
        this.currentUser = undefined;
    }
    isEmailAvailable(email: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}rpc/check_email_available`, { email });
    }

    isFullNameAvailable(fullName: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}rpc/check_full_name_available`, { full_name: fullName });
    }

    getAllUsers(): Observable<User[]> {
        return this.http.get<any[]>(`${this.baseUrl}rpc/get_all_users`)
            .pipe(
                map(users => plainToInstance(User, users, {
                    enableImplicitConversion: true
                }))
            );
    }
}