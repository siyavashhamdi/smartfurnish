import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { UserRole, UserStatus } from "../../enums";
import {
  Session,
  SessionDocument,
  User,
  UserDocument,
} from "../../database/schemas";

export type AnonymousUserExpiryRunResult = {
  deactivatedCount: number;
};

@Injectable()
export class AnonymousUserExpiryService {
  private readonly logger = new Logger(AnonymousUserExpiryService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async deactivateExpiredAnonymousUsers(): Promise<AnonymousUserExpiryRunResult> {
    const now = new Date();

    const usersToDeactivate = await this.userModel.aggregate<{
      _id: Types.ObjectId;
    }>([
      {
        $match: {
          roles: UserRole.ANONYMOUS,
          status: UserStatus.ACTIVE,
        },
      },
      {
        $lookup: {
          from: this.sessionModel.collection.collectionName,
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { expiresAt: 1 } },
          ],
          as: "lastSession",
        },
      },
      {
        $match: {
          $or: [
            { lastSession: { $size: 0 } },
            { "lastSession.0.expiresAt": { $lt: now } },
          ],
        },
      },
      { $project: { _id: 1 } },
    ]);

    if (!usersToDeactivate.length) {
      this.logger.log(
        "Anonymous user expiry: no active anonymous users with expired last session",
      );
      return { deactivatedCount: 0 };
    }

    const userIds = usersToDeactivate.map((user) => user._id);
    const updateResult = await this.userModel.updateMany(
      {
        _id: { $in: userIds },
        roles: UserRole.ANONYMOUS,
        status: UserStatus.ACTIVE,
      },
      { status: UserStatus.DEACTIVE },
    );

    const deactivatedCount = updateResult.modifiedCount;
    this.logger.log(
      `Anonymous user expiry: deactivated ${deactivatedCount} anonymous user(s)`,
    );

    return { deactivatedCount };
  }
}
