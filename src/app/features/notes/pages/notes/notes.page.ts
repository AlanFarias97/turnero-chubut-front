import {
  CommonModule
} from '@angular/common';

import {
  Component,
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

  notes: AdministrativeNote[] = [];

  searchTerm = '';

  dateFrom = '';

  dateTo = '';

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
