import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { AdminService } from '../../admin-services/admin.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { catchError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-view-reservation-requests',
  templateUrl: './view-reservation-requests.component.html',
  styleUrls: ['./view-reservation-requests.component.scss'],
})
export class ViewReservationRequestsComponent implements OnInit {
  pageIndex = 1;
  reservations: any;
  size: NzButtonSize = 'large';
  validateForm!: FormGroup;
  isSpinning: boolean = false;
  page: number = 0;
  pageSize: number = 5;
  total: number = 0;
  totalPages: number = 0;
  search = '';
  sort = {
    key: 'idReservation',
    order: 'asc',
  };

  constructor(
    private adminService: AdminService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadData(this.page, this.sort.key, this.sort.order);
  }

  loadData(
    page: number,
    sortBy: string,
    sortOrder: string,
    filterBy?: string,
    value?: string
  ) {
    this.adminService
      .getAllReservationsRequest(
        page,
        sortOrder,
        sortBy,
        filterBy,
        value,
        this.pageSize.toString()
      )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.isSpinning = false;
          this.message.error(err.error.message);
          return err.error.message;
        })
      )
      .subscribe((res) => {
        this.reservations = res.data.content;
        this.total = res.data.totalItems;
        this.totalPages = res.data.totalPages;
        this.isSpinning = false;
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = currentSort ? currentSort.key : this.sort.key;
    const sortOrder = currentSort ? currentSort.value : this.sort.order;
    console.log(sortOrder);

    this.page = pageIndex - 1;
    this.pageSize = pageSize;

    let filterBy = '';
    let value = '';
    if (this.search.trim() !== '') {
      filterBy = 'idReservation';
      value = this.search;
    }

    // Update sorting state for toggle functionality
    if (sortField !== this.sort.key) {
      this.sort.key = sortField;
      this.sort.order = 'asc';
    } else {
      this.sort.order = sortOrder === 'ascend' ? 'asc' : 'desc';
    }

    this.loadData(this.page, this.sort.key, this.sort.order, filterBy, value);
  }

  changeReservationStatus(reservationId: number, status: string) {
    this.isSpinning = true;
    this.adminService.changeReservationStatus(reservationId, status).subscribe({
      next: (res) => {
        if (res.data && res.data.idReservation) {
          this.loadData(this.page, this.sort.key, this.sort.order);
          this.message.success('Reservation status changed successfully.', {
            nzDuration: 5000,
          });
        } else {
          this.message.error(res.message, { nzDuration: 5000 });
        }
        this.isSpinning = false;
      },
      error: () => {
        this.message.error('Failed to change reservation status', {
          nzDuration: 3000,
        });
        this.isSpinning = false;
      },
    });
  }
}
