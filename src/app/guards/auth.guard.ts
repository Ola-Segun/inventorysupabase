import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check localStorage for user
    const user = localStorage.getItem('user');
    if (user) {
      return true;
    }
    // Redirect to auth page
    this.router.navigate(['/auth']);
    return false;
  }
}