import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-operation',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  templateUrl: './delete-operation.component.html',
  styleUrls: ['./delete-operation.component.css']
})

export class DeleteOperationComponent {}