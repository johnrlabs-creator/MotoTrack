import { Component, computed, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  imports: [],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormField {
  label = input.required<string>();
  control = input.required<AbstractControl>();

  isRequired = computed(() => {
    const v = this.control().validator?.({} as AbstractControl);
    return !!v?.['required'];
  });
}
