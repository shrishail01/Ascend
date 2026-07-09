import Dexie, { Table } from 'dexie';

export interface OfflineResumeDraft {
  id: string; // Mapped by resumeId or 'new'
  title: string;
  template: string;
  content: string;
  updatedAt: number;
}

/**
 * Dexie.js offline schema configuration for IndexedDB storage.
 */
export class AscendDexie extends Dexie {
  resumeDrafts!: Table<OfflineResumeDraft>;

  constructor() {
    super('AscendOfflineDB');
    this.version(1).stores({
      resumeDrafts: 'id, title, template, content, updatedAt'
    });
  }
}

export const db = new AscendDexie();
export default db;
