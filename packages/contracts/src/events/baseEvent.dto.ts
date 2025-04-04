import { MaintainerrEvent } from './maintainerrEvent'

export class BaseEventDto {
  type: MaintainerrEvent
  time: Date

  constructor(type: MaintainerrEvent) {
    this.type = type
    this.time = new Date()
  }
}
