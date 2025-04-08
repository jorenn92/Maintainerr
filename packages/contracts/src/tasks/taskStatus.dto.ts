export class TaskStatusDto {
  time: Date
  running: boolean
  runningSince?: Date

  constructor(time: Date, running: boolean, runningSince?: Date) {
    this.time = time
    this.running = running
    this.runningSince = runningSince
  }
}
