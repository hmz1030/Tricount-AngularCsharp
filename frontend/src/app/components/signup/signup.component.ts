import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AsyncValidatorFn, ValidationErrors, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthenticationService } from '../../services/authentication.service';


@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent {
    public frm!: FormGroup;
    public ctlEmail!: FormControl;
    public ctlFullName!: FormControl;
    public ctlPassword!: FormControl;
    public ctlPasswordConfirm!: FormControl;
    public ctlIban!: FormControl;
    public hidePassword = true;
    public hidePasswordConfirm = true;
    constructor(
        private fb: FormBuilder,
        private router: Router,
        public authService: AuthenticationService
    ) {
        this.ctlEmail = this.fb.control('', [Validators.required, Validators.email]);
        this.ctlFullName = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.ctlPassword = this.fb.control('', [Validators.required, Validators.minLength(8)]);
        this.ctlPasswordConfirm = this.fb.control('', [Validators.required]);
        this.ctlIban = this.fb.control('');
        this.frm = this.fb.group({
            email: this.ctlEmail,
            fullName: this.ctlFullName,
            password: this.ctlPassword,
            passwordConfirm: this.ctlPasswordConfirm,
            iban: this.ctlIban
        }, { validators: this.crossValidations });
    }
     emailUsed(): AsyncValidatorFn {
        let timeout: NodeJS.Timeout;
        return (ctl: AbstractControl) => {
            clearTimeout(timeout);
            const email = ctl.value;
            return new Promise(resolve => {
                timeout = setTimeout(() => {
                    if (email.length === 0) {
                        resolve(null);
                    } else {
                        this.authService.isEmailAvailable(email).subscribe(available => {
                            resolve(available ? null : { emailUsed: true });
                        });
                    }
                }, 300);
            });
        };
    }

    // validator, Grâce au setTimeout et clearTimeout, on ne déclenche le service que 
    // s'il n'y a pas eu de frappe depuis 300 ms.
    fullNameUsed(): AsyncValidatorFn {
        let timeout: NodeJS.Timeout;
        return (ctl: AbstractControl) => {
            clearTimeout(timeout);
            const fullName = ctl.value;
            return new Promise(resolve => {
                timeout = setTimeout(() => {
                    if (fullName.length === 0) {
                        resolve(null);
                    } else {
                        this.authService.isFullNameAvailable(fullName).subscribe(available => {
                            resolve(available ? null : { fullNameUsed: true });
                        });
                    }
                }, 300);
            });
        };
    }
    crossValidations(group: AbstractControl): ValidationErrors | null {
        const password = group.get('password');
        const passwordConfirm = group.get('passwordConfirm');
        return password && passwordConfirm && password.value === passwordConfirm.value
            ? null
            : { passwordNotConfirmed: true };
    }
    signup() {
    if (this.frm.invalid) {
      return;
    }

    const { email, password, fullName, iban } = this.frm.value;

    this.authService.signup(email, password, fullName, iban || undefined).subscribe({
      next: () => {
        if (this.authService.currentUser) {
          this.router.navigate(['/tricounts']);
        }
      },
      error: err => {
        console.error('Erreur signup:', err);
      }
    });
  }
    
}