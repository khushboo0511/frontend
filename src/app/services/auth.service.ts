import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginItem } from '../models/login-item.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = 'http://localhost:3000/api/auth';
  formUrl = `http://localhost:3000/api/form`

  constructor(private http: HttpClient) {}

  login(data: { username: string; password: string }) {
    return this.http.post<{ token: string; user: { id: string; username: string; name: string } }>(
      `${this.url}/login`,
      data
    ).pipe(
      tap((response) => {
        localStorage.setItem('authToken', response.token);
      })
    );
  }

  register(data: { username: string; password: string }) {
    return this.http.post<{ userId: number }>(
      `${this.url}/register`,
      data
    ).pipe(
      tap((response) => {
        console.log('User registered:', response);
      })
    );
  }

  logout() {
    localStorage.removeItem('authUser');
  }

  isLoggedIn() {
    return localStorage.getItem('authUser') !== null;
  }

  getAllFormData(): Observable<any> {
    return this.http.get(`${this.formUrl}/data`);
  }
 
  submitForm(data: any): Observable<any> {
    return this.http.post(`${this.formUrl}/submit`, data);
  }

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.formUrl}/formData/countries`);
  }
  
  getStates(country: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.formUrl}/formData/states?country=${country}`);
  }
  
  getCities(state: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.formUrl}/formData/cities?state=${state}`);
  }

  getTemperature(city: string): Observable<any> {
    return this.http.get<any>(`${this.formUrl}/formData/temperature?city=${city}`);
  }
  // In AuthService (or api service)

getAllCitiesTemperature(): Observable<any[]> {
  return this.http.get<any[]>('${this.formUrl}/formData/temperatures'); 
}
}
