import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-reset-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  templateUrl: './confirm-reset-dialog.component.html',
  styleUrls: ['./confirm-reset-dialog.component.css']
})

export class ConfirmResetDialogComponent {}
