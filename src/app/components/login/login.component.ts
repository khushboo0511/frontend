import { Component, inject, Input, input } from '@angular/core';
import { LoginItem } from '../../models/login-item.model';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})
export class LoginComponent {

  authService  =  inject(AuthService);
  router = inject(Router)

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value as { username: string; password: string }; 
      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/form-data']);
        },
        error: (err) => {
          console.error('Login failed:', err);
          alert('Invalid email or password. Please try again.');
        }
      });
    }
  }
  
}