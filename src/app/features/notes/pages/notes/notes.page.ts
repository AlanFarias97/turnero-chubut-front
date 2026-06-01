import {
  CommonModule
} from '@angular/common';

import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  IonContent
} from '@ionic/angular/standalone';

import {
  AdministrativeNote
} from 'src/app/core/models/administrative-note';

import {
  AdministrativeNotesService
} from 'src/app/core/services/administrative-notes.service';

interface CalendarDay {

  dateString: string;

  day: number;

  currentMonth: boolean;

  selected: boolean;

  inRange: boolean;

  today: boolean;

}

@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    RouterLink
  ]
})
export class NotesPage implements OnInit {

  private notesService =
    inject(AdministrativeNotesService);

  private elementRef =
    inject(ElementRef<HTMLElement>);

  notes: AdministrativeNote[] = [];

  searchTerm = '';

  dateFrom = '';

  dateTo = '';

  showCalendar = false;

  calendarMonth =
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

  readonly calendarWeekDays = [
    'L',
    'M',
    'M',
    'J',
    'V',
    'S',
    'D'
  ];

  showForm = false;

  draft = this.emptyDraft();

  formError = '';

  ngOnInit(): void {

    this.notesService
      .notes$
      .subscribe(notes => {

        this.notes = notes;

      });

  }

  @HostListener(
    'document:click',
    ['$event']
  )
  closeCalendarWhenClickingOutside(
    event: MouseEvent
  ): void {

    if (!this.showCalendar) {
      return;
    }

    const target =
      event.target as HTMLElement | null;

    if (
      target?.closest('.date-picker') &&
      this.elementRef.nativeElement
        .contains(target)
    ) {
      return;
    }

    this.showCalendar = false;

  }

  @HostListener('document:keydown.escape')
  closeCalendarOnEscape(): void {

    this.showCalendar = false;

  }

  get filteredNotes(): AdministrativeNote[] {

    const query =
      this.normalizeTerm(
        this.searchTerm
      );

    return this.notes.filter(note =>
      this.matchesTextFilter(
        note,
        query
      ) &&
      this.matchesDateFilter(note)
    );

  }

  get hasActiveFilters(): boolean {

    return !!(
      this.searchTerm.trim() ||
      this.dateFrom ||
      this.dateTo
    );

  }

  get calendarTitle(): string {

    return this.calendarMonth
      .toLocaleDateString(
        'es-AR',
        {
          month: 'long',
          year: 'numeric'
        }
      );

  }

  get calendarDays(): CalendarDay[] {

    const firstDay =
      new Date(
        this.calendarMonth.getFullYear(),
        this.calendarMonth.getMonth(),
        1
      );

    const mondayOffset =
      (
        firstDay.getDay() + 6
      ) % 7;

    const startDate =
      new Date(firstDay);

    startDate.setDate(
      firstDay.getDate() -
        mondayOffset
    );

    return Array.from(
      {
        length: 42
      },
      (_, index) => {

        const date =
          new Date(startDate);

        date.setDate(
          startDate.getDate() +
            index
        );

        const dateString =
          this.toDateInputValue(date);

        return {
          dateString,
          day: date.getDate(),
          currentMonth:
            date.getMonth() ===
            this.calendarMonth.getMonth(),
          selected:
            dateString === this.dateFrom ||
            dateString === this.dateTo,
          inRange:
            this.isDateInsideRange(
              dateString
            ),
          today:
            dateString ===
            this.toDateInputValue(
              new Date()
            )
        };

      }
    );

  }

  get dateRangeLabel(): string {

    if (
      this.dateFrom &&
      this.dateTo
    ) {
      return `${this.formatShortDate(this.dateFrom)} - ${this.formatShortDate(this.dateTo)}`;
    }

    if (this.dateFrom) {
      return `Desde ${this.formatShortDate(this.dateFrom)}`;
    }

    if (this.dateTo) {
      return `Hasta ${this.formatShortDate(this.dateTo)}`;
    }

    return 'Seleccionar fecha';

  }

  openForm(): void {

    this.draft =
      this.emptyDraft();

    this.formError = '';

    this.showForm = true;

  }

  closeForm(): void {

    this.showForm = false;

    this.formError = '';

    this.draft =
      this.emptyDraft();

  }

  saveNote(): void {

    try {

      this.notesService.createNote(
        this.draft
      );

      this.closeForm();

    } catch (error) {

      this.formError =
        error instanceof Error
          ? error.message
          : 'No se pudo crear la nota.';

    }

  }

  formatDate(
    value: Date
  ): string {

    return new Date(value)
      .toLocaleDateString(
        'es-AR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      );

  }

  trackByNote(
    _: number,
    note: AdministrativeNote
  ): number {

    return note.id;

  }

  trackByCalendarDay(
    _: number,
    day: CalendarDay
  ): string {

    return day.dateString;

  }

  toggleCalendar(): void {

    this.showCalendar =
      !this.showCalendar;

  }

  previousCalendarMonth(): void {

    this.calendarMonth =
      new Date(
        this.calendarMonth.getFullYear(),
        this.calendarMonth.getMonth() - 1,
        1
      );

  }

  nextCalendarMonth(): void {

    this.calendarMonth =
      new Date(
        this.calendarMonth.getFullYear(),
        this.calendarMonth.getMonth() + 1,
        1
      );

  }

  selectCalendarDay(
    day: CalendarDay
  ): void {

    if (
      !this.dateFrom ||
      (
        this.dateFrom &&
        this.dateTo
      )
    ) {

      this.dateFrom =
        day.dateString;

      this.dateTo = '';

      return;

    }

    if (
      day.dateString <
      this.dateFrom
    ) {

      this.dateTo =
        this.dateFrom;

      this.dateFrom =
        day.dateString;

      this.showCalendar = false;

      return;

    }

    this.dateTo =
      day.dateString;

    this.showCalendar = false;

  }

  private emptyDraft(): Pick<
    AdministrativeNote,
    'title' | 'description'
  > {

    return {
      title: '',
      description: ''
    };

  }

  private normalizeTerm(
    value: string
  ): string {

    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  }

  clearFilters(): void {

    this.searchTerm = '';

    this.dateFrom = '';

    this.dateTo = '';

    this.showCalendar = false;

  }

  private isDateInsideRange(
    dateString: string
  ): boolean {

    if (
      !this.dateFrom ||
      !this.dateTo
    ) {
      return false;
    }

    return (
      dateString > this.dateFrom &&
      dateString < this.dateTo
    );

  }

  private toDateInputValue(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

  private formatShortDate(
    value: string
  ): string {

    const date =
      this.startOfDate(value);

    return date.toLocaleDateString(
      'es-AR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );

  }

  private matchesTextFilter(
    note: AdministrativeNote,
    query: string
  ): boolean {

    if (!query) {
      return true;
    }

    return (
      this.normalizeTerm(note.title)
        .includes(query) ||
      this.normalizeTerm(note.description)
        .includes(query)
    );

  }

  private matchesDateFilter(
    note: AdministrativeNote
  ): boolean {

    const noteTime =
      new Date(note.createdAt)
        .getTime();

    const fromTime =
      this.dateFrom
        ? this.startOfDate(
            this.dateFrom
          ).getTime()
        : null;

    const toTime =
      this.dateTo
        ? this.endOfDate(
            this.dateTo
          ).getTime()
        : null;

    if (
      fromTime !== null &&
      noteTime < fromTime
    ) {
      return false;
    }

    if (
      toTime !== null &&
      noteTime > toTime
    ) {
      return false;
    }

    return true;

  }

  private startOfDate(
    value: string
  ): Date {

    const [
      year,
      month,
      day
    ] = value
      .split('-')
      .map(Number);

    return new Date(
      year,
      month - 1,
      day,
      0,
      0,
      0,
      0
    );

  }

  private endOfDate(
    value: string
  ): Date {

    const [
      year,
      month,
      day
    ] = value
      .split('-')
      .map(Number);

    return new Date(
      year,
      month - 1,
      day,
      23,
      59,
      59,
      999
    );

  }

}
