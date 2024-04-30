import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../admin-services/admin.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.scss'],
})
export class UpdateProductComponent implements OnInit {
  productId: any = this.activatedroute.snapshot.params['productId'];
  isSpinning = false;
  validateForm!: FormGroup;
  imgChanged = false;
  selectedFile: any;
  imagePreview: string | ArrayBuffer | null = null;
  existingImage: string | null = null;

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
    this.getProductById();
  }

  getProductById() {
    this.adminService.getProductById(this.productId).subscribe((res) => {
      console.log(res);
      const productDto = res.data;
      this.existingImage = 'data:image/jpeg;base64,' + res.data.img;
      this.validateForm.patchValue(productDto);
    });
  }

  submitForm(): void {
    this.isSpinning = true;
    const formData: FormData = new FormData();
    if (this.imgChanged && this.selectedFile) {
      formData.append('img', this.selectedFile);
    }
    formData.append('namaBarang', this.validateForm.get('namaBarang').value);
    formData.append('hargaBarang', this.validateForm.get('hargaBarang').value);
    formData.append(
      'deskripsiBarang',
      this.validateForm.get('deskripsiBarang').value
    );
    console.log(formData);
    this.adminService.updateProduct(this.productId, formData).subscribe(
      (res) => {
        this.isSpinning = false;
        if (res.data != null) {
          this.message.success(`Product updated Successfully.`, {
            nzDuration: 5000,
          });
          this.router.navigateByUrl('/admin/dashboard');
        } else {
          this.notification.error('ERROR', `Something Error`, {
            nzDuration: 5000,
          });
        }
      },
      (error: HttpErrorResponse) => {
        console.log('error', error);
        if (error) {
          this.notification.error('ERROR', `${error.error.message}`, {
            nzDuration: 5000,
          });
        }
      }
    );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.previewImage();
    this.imgChanged = true;
    this.existingImage = null;
  }

  previewImage() {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }
}
