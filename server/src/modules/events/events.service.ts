import { MaintainerrEvent } from '@maintainerr/contracts';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  CollectionMediaAddedDto,
  CollectionMediaHandledDto,
  CollectionMediaRemovedDto,
  RuleHandlerFailedDto,
} from './events.dto';
import { NotificationType } from '../notifications/notifications-interfaces';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnEvent(MaintainerrEvent.RuleHandler_Failed)
  private async ruleHandlerFailed(data: RuleHandlerFailedDto) {
    // emit notification
    this.eventEmitter.emit(
      MaintainerrEvent.Notifications_Fire,
      NotificationType.RULE_HANDLING_FAILED,
      undefined,
      data?.collectionName,
      undefined,
      undefined,
      data?.identifier,
    );
  }

  @OnEvent(MaintainerrEvent.CollectionHandler_Failed)
  private async collectionHandlerFailed() {
    // emit notification
    this.eventEmitter.emit(
      MaintainerrEvent.Notifications_Fire,
      NotificationType.COLLECTION_HANDLING_FAILED,
    );
  }

  @OnEvent(MaintainerrEvent.CollectionMedia_Added)
  private async collectionMediaAdded(data: CollectionMediaAddedDto) {
    // emit notification
    this.eventEmitter.emit(
      MaintainerrEvent.Notifications_Fire,
      NotificationType.MEDIA_ADDED_TO_COLLECTION,
      data.mediaItems,
      data.collectionName,
      data.dayAmount,
      undefined,
      data.identifier,
    );
  }

  @OnEvent(MaintainerrEvent.CollectionMedia_Removed)
  private async collectionMediaRemoved(data: CollectionMediaRemovedDto) {
    // emit notification
    this.eventEmitter.emit(
      MaintainerrEvent.Notifications_Fire,
      NotificationType.MEDIA_REMOVED_FROM_COLLECTION,
      data.mediaItems,
      data.collectionName,
      undefined,
      undefined,
      data.identifier,
    );
  }

  @OnEvent(MaintainerrEvent.CollectionMedia_Handled)
  private async collectionMediaHandled(data: CollectionMediaHandledDto) {
    // emit notification
    this.eventEmitter.emit(
      MaintainerrEvent.Notifications_Fire,
      NotificationType.MEDIA_HANDLED,
      data.mediaItems,
      data.collectionName,
      undefined,
      undefined,
      data.identifier,
    );
  }
}
