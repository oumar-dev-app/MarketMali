import { randomUUID } from "crypto";

import { NotificationRepository } from "../repositories/notification.repository";
import {
  Notification,
  NotificationCreate,
} from "../types/notification";

export class NotificationService {

  static async create(
    data: Omit<NotificationCreate, "uuid">
  ): Promise<number> {

    const uuid = randomUUID();

    return await NotificationRepository.create({
      uuid,
      ...data,
    });
  }

  static async findByUser(
    user_id: number,
    page: number = 1,
    limit: number = 20
  ): Promise<Notification[]> {

    const offset = (page - 1) * limit;

    return await NotificationRepository.findByUserId(
      user_id,
      limit,
      offset
    );
  }

  static async countUnread(
    user_id: number
  ): Promise<number> {

    return await NotificationRepository.countUnread(
      user_id
    );
  }

  static async markAsRead(
    uuid: string,
    user_id: number
  ): Promise<void> {

    const notification =
      await NotificationRepository.findByUUID(uuid);

    if (!notification) {
      throw new Error(
        "Notification introuvable."
      );
    }

    if (notification.user_id !== user_id) {
      throw new Error(
        "Vous n'avez pas accès à cette notification."
      );
    }

    await NotificationRepository.markAsRead(
      notification.id
    );
  }

  static async markAllAsRead(
    user_id: number
  ): Promise<void> {

    await NotificationRepository.markAllAsRead(
      user_id
    );
  }

}
