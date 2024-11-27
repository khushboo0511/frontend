import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guardGuard: CanActivateFn = (route, state) => {
  const  authService  =  inject(AuthService);
  const  router  =  inject(Router);

  if(authService.isLoggedIn()) {
    return true;
  }
  return false;
};
