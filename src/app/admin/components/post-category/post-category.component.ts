import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../admin-services/admin.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-post-category',
  templateUrl: './post-category.component.html',
  styleUrls: ['./post-category.component.scss'],
})
export class PostCategoryComponent implements OnInit {
  validateForm!: FormGroup;
  isSpinning = false;
  selectedFile: File | null;
  imagePreview: string | ArrayBuffer | null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private adminService: AdminService,
    private message: NzMessageService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      namaKategori: [null, [Validators.required]],
      deskripsiKategori: [null, [Validators.required]],
    });
  }

  submitForm(): void {
    console.log(this.validateForm.valid);
    console.log(this.validateForm);
    console.log(this.validateForm.value);
    if (this.validateForm.valid) {
      console.log('In function');
      this.isSpinning = true;
      const formData: FormData = new FormData();
      formData.append('img', this.selectedFile);
      formData.append(
        'namaKategori',
        this.validateForm.get('namaKategori').value
      );
      formData.append(
        'deskripsiKategori',
        this.validateForm.get('deskripsiKategori').value
      );
      console.log(formData);
      this.adminService.addCategory(formData).subscribe(
        (res) => {
          this.isSpinning = false;
          if (res.data != null) {
            this.notification.success(
              'SUCCESS',
              `Category Posted Successfully!!!`,
              { nzDuration: 5000 }
            );
            this.router.navigateByUrl('/admin/dashboard');
          }
          //jika error
          else {
            this.notification.error('ERROR', `Something Error`, {
              nzDuration: 5000,
            });
          }
        },
        (error) => {
          console.log('error', error);
          if (error) {
            this.notification.error('ERROR', `${error.error.message}`, {
              nzDuration: 5000,
            });
          }
          this.isSpinning = false;
        }
      );
    } else {
      for (const i in this.validateForm.controls) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.previewImage();
  }

  previewImage() {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }
}
