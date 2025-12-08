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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ImmediateErrorStateMatcher } from '../../matchers/imediate-error-state.matcher';
import { User } from 'src/app/models/user';
import { MatSelectModule } from '@angular/material/select';
import { ChangeDetectorRef } from '@angular/core';
import { TricountService } from 'src/app/services/tricount.service';
import { Repartition } from 'src/app/models/Repartition';

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
        MatCheckboxModule,
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
    repartitions: Repartition[] = [];
    tricountId!: number;
    public frm!: FormGroup;
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
        this.UserConnected = this.auth._currentUser;
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
                if (!tricount) {
                    console.error("tricount not found");
                    return;
                }
                this.users = tricount.participants;
                //initialiser les répartitions avec poids de 1
                this.repartitions = this.users.map(user =>
                    new Repartition(user.id!, 1)
                );

                //selectionner l'user connecté dans "Paid by"
                if (this.UserConnected?.id) {
                    this.frm.patchValue({
                        paidBy: this.UserConnected.id
                    });
                }
                this.cdr.detectChanges();
            },
            error: err => console.error(err)
        });
    }

    private getRepartition(userId: number): Repartition | undefined {
        return this.repartitions.find(r => r.user_id == userId);
    }


    isParticipantSelected(userId: number): boolean {
        const rep = this.getRepartition(userId);
        return rep !== undefined && rep.weight > 0;  
    }

    toggleParticipant(userId: number, checked: boolean): void {
        const rep = this.getRepartition(userId);
        if (rep) {
            rep.weight = checked ? 1 : 0
        }
    }

    getParticipantWeight(userId: number): number {
        return this.getRepartition(userId)?.weight || 0;
    }

    incrementWeight(userId: number): void {
        const rep = this.getRepartition(userId);
        if (rep) {
            rep.weight++;
            this.cdr.detectChanges();
        }
    }

    decrementWeight(userId: number): void {
        const rep = this.getRepartition(userId);
        if (rep && rep.weight > 0) {
            rep.weight--;
            this.cdr.detectChanges();
        }
    }

    calculateShare(userId: number): number {
        const amount = this.frm.get('amountCtl')?.value;
        if (!amount || amount <= 0) return 0;

        const rep = this.getRepartition(userId);
        if (!rep || rep.weight === 0) return 0;

        const totalWeight = this.repartitions
            .filter(r => r.weight > 0)
            .reduce((sum, r) => sum + r.weight, 0);

        if (totalWeight === 0) return 0;

        return (amount * rep.weight) / totalWeight;
    }

    get selectedParticipants(): number[] {
        return this.repartitions
            .filter(r => r.weight > 0)
            .map(r => r.user_id);
    }








}