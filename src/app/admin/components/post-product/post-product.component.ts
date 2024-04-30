import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../admin-services/admin.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-post-product',
  templateUrl: './post-product.component.html',
  styleUrls: ['./post-product.component.scss'],
})
export class PostProductComponent implements OnInit {
  categoryId: any = this.activatedroute.snapshot.params['categoryId'];
  validateForm!: FormGroup;
  selectedFile: File | null;
  imagePreview: string | ArrayBuffer | null;
  isSpinning = false;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private adminService: AdminService,
    private activatedroute: ActivatedRoute,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      namaBarang: [null, [Validators.required]],
      hargaBarang: [null, [Validators.required]],
      deskripsiBarang: [null, [Validators.required]],
    });
  }

  submitForm() {
    this.isSpinning = true;
    const formData: FormData = new FormData();
    formData.append('img', this.selectedFile);
    formData.append('namaBarang', this.validateForm.get('namaBarang').value);
    formData.append('hargaBarang', this.validateForm.get('hargaBarang').value);
    formData.append(
      'deskripsiBarang',
      this.validateForm.get('deskripsiBarang').value
    );
    console.log(formData);
    this.adminService
      .addProduct(this.categoryId, formData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.isSpinning = false;
          if (error.error.status = 400){
            this.notification.error('ERROR', error.error.message, {
              nzDuration: 5000,
            })

          }
          console.log(error);
          return throwError(() => new Error(error.error.message));
        })
      )
      .subscribe((res) => {
        if (res.data != null) {
          this.message.success(`Product Posted Successfully.`, {
            nzDuration: 5000,
          });
          this.router.navigateByUrl('/admin/dashboard');
        } else {
          this.notification.error('ERROR', 'Something went wrong', {
            nzDuration: 5000,
          });
        }

        this.isSpinning = false;
      });
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
