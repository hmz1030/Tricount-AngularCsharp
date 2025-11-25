import { NgClass } from '@angular/common';
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
  imports: [RouterLink, RouterLinkActive, NgClass, ReactiveFormsModule]

})
export class LoginComponent implements OnInit{
    email!: FormControl;
    password! : FormControl;
    loginForm!: FormGroup;

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ){}

    ngOnInit() {
        this.email = new FormControl('',Validators.required);
        this.password = new FormControl('',Validators.required)
        this.loginForm = new FormGroup({
            email: this.email,
            password : this.password
        });
    }

    onSubmit(){
        if( this.loginForm.invalid) {
            console.log("Form is invalid")
            return;
        }

        
        this.authService.login(this.email.value, this.password.value)
        .subscribe({
            next: (response) => {
                console.log("Login Succesful!",response);
                console.log("Token",response.token);
                this.router.navigate(['tricounts']);
            },
            error: (error) => {
                console.error("Login failed:", error);
            }
            
        });
    }
    testUsers = [
        { email: 'boverhaegen@epfc.eu', name: 'B. Overhaegen' },
        { email: 'bepenelle@epfc.eu', name: 'B. Epenelle' },
        { email: 'xapigeolet@epfc.eu', name: 'X. Apigeolet' },
        { email: 'mamichel@epfc.eu', name: 'M. Amichel' },
        { email: 'gedielman@epfc.eu', name: 'G. Edielman' },
        { email: 'admin@epfc.eu', name: 'Admin' }
    ];

    quickLogin(email: string) {
        this.authService.login(email, 'Password1,')
            .subscribe({
                next: (response) => {
                    console.log("Logged in as:", email);
                },
                error: (error) => {
                    console.error("Login failed:", error);
                }
            });
    }
}