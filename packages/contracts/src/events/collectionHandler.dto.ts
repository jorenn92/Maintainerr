import { BaseEventDto } from './baseEvent.dto'
import { MaintainerrEvent } from './maintainerrEvent'

export class CollectionHandlerStartedEventDto extends BaseEventDto {
  message: string

  constructor(message: string) {
    super(MaintainerrEvent.CollectionHandler_Started)
    this.message = message
  }
}

export class CollectionHandlerProgressedEventDto extends BaseEventDto {
  totalCollections: number
  processingCollection:
    | {
        processedMedias: number
        name: string
        totalMedias: number
      }
    | undefined
  totalMediaToHandle: number
  processedMedias: number
  processedCollections: number

  constructor() {
    super(MaintainerrEvent.CollectionHandler_Progressed)
    this.totalCollections = 0
    this.processingCollection = undefined
    this.totalMediaToHandle = 0
    this.processedMedias = 0
    this.processedCollections = 0
  }
}

export class CollectionHandlerFinishedEventDto extends BaseEventDto {
  message: string

  constructor(message: string) {
    super(MaintainerrEvent.CollectionHandler_Finished)
    this.message = message
  }
}
