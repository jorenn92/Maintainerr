import { BaseEventDto } from './baseEvent.dto'
import { MaintainerrEvent } from './maintainerrEvent'

export class RuleHandlerStartedEventDto extends BaseEventDto {
  message: string

  constructor(message: string) {
    super(MaintainerrEvent.RuleHandler_Started)
    this.message = message
  }
}

export class RuleHandlerProgressEventDto extends BaseEventDto {
  totalRuleGroups: number
  totalEvaluations: number
  processingRuleGroup:
    | {
        number: number
        name: string
        processedEvaluations: number
        totalEvaluations: number
      }
    | undefined
  processedEvaluations: number

  constructor() {
    super(MaintainerrEvent.RuleHandler_Progress)
    this.totalRuleGroups = 0
    this.processingRuleGroup = undefined
    this.totalEvaluations = 0
    this.processedEvaluations = 0
  }
}

export class RuleHandlerFinishedEventDto extends BaseEventDto {
  message: string

  constructor(message: string) {
    super(MaintainerrEvent.RuleHandler_Finished)
    this.message = message
  }
}
