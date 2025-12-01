import { NgClass, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, FormGroupDirective, Validators} from '@angular/forms'
import { ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';


@Component({
  selector: 'app-Login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true, 
    imports: [CommonModule, RouterLink, RouterLinkActive, NgClass, ReactiveFormsModule]
})
export class LoginComponent implements OnInit{
    email!: FormControl;
    password! : FormControl;
    loginForm!: FormGroup;
    loginError: string = '';

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ){}

    ngOnInit() {
        if( this.authService.currentUser){
            this.router.navigate(['tricounts']);
            return;
        }
        this.email = new FormControl('',
            [Validators.required,
            Validators.email]
        );
        this.password = new FormControl('', [
            Validators.required,
            this.hasLowerCase.bind(this),
            this.hasUpperCase.bind(this),
            this.hasNumber.bind(this),
            this.hasSpecialChar.bind(this),
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

    // Password validators
    hasLowerCase(control: FormControl): { [key: string]: boolean } | null {
        if (!control.value) return null;
        return /[a-z]/.test(control.value) ? null : { hasLowerCase: true };
    }

    hasUpperCase(control: FormControl): { [key: string]: boolean } | null {
        if (!control.value) return null;
        return /[A-Z]/.test(control.value) ? null : { hasUpperCase: true };
    }

    hasNumber(control: FormControl): { [key: string]: boolean } | null {
        if (!control.value) return null;
        return /[0-9]/.test(control.value) ? null : { hasNumber: true };
    }

    hasSpecialChar(control: FormControl): { [key: string]: boolean } | null {
        if (!control.value) return null;
        return /[!@#$%^&*(),.?":{}|<>_]/.test(control.value) ? null : { hasSpecialChar: true };
    }
}