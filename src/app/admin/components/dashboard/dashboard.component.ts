import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../admin-services/admin.service';
import { NzButtonSize } from 'ng-zorro-antd/button';
import Swal from 'sweetalert2';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  categories: any = [];
  validateForm!: FormGroup;
  size: NzButtonSize = 'large';
  isSpinning: boolean;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      title: [null, [Validators.required]],
    });
    this.getAllCategories();
  }

  submitForm() {
    this.isSpinning = true;
    this.categories = [];
    this.adminService
      .searchCategoryByTitle(this.validateForm.get(['title'])!.value)
      .subscribe((res) => {
        res.data.forEach((element) => {
          element.processedImg = 'data:image/jpeg;base64,' + element.img;
          this.categories.push(element);
          this.isSpinning = false;
        });
      });
  }

  getAllCategories() {
    this.categories = [];
    this.adminService.getAllCategories().subscribe((res) => {
      res.data.forEach((element) => {
        element.processedImg = 'data:image/jpeg;base64,' + element.img;
        this.categories.push(element);
      });
    });
  }

  deleteCategory(id: number) {
    Swal.fire({
      title: 'Are You?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#212529',
      cancelButtonColor: '#ffc107',
    }).then((result) => {
      if (result.value) {
        this.adminService.deleteCategory(id).subscribe((res) => {
          this.getAllCategories();
          this.message.success(`Category Deleted Successfully.`, {
            nzDuration: 5000,
          });
        });
      }
    });
  }
}
