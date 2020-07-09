import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { equalValidator, randomInt } from 'src/app/shared';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass']
})
export class UserComponent implements OnInit {
  userForm!: FormGroup;
  submitted: boolean = false;
  saved: boolean = false;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.submitted = true;
    if (!this.userForm.valid) {
      return;
    }
  }

  resetValues(): void {
    this.userForm.patchValue({
      email: '',
      name: '',
      password: '',
      confirmPassword: ''
    });
    this.userForm.markAsPristine();
  }

  private createForm(): void {
    this.userForm = this.fb.group({
      avatar: [`/assets/images/avatars/avatar_${randomInt(1, 30)}.svg`, [Validators.required]],
      email: [null, [Validators.required]],
      name: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      confirmPassword: [null]
    });

    this.userForm.controls.confirmPassword.setValidators([
      Validators.required,
      Validators.minLength(8),
      equalValidator(this.userForm.controls.password)
    ]);
  }
}
