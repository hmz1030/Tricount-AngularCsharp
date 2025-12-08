import { NgClass, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, Validators} from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from 'src/app/models/user';


@Component({
  selector: 'app-Login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true, 
    imports: [CommonModule, RouterLink, RouterLinkActive, NgClass, ReactiveFormsModule,MatFormFieldModule]
})
export class LoginComponent implements OnInit{
    email!: FormControl;
    password! : FormControl;
    loginForm!: FormGroup;
    loginError: string = '';

    constructor(
        private authService: AuthenticationService,
        private router: Router,
        private userModel: User
    ){}

    ngOnInit() {
        if(sessionStorage.getItem('authToken')){
            this.router.navigate(['tricounts']);
            return;
        }
        this.email = new FormControl('',
            [Validators.required,
            Validators.email]
        );
        this.password = new FormControl('', [
            Validators.required,
            this.userModel.hasLowerCase.bind(this),
            this.userModel.hasUpperCase.bind(this),
            this.userModel.hasNumber.bind(this),
            this.userModel.hasSpecialChar.bind(this),
            Validators.minLength(8)
        ]);
        this.loginForm = new FormGroup({
            email: this.email,
            password : this.password
        });
    }

    onSubmit() {
    if (this.loginForm.invalid) {
        this.email.markAsTouched();
        this.password.markAsTouched();
        return;
    }

    this.loginError = '';  
    
    this.authService.login(this.email.value, this.password.value)
    .subscribe({
        next: (response) => {
            console.log("Login Successful!", response);
            this.router.navigate(['tricounts']);
        },
        error: (error) => {
            console.error("Login failed:", error);
            this.loginError = error.error?.message || 'Invalid email or password';
        }
    });
}
    testUsers = [
        { email: 'boverhaegen@epfc.eu', name: 'B. Overhaegen' },
        { email: 'bepenelle@epfc.eu', name: 'B. penelle' },
        { email: 'xapigeolet@epfc.eu', name: 'X. Pigeolet' },
        { email: 'mamichel@epfc.eu', name: 'M. Michel' },
        { email: 'gedielman@epfc.eu', name: 'G. Dielman' },
        { email: 'admin@epfc.eu', name: 'Admin' }
    ];

    quickLogin(email: string) {
        this.authService.login(email, 'Password1,')
            .subscribe({
                next: (response) => {
                    console.log("Logged in as:", email);
                    this.router.navigate(['tricounts']);

                },
                error: (error) => {
                    console.error("Login failed:", error);
                }
            });
    }

    
}