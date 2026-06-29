import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs/operators';
import { empty } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private webService: WebRequestService, private router: Router, private http: HttpClient) { }

  login(email: string, password: string) {
    return this.webService.login(email, password).pipe(
        shareReplay(),
        tap((res: HttpResponse<any>) => {
            const accessToken = res.headers.get('x-access-token');
            if (accessToken !== null) {
                const refreshToken = res.headers.get('x-refresh-token') || '';
                // Assuming _id is always present in the response body
                const userId = res.body._id;
                
                // Proceed with setting the session
                this.setSession(userId, accessToken, refreshToken);
                console.log("Successfully logged in!");
            } else {
                console.error("x-access-token header is missing.");
                // Handle the case when x-access-token header is missing
            }
        })
    );
}

signup(email: string, password: string) {
  return this.webService.signup(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
          const accessToken = res.headers.get('x-access-token');
          if (accessToken !== null) {
              const refreshToken = res.headers.get('x-refresh-token') || '';
              // Assuming _id is always present in the response body
              const userId = res.body._id;
              
              // Proceed with setting the session
              this.setSession(userId, accessToken, refreshToken);
              console.log("Successfully signed up and now logged in!");
          } else {
              console.error("x-access-token header is missing.");
              // Handle the case when x-access-token header is missing
          }
      })
  );
}

  logout() {
    this.removeSession();
    this.router.navigate(['/login']);
  }

  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }

  getUserId() {
    return localStorage.getItem('user-id');
  }


  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken)
  }

  private setSession(userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('user-id', userId);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
  }

  private removeSession() {
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  getNewAccessToken() {
    const userId = this.getUserId();
    const refreshToken = this.getRefreshToken();
    
    if (userId && refreshToken) {
      return this.http.get(`${this.webService.ROOT_URL}/users/me/access-token`, {
        headers: {
          'x-refresh-token': refreshToken,
          '_id': userId as string // Explicitly cast userId as string
        },
        observe: 'response' // Ensure to observe the full response
      }).pipe(
        tap((res) => {
          const accessToken = res.headers.get('x-access-token');
          if (accessToken) {
            // Set the new access token if available
            this.setAccessToken(accessToken);
          }
        })
      );
    } else {
      // Handle case when userId or refreshToken is missing
      console.error("User ID or refresh token is missing.");
      // Return an observable that emits nothing (or handle it appropriately based on your application logic)
      return empty(); // Assuming EMPTY is imported from RxJS
    }
  }
}







