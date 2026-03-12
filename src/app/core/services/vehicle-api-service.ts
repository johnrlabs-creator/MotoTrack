import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vehicle } from '../models/vehicle.interface';

@Injectable({
  providedIn: 'root',
})
export class VehicleApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient
  ) {}

  getVehiclesRequest(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.baseUrl}/vehicles`);
  }

  addVehicleRequest(vehicle: Vehicle): Observable<Vehicle[]> {
    return this.http.post<Vehicle[]>(`${this.baseUrl}/vehicles`, vehicle);
  }
}
