export interface IAddModal {
  onCancel: () => void
  onSubmit: () => void
  libraryId?: number
  type?: number
  plexId: number
  modalType: 'add' | 'exclude'
}
