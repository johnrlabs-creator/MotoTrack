import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  OnDestroy,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleFormData } from '../../../core/interfaces/vehicle.interface';
import { steps } from '../../../core/constants/modal.constants';
import { FUEL_TYPES, VEHICLE_TYPES } from '../../../core/constants/vehicle.constants';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { FormField } from '../form-field/form-field';
import { LucideDynamicIcon, LucidePlus } from '@lucide/angular';

@Component({
  selector: 'app-add-vehicle-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    LucideDynamicIcon,
    LucidePlus,
  ],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnInit, OnDestroy {
  /** Emitted when the modal should be closed (cancel or successful save) */
  // @Output() closed = new EventEmitter<void>();

  // Signal based Output()
  closed = output<null>();

  /** Emitted with the completed form data when user clicks Save */
  // @Output() vehicleAdded = new EventEmitter<VehicleFormData>();
  vehicleAdded = output<VehicleFormData>();

  currentStep = 0;
  readonly steps = steps;
  readonly vehicleTypes = VEHICLE_TYPES;
  readonly fuelTypes = FUEL_TYPES;
  readonly currentYear = new Date().getFullYear();
  private destroyed$ = new Subject<void>();

  fb = inject(FormBuilder);
  vehicleForm: any;

  // Computed properties (TODO: DUMMY DATA)
  /** Returns oil change progress as a percentage, or null if inputs are incomplete */
  get oilChangeProgress(): number | null {
    const { mile, lastOilChangeMileage, oilChangeInterval } = this.vehicleForm.value.mileAge;
    if (!mile || !lastOilChangeMileage || !oilChangeInterval) return null;
    const driven = mile - lastOilChangeMileage;
    return (driven / oilChangeInterval) * 100;
  }

  /** Derives a status string based on mileage and service date proximity */
  get computedStatus(): 'ok' | 'warn' | 'bad' {
    const progress = this.oilChangeProgress;
    if (progress === null) return 'ok';
    if (progress > 100) return 'bad';
    if (progress > 75) return 'warn';
    return 'ok';
  }

  get computedStatusLabel(): string {
    const map = { ok: 'Good', warn: 'Due Soon', bad: 'Overdue' };
    return map[this.computedStatus];
  }

  ngOnInit(): void {
    this.initVehicleForm();
    this.listenToVehicleFormChanges();
  }

  private initVehicleForm(): void {
    this.vehicleForm = this.fb.group({
      identity: this.fb.group({
        nickName: ['', Validators.required],
        vehicleType: ['car', Validators.required],
        make: ['', Validators.required],
        model: ['', Validators.required],
        year: [0, Validators.required],
        plateNumber: ['', Validators.required],
        color: [''],
      }),
      mileAge: this.fb.group({
        mile: [0, [Validators.required, Validators.min(0)]],
        fuelType: ['gasoline', Validators.required],
        lastOilChangeMileage: [0, [Validators.required, Validators.min(0)]],
        oilChangeInterval: [5000, [Validators.required, Validators.min(0)]],
        lastServiceDate: [''],
        nextServiceDate: [''],
      }),
      review: this.fb.group({}),
    });
  }

  listenToVehicleFormChanges(): void {
    this.vehicleForm.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500), takeUntil(this.destroyed$))
      .subscribe((values: any) => {
        console.log('vehicleForm: ', values);
      });
  }

  setVehicleType(type: string): void {
    this.vehicleForm.get('identity.vehicleType')?.setValue(type);
  }

  // Step validation
  isStepValid(): boolean {
    if (this.currentStep === 0) {
      return this.vehicleForm.get('identity')?.valid;
    }
    if (this.currentStep === 1) {
      return this.vehicleForm.get('mileAge')?.valid;
    }
    return true;
  }

  // Navigation
  nextStep(): void {
    if (this.currentStep < this.steps.length - 1 && this.isStepValid()) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  // Helpers
  getTypeIcon(): string {
    return (
      VEHICLE_TYPES.find((t) => t.value === this.vehicleForm.get('identity.vehicleType')?.value)
        ?.icon ?? ''
    );
  }

  // Event handlers
  onClose(): void {
    this.closed.emit(null);
  }

  /** Close only if user clicked the dark backdrop itself, not the modal card */
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  onSubmit(): void {
    this.vehicleAdded.emit({ ...this.vehicleForm.value });
    this.closed.emit(null);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
