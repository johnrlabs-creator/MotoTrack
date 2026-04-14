import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Vehicle } from '../interfaces/vehicle.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VehicleApiService {
  private baseUrl = environment.apiUrl;
  private useMockApi = environment.useMockApi;
  private mockDeletedVehicleId: number[] = []; // Store the last deleted vehicle for mock deletion

  constructor(private http: HttpClient) {}

  getVehiclesHttpRequest(): Observable<Vehicle[]> {
    if (this.useMockApi) {
      // Return mock data
      return this.http.get<{ vehicles: Vehicle[] }>('assets/mock/vehicles.json').pipe(
        map((data) =>
          data.vehicles.filter((vehicle) => !this.mockDeletedVehicleId.includes(vehicle.id)),
        ), // Simulate deletion in mock mode,
      );
    }

    return this.http.get<Vehicle[]>(`${this.baseUrl}/vehicles`);
  }

  addVehicleHttpRequest(vehicle: Vehicle): Observable<Vehicle> {
    if (this.useMockApi) {
      // Return mock data
      return of(vehicle);
    }

    return this.http.post<Vehicle>(`${this.baseUrl}/vehicles`, vehicle);
  }

  deleteVehicleHttpRequest(id: number): Observable<void> {
    if (this.useMockApi) {
      // Simulate deletion in mock mode
      this.mockDeletedVehicleId.push(id); // Store the deleted vehicle ID to simulate deletion in subsequent calls
      return of(undefined);
    }
    return this.http.delete<void>(`${this.baseUrl}/vehicles/${id}`);
  }
}
