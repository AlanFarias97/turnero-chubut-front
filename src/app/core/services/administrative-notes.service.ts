import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject
} from 'rxjs';

import {
  AdministrativeNote
} from '../models/administrative-note';

@Injectable({
  providedIn: 'root'
})
export class AdministrativeNotesService {

  private readonly storageKey =
    'turnero-chubut:administrative-notes:v1';

  private notesSubject =
    new BehaviorSubject<AdministrativeNote[]>(
      this.loadNotes()
    );

  notes$ =
    this.notesSubject.asObservable();

  getNotes(): AdministrativeNote[] {

    return this.cloneNotes(
      this.notesSubject.value
    );

  }

  createNote(
    entry: Pick<
      AdministrativeNote,
      'title' | 'description'
    >
  ): AdministrativeNote {

    const title =
      entry.title.trim();

    const description =
      entry.description.trim();

    if (!title || !description) {
      throw new Error(
        'Completa titulo y descripcion.'
      );
    }

    const notes =
      this.getNotes();

    const note: AdministrativeNote = {
      id: this.nextId(notes),
      createdAt: new Date(),
      title,
      description
    };

    notes.unshift(note);

    this.updateNotes(notes);

    return note;

  }

  private loadNotes(): AdministrativeNote[] {

    const rawNotes =
      localStorage.getItem(
        this.storageKey
      );

    if (!rawNotes) {
      return [];
    }

    try {

      return this.cloneNotes(
        JSON.parse(rawNotes)
      );

    } catch {

      localStorage.removeItem(
        this.storageKey
      );

      return [];

    }

  }

  private updateNotes(
    notes: AdministrativeNote[]
  ): void {

    const clone =
      this.cloneNotes(notes);

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(clone)
    );

    this.notesSubject.next(clone);

  }

  private cloneNotes(
    notes: AdministrativeNote[]
  ): AdministrativeNote[] {

    return notes.map(note => ({
      ...note,
      createdAt:
        new Date(note.createdAt)
    }));

  }

  private nextId(
    notes: AdministrativeNote[]
  ): number {

    return Math.max(
      0,
      ...notes.map(note => note.id)
    ) + 1;

  }

}
