import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AsyncValidatorFn, ValidationErrors, AbstractControl, ReactiveFormsModule, ValidatorFn, FormGroupDirective, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthenticationService } from '../../services/authentication.service';
import { SetFocusDirective } from '../../directives/setfocus.directive';
import { ImmediateErrorStateMatcher } from '../../matchers/imediate-error-state.matcher';


@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        SetFocusDirective
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
    matcher = new ImmediateErrorStateMatcher();
    constructor(
        private fb: FormBuilder,
        private router: Router,
        public authService: AuthenticationService
    ) {
        this.ctlEmail = this.fb.control('', [Validators.required, this.strictEmail()], [this.emailUsed()]);
        this.ctlFullName = this.fb.control('', [Validators.required, Validators.minLength(3)], [this.fullNameUsed()]);
        this.ctlPassword = this.fb.control('',
            [Validators.required,
            Validators.minLength(8),
            this.hasUpperCase(),
            this.hasNumber(),
            this.hasSpecialChar()
            ]);
        this.ctlPasswordConfirm = this.fb.control('', [Validators.required]);
        this.ctlIban = this.fb.control('', [this.isValidIban()]);
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
        const password = group.get('password')?.value;
        const passwordConfirm = group.get('passwordConfirm')?.value;
        // renvoie l'erreur au groupe si c'est pas ==
        return password === passwordConfirm ? null : { passwordNotConfirmed: true };
    }
    signup() {
        if (this.frm.invalid) {
            return;
        }

        const { email, password, fullName, iban } = this.frm.value;

        this.authService.signup(email, password, fullName, iban || undefined).subscribe({
            next: () => {
                if (sessionStorage.getItem('authToken')) {
                    this.router.navigate(['/tricounts']);
                }
            },
            error: err => {
                console.error('Erreur signup:', err);
            }
        });
    }

}