export interface ICollection {
  id?: number;
  plexId?: number;
  libraryId: number;
  title: string;
  description?: string;
  isActive: boolean;
  visibleOnHome?: boolean;
  deleteAfterDays?: number; // amount of days after add
}
