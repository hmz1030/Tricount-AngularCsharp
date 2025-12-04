import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AsyncValidatorFn, ValidationErrors, AbstractControl, ReactiveFormsModule, ValidatorFn, FormGroupDirective, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { AuthenticationService } from '../../services/authentication.service';
import { SetFocusDirective } from '../../directives/setfocus.directive';
import { ImmediateErrorStateMatcher } from '../../matchers/imediate-error-state.matcher';
import { User } from 'src/app/models/user';

@Component({
    selector: 'add-operation',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatDatepickerModule,
        MatIconModule,
        SetFocusDirective
    ],
    templateUrl: './add-operation.component.html',
    styleUrls: ['./add-operation.component.css']
})

export class AddOperationComponent {
    users: User[] = [];
    error: string | null = null;
    tricountId!: number;
    public frm!: FormGroup;
    public titleCtl!: FormControl;
    public amountCtl!: FormControl;
    public dateCtl!: FormControl;
    matcher = new ImmediateErrorStateMatcher();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private auth: AuthenticationService
    ) {
        this.frm = this.fb.group({
            titleCtl: ['', Validators.required],
            amountCtl: ['', Validators.required],
            dateCtl: [new Date(), Validators.required]
        });
    }

    ngOnInit() {
        this.tricountId = Number(this.route.snapshot.paramMap.get('id'));
    }

    back(): void {
       this.router.navigate(['/tricount/' + this.tricountId]) 
    }

    save(): void {

    }

    getAllUsers(): void{
        this.error = null;

        this.auth.getAllUsers().subscribe({
            next: u => {
                this.users = u;
            },
            error: err => {
                console.error(err);
                this.error = 'Impossible de charger vos tricounts.';
            }
        })
    }
}