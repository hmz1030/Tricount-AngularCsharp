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
import { Operation } from 'src/app/models/Operation';
import { OperationService } from 'src/app/services/operation.service';
import { BalanceService } from 'src/app/services/balance.service';
import { DeleteOperationComponent } from '../delete-operation/delete-operation.component';
import { MatDialog } from '@angular/material/dialog';


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
    templateUrl: './save-operation.component.html',
    styleUrls: ['./save-operation.component.css']
})

export class SaveOperationComponent {
    users: User[] = [];
    error: string | null = null;
    public UserConnected: User | undefined;
    repartitions: Repartition[] = [];
    tricountId!: number;
    operationId?: number;
    isEditMode: boolean = false;
    public frm!: FormGroup;
    matcher = new ImmediateErrorStateMatcher();
    //dialog: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private auth: AuthenticationService,
        private tricountService: TricountService,
        private balanceService: BalanceService,
        private cdr: ChangeDetectorRef,
        private operationService: OperationService,
        private dialog: MatDialog
    ) {
        this.frm = this.fb.group({
            titleCtl: ['', [
                Validators.required,
                Validators.minLength(3)
            ]],
            amountCtl: ['', [
                Validators.required,
                Operation.minAMount(0.01)
            ]],
            dateCtl: [new Date(), [
                Validators.required
            ]],
            paidBy: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.tricountId = Number(this.route.snapshot.paramMap.get('id'));

        const operationId = this.route.snapshot.paramMap.get('operationId');


        if (operationId) {
            this.operationId = Number(operationId);
            this.isEditMode = true;
            console.log('Edit mode - Operation ID:', this.operationId);
        } else {
            this.isEditMode = false;
            console.log('Create mode');
        }

        this.UserConnected = this.auth.currentUser;
        this.getParticipants();

        this.frm.get('amountCtl')?.valueChanges.subscribe(() => {
            this.cdr.detectChanges();
        });

        setTimeout(() => {
            Object.keys(this.frm.controls).forEach(key => {
                this.frm.get(key)?.markAsTouched();
            });
            this.cdr.detectChanges();
        }, 100);
    }

    back(): void {
        this.router.navigate(['/tricount/' + this.tricountId]);
    }

    save(): void {
        Object.keys(this.frm.controls).forEach(key => {
            this.frm.get(key)?.markAsTouched();
        });

        const activeRepartitions = this.repartitions.filter(r => r.weight > 0);
        if (activeRepartitions.length === 0) {
            this.error = 'At least one participant must be selected';
            return;
        }

        if (this.frm.valid) {
            const formValue = this.frm.value;

            const operation = new Operation();
            operation.id = this.isEditMode ? this.operationId : 0;
            operation.title = formValue.titleCtl;
            operation.amount = formValue.amountCtl;
            operation.operation_date = formValue.dateCtl;
            operation.initiator = formValue.paidBy;
            operation.tricount_id = this.tricountId;

            console.log('Operation to save:', operation);
            this.operationService.saveOperation(operation, activeRepartitions).subscribe({
                next: result => {
                    console.log('Operation saved successfully', result);
                    this.tricountService.clearCache();
                    this.balanceService.clearcash();
                    this.back();
                },
                error: err => {
                    console.error('Error saving operation', err);
                    //erreurs du backend
                    if (err.error?.message) {
                        this.error = err.error.message;
                    } else {
                        this.error = 'Failed to save operations. Plese try again.';
                    }
                }
            });
        } else {
            this.error = 'please fix the errors in the form';
        }
    }

    getParticipants(): void {
        this.tricountService.getMyTricounts().subscribe({
            next: tricounts => {
                const tricount = tricounts.find(t => t.id == this.tricountId);
                if (!tricount) {
                    console.error("tricount not found");
                    this.error = "Tricount not found";
                    return;
                }
                this.users = tricount.participants;

                this.frm.get('dateCtl')?.setValidators([
                    Validators.required,
                    Operation.operationDateRange(new Date(tricount.created_at))
                ]);

                this.frm.get('dateCtl')?.updateValueAndValidity();

                if (this.isEditMode && this.operationId) {
                    this.loadOperationData(tricount);
                } else {
                    this.initializeDefaultValues();
                }

                this.frm.get('dateCtl')?.markAsTouched();
                this.cdr.detectChanges();
            },
            error: err => console.error(err)
        });
    }

    private initializeDefaultValues(): void {
        this.repartitions = this.users.map(user =>
            new Repartition(user.id!, 1)
        );

        if (this.UserConnected?.id) {
            this.frm.patchValue({
                paidBy: this.UserConnected.id
            });
        }
    }

    private loadOperationData(tricount: any): void {
        console.log('Loading operation with ID:', this.operationId);
        console.log('Available operations:', tricount.operations);
        const operation = tricount.operations.find((op: any) => op.id === this.operationId);

        if (!operation) {
            console.error("Operation not found in tricount");
            console.log("Searched ID:", this.operationId);
            console.log("Available IDs:", tricount.operations.map((op: any) => op.id));
            this.error = "Operation not found";
            return;
        }

        console.log('Operation found:', operation);

        this.frm.patchValue({
            titleCtl: operation.title,
            amountCtl: operation.amount,
            dateCtl: new Date(operation.operation_date),
            paidBy: operation.initiator
        });

        console.log('Form patched with values:', this.frm.value);

        //initialiser les repartitions avec les données existantes
        this.repartitions = this.users.map(user => {
            const existingRep = operation.repartitions?.find((r: any) => r.user === user.id);
            const weight = existingRep ? existingRep.weight : 0;
            console.log(`User ${user.full_name} (${user.id}): weight = ${weight}`);
            return new Repartition(user.id!, weight);
        });

        console.log('Repartitions initialized:', this.repartitions);
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



    getAmountError(): string {
        const control = this.frm.get('amountCtl');
        return Operation.getAmountError(control);
    }

    getDateError(): string {
        const control = this.frm.get('dateCtl');
        return Operation.getDateError(control);
    }

    getPaidByError(): string {
        const control = this.frm.get('paidBy');
        return Operation.getPaidByError(control);
    }

    getTitleError(): string {
        const control = this.frm.get('titleCtl');
        return Operation.getTitleError(control)
    }

    deleteOperation(): void {
        const dialogRef = this.dialog.open(DeleteOperationComponent, {
                    width: '400px'
                });
        
                dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
                    if (result === true) {
                        this.operationService.deleteOperation(this.operationId).subscribe({
                            next: () => {
                                this.tricountService.clearCache();
                                this.router.navigate(['/tricount/' + this.tricountId]);
                            },
                            error: (err) => {
                                console.error('Erreur lors du delete:', err);
                                this.error = 'Erreur lors du delete operation';
                            }
                        });
                    }
                });
    }
}