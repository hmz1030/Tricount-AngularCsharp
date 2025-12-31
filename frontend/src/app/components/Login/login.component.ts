import { NgClass, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, Validators} from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from 'src/app/models/user';
import { ResetDataBaseService } from 'src/app/services/resetdatabase.service';
import { ConfirmResetDialogComponent } from '../resetdatabase/confirm-reset-dialog.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';


@Component({
  selector: 'app-Login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true, 
    imports: [CommonModule,
                RouterLink,
                RouterLinkActive,
                NgClass,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatDialogModule]
})
export class LoginComponent implements OnInit{
    email!: FormControl;
    password! : FormControl;
    loginForm!: FormGroup;
    loginError: string = '';
     userModel: User = new User();
    constructor(
        private authService: AuthenticationService,
        private router: Router,
        private resetDb: ResetDataBaseService,
        private dialog: MatDialog,

        
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

   openResetPopup(): void {
           const dialogRef = this.dialog.open(ConfirmResetDialogComponent, {
               width: '400px'
           });
   
           dialogRef.afterClosed().subscribe(result => {
               if (result === true) {
                   this.resetDb.resetDataBase().subscribe({
                       error: (err) => {
                           console.error('Erreur lors du reset:', err);
                       }
                   });
               }
           });
       }

    
}