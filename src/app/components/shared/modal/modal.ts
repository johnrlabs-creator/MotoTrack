import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  animateChild,
} from '@angular/animations';
import { VehicleFormData } from '../../../core/models/vehicle.interface';

// ── Animations ────────────────────────────────────────────────────────────

const backdropAnim = trigger('backdropAnim', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('180ms ease', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('150ms ease', style({ opacity: 0 })),
  ]),
]);

const modalAnim = trigger('modalAnim', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(24px) scale(0.97)' }),
    animate('240ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
  ]),
  transition(':leave', [
    animate('160ms ease', style({ opacity: 0, transform: 'translateY(12px) scale(0.98)' })),
  ]),
]);

const stepAnim = trigger('stepAnim', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(16px)' }),
    animate('220ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
]);

// ── Component ─────────────────────────────────────────────────────────────

@Component({
  selector: 'app-add-vehicle-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [backdropAnim, modalAnim, stepAnim],
})
export class ModalComponent {

  /** Emitted when the modal should be closed (cancel or successful save) */
  @Output() closed = new EventEmitter<void>();

  /** Emitted with the completed form data when user clicks Save */
  @Output() vehicleAdded = new EventEmitter<VehicleFormData>();

  // ── Step state ────────────────────────────────────────────────────────────
  currentStep = 0;
  readonly steps = ['Identity', 'Mileage', 'Review'];

  // ── Vehicle type options ──────────────────────────────────────────────────
  readonly vehicleTypes = [
    { value: 'car',        label: 'Car',     icon: '🚗' },
    { value: 'suv',        label: 'SUV',     icon: '🚙' },
    { value: 'van',        label: 'Van',     icon: '🚐' },
    { value: 'truck',      label: 'Truck',   icon: '🛻' },
    { value: 'motorcycle', label: 'Moto',    icon: '🏍' },
  ];

  readonly currentYear = new Date().getFullYear();

  // ── Form data ─────────────────────────────────────────────────────────────
  form: VehicleFormData = {
    nickname:             '',
    type:                 '',
    make:                 '',
    model:                '',
    year:                 null,
    plate:                '',
    color:                '',
    mileage:              0,
    fuelType:             '',
    lastOilChangeMileage: 0,
    oilChangeInterval:    5000,
    lastServiceDate:      '',
    nextServiceDate:      '',
  };

  // ── Computed properties ───────────────────────────────────────────────────

  /** Returns oil change progress as a percentage, or null if inputs are incomplete */
  get oilChangeProgress(): number | null {
    const { mileage, lastOilChangeMileage, oilChangeInterval } = this.form;
    if (!mileage || !lastOilChangeMileage || !oilChangeInterval) return null;
    const driven = mileage - lastOilChangeMileage;
    return (driven / oilChangeInterval) * 100;
  }

  /** Derives a status string based on mileage and service date proximity */
  get computedStatus(): 'ok' | 'warn' | 'bad' {
    const progress = this.oilChangeProgress;
    if (progress === null) return 'ok';
    if (progress > 100) return 'bad';
    if (progress > 75)  return 'warn';
    return 'ok';
  }

  get computedStatusLabel(): string {
    const map = { ok: 'Good', warn: 'Due Soon', bad: 'Overdue' };
    return map[this.computedStatus];
  }

  // ── Step validation ───────────────────────────────────────────────────────

  isStepValid(): boolean {
    if (this.currentStep === 0) {
      return !!(this.form.make && this.form.model && this.form.year && this.form.plate);
    }
    if (this.currentStep === 1) {
      return this.form.mileage > 0;
    }
    return true;
  }

  // ── Navigation ────────────────────────────────────────────────────────────

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

  // ── Helpers ───────────────────────────────────────────────────────────────

  getTypeIcon(): string {
    return this.vehicleTypes.find(t => t.value === this.form.type)?.icon ?? '';
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  onClose(): void {
    this.closed.emit();
  }

  /** Close only if user clicked the dark backdrop itself, not the modal card */
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  onSubmit(): void {
    this.vehicleAdded.emit({ ...this.form });
    this.closed.emit();
  }
}