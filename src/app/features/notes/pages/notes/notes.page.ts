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

    if (!query) {
      return this.notes;
    }

    return this.notes.filter(note =>
      this.normalizeTerm(note.title)
        .includes(query) ||
      this.normalizeTerm(note.description)
        .includes(query)
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

}
