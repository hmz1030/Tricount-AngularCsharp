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
import { MatSelectModule } from '@angular/material/select';
import { ChangeDetectorRef } from '@angular/core';
import { TricountService } from 'src/app/services/tricount.service';

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
        MatSelectModule,
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
    public UserConnected: User | undefined;
    tricountId!: number;
    public frm!: FormGroup;
    public titleCtl!: FormControl;
    public paidBy!: FormControl;
    public amountCtl!: FormControl;
    public dateCtl!: FormControl;
    matcher = new ImmediateErrorStateMatcher();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private auth: AuthenticationService,
        private tricountService: TricountService,
        private cdr: ChangeDetectorRef
    ) {
        this.frm = this.fb.group({
            titleCtl: ['', Validators.required],
            amountCtl: ['', Validators.required],
            dateCtl: [new Date(), Validators.required],
            paidBy: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.tricountId = Number(this.route.snapshot.paramMap.get('id'));
        this.UserConnected = this.auth.currentUser;
        this.getParticipants();
        setTimeout(() => {
            this.cdr.detectChanges();
        })
    }

    back(): void {
        this.router.navigate(['/tricount/' + this.tricountId]);
    }

    save(): void {

    }

    getParticipants(): void {
        this.tricountService.getMyTricounts().subscribe({
            next: tricounts => {
                const tricount = tricounts.find(t => t.id == this.tricountId);
                if(!tricount) {
                    console.error("tricount not found");
                    return;
                }
                this.users = tricount.participants;
            },
            error: err => console.error(err)
        });
    }



    
}