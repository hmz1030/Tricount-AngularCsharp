import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { map, switchMap, tap } from 'rxjs/operators';
import { BASE_URL } from 'src/main';
import { User } from '../models/user';
import { plainToInstance } from 'class-transformer';  

interface LoginResponse {
    token: string;
}

@Injectable({ 
    providedIn: 'root' 
})
export class AuthenticationService {
    private _currentUser?: User;
    private allusers: User[] = [];


    constructor(
        private http: HttpClient, 
        @Inject(BASE_URL) private baseUrl: string
    ) {
        // Check if user is already logged in
        const data = sessionStorage.getItem('currentUser');
        if (data) {
            this._currentUser = plainToInstance(User, JSON.parse(data));
        }
    }

    get currentUser() :User | undefined{
        return this._currentUser
    }

    get allUsers(): User[] {
        return this.allusers;
    }

    login(email: string, password: string): Observable<User> {
        return this.http.post<LoginResponse>(
            `${this.baseUrl}rpc/login`,
            { email, password },
            {withCredentials: true})
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
                        this._currentUser = user;
                        return user;

                    })
                );
    }

    refresh(): Observable<{token : string}> {
        const token = sessionStorage.getItem('authToken');
        if(!token) throw new Error('No access token');

        return this.http.post<{token: string}> (
            `${this.baseUrl}rpc/refresh`,
            {token},
            {withCredentials: true}
        ).pipe(
            tap(res => sessionStorage.setItem('authToken', res.token))
        );
    }
    
    signup(email: string, password: string, fullName: string, iban?: string): Observable<User> {
        return this.http.post<LoginResponse>(`${this.baseUrl}rpc/signup`, { email, password, full_name : fullName, iban })
            .pipe(
                switchMap(res => this.login(email, password)),
                tap(user => {
                    if (this.allusers.length > 0 && !this.allusers.find(u => u.id === user.id)) {
                        this.allusers.push(user);
                    }
                })
            );
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
        this._currentUser = undefined;
    }
    isEmailAvailable(email: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}rpc/check_email_available`, { email });
    }

    isFullNameAvailable(fullName: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}rpc/check_full_name_available`, { full_name: fullName });
    }

    getAllUsers(forceRefresh: boolean = false): Observable<User[]> {

        if(!forceRefresh && this.allusers.length != 0){
            return of(this.allusers)
        }
        return this.http.get<any[]>(`${this.baseUrl}rpc/get_all_users`)
            .pipe(
                map(users => plainToInstance(User, users, {
                    enableImplicitConversion: true
                })),
                tap(users => this.allusers = users)

            );
    }

    clearcash():void{
        this.allusers = [];
    }
}