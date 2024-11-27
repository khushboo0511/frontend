import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FormDataComponent } from './components/form-data/form-data.component';
import { TemperatureChartComponent } from './components/temperature-chart/temperature-chart.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'form-data',
        component: FormDataComponent
    },
    {
        path: 'charts',
        component: TemperatureChartComponent
    }
];
