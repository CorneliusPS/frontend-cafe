import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../services/auth/auth.service';
import { UserStorageService } from '../services/storage/user-storage.service';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  validateForm!: FormGroup;
  isSpinning = false;

  submitForm(): void {
    this.isSpinning = true;
    this.authService
      .login(this.validateForm.value)
      .pipe(
        catchError((error) => {
          // Handle any errors that occur during login
          this.notification.error('ERROR', `Username Or Password is Wrong!`, {
            nzDuration: 5000,
          });
          this.isSpinning = false;
          // It is important to rethrow the error or return an observable that completes
          // to ensure the observable chain is correctly finalized
          throw error;
        })
      )
      .subscribe({
        next: (res) => {
          console.log(res.data.userId);
          console.log(res.data.akses.namaAkses);
          console.log(res.data.token);
          if (res.data.userId != null) {
            const user = {
              id: res.data.userId,
              role: res.data.akses.namaAkses,
            };
            console.log(user);
            UserStorageService.saveUser(user);
            UserStorageService.saveToken(res.data.token);
            if (UserStorageService.isAdminLoggedIn()) {
              this.router.navigateByUrl('admin/dashboard');
            } else if (UserStorageService.isCustomerLoggedIn()) {
              this.router.navigateByUrl('customer/dashboard');
            }
            this.notification.success('SUCCESS', `Welcome Buddy!`, {
              nzDuration: 5000,
            });
          } else {
            this.notification.error('ERROR', `Username or password failed!`, {
              nzDuration: 5000,
            });
          }
          this.isSpinning = false;
        },
        error: (err) => {
          // This block can be used for additional error logging if needed
          console.error('Unexpected error occurred:', err);
          this.isSpinning = false;
        },
      });
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NzNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
  }
}
