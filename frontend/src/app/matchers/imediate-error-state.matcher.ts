import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class ImmediateErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    
    // 1. Le champ lui-même est invalide ?
    const controlInvalid = !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));

    //  Le parent a l'erreur 'passwordNotConfirmed' ?
    const parentInvalid = !!(control && control.parent && control.parent.hasError('passwordNotConfirmed') && (control.dirty || control.touched || isSubmitted));

    return controlInvalid || parentInvalid;
  }
}