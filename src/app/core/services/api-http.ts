import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export abstract class ApiHttp {
  protected readonly http = inject(HttpClient);
  protected readonly base = '/api/v1';
  protected get<T>(url: string, params?: Record<string, string | boolean | number>) {
    return firstValueFrom(this.http.get<T>(this.base + url, { params }));
  }
  protected post<T>(url: string, data: object) { return firstValueFrom(this.http.post<T>(this.base + url, data)); }
  protected put<T>(url: string, data: object) { return firstValueFrom(this.http.put<T>(this.base + url, data)); }
  protected patch<T>(url: string, data: object) { return firstValueFrom(this.http.patch<T>(this.base + url, data)); }
  protected delete(url: string) { return firstValueFrom(this.http.delete(this.base + url)); }
}
