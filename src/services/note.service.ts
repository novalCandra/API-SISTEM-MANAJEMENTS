import { NotFoundError } from '../errors/AppError';
import type { INoteRepository } from '../repositories/interfaces';
import type { Note } from '../types/domain';
import { newId } from '../utils/id';

export interface NoteInput {
  title: string;
  content: string;
}

export class NoteService {
  constructor(private readonly notes: INoteRepository) {}

  async list(userId: string): Promise<Note[]> {
    return this.notes.findByUser(userId);
  }

  async create(userId: string, input: NoteInput): Promise<Note> {
    const now = new Date().toISOString();
    const note: Note = {
      id: newId(),
      userId,
      title: input.title.trim(),
      content: input.content.trim(),
      createdAt: now,
      updatedAt: now,
    };
    return this.notes.create(note);
  }

  async update(userId: string, id: string, input: Partial<NoteInput>): Promise<Note> {
    const updated = await this.notes.update(userId, id, {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.content !== undefined ? { content: input.content.trim() } : {}),
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    const removed = await this.notes.remove(userId, id);
    if (!removed) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
  }
}
