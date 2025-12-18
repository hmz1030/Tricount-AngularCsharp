import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ThemeService{
    private isDarkMode = false;

    constructor() {
        this.applyTheme();
    }

    private applyTheme(){
        if(this.isDarkMode){
            document.body.classList.add('dark-theme');
        }else{
            document.body.classList.remove('dark-theme')
        }
    }

    get isDark(): boolean{
        return this.isDarkMode
    }

    toggleTheme(){
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
    }
}