import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const API_BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${API_BASE}/${path}`);
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${API_BASE}/${path}`, body);
  }

  put<T>(path: string, id: number, body: any): Observable<T> {
    return this.http.put<T>(`${API_BASE}/${path}/${id}`, body);
  }

  patch<T>(path: string, id: number, body: any): Observable<T> {
    return this.http.patch<T>(`${API_BASE}/${path}/${id}`, body);
  }

  delete<T>(path: string, id: number): Observable<T> {
    return this.http.delete<T>(`${API_BASE}/${path}/${id}`);
  }
}
