import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vehicle } from '../interfaces/vehicle.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VehicleApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getVehiclesHttpRequest(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.baseUrl}/vehicles`);
  }

  addVehicleHttpRequest(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}/vehicles`, vehicle);
  }

  deleteVehicleHttpRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/vehicles/${id}`);
  }
}
