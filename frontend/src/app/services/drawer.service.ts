import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
    providedIn: 'root'
})
export class DrawerService {
    private sidenav?: MatSidenav;

    setSidenav(sidenav: MatSidenav): void {
        this.sidenav = sidenav;
    }

    open(): void {
        this.sidenav?.open();
    }

    close(): void {
        this.sidenav?.close();
    }

    toggle(): void {
        this.sidenav?.toggle();
    }
}