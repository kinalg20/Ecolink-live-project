import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }
  user_detail: any;
  email_token: any;
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (localStorage.getItem('ecolink_user_credential')) {
      this.user_detail = localStorage.getItem('ecolink_user_credential');
      let detail = JSON.parse(this.user_detail);
      if (detail.user.flag == 0) {
        return true;
      }

      else {
        localStorage.removeItem('ecolink_user_credential')
        this.router.navigateByUrl("/profile/auth");
        return false;
      }
    }
    else {
      this.router.navigateByUrl('/profile/auth');
      localStorage.removeItem('ecolink_user_credential')
      return false;
    }
  }


}