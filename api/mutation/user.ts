import { Context } from 'graphql-yoga/dist/types';

import { prisma, User, UserUpdateInput, UserWhereUniqueInput } from '../model';
import group, { PermissionTypePayload, RelationPayload } from '../auth/group';
import log from '../util/log';
import auth from '../auth';
import overWrite from '../util/overwrite';

const userMutation = {
  async verifyUser(_: any, args: any, context: Context): Promise<User> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_U00F'
        });
      }

      return user;
    } catch (error) {
      // Write Log
      if (!/#ERR_/.test(error.message)) {
        throw await log.error({
          ip: context.request.ip,
          code: '#ERR_FFFF',
          customResult: error.message
        });
      }

      throw new Error(error.message);
    }
  },

  async updateUser(_: any, args: { data: UserUpdateInput, where: UserWhereUniqueInput }, context: Context): Promise<User> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const targetUser: User = await prisma.user(args.where);

      if (!targetUser) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_U001',
          userId: user.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'user');
      const relation: RelationPayload = await group.relation.$check(user, targetUser.id, 'user');

      if (!(permission.anyone.write || (permission.group.write && relation.isMember) || (permission.owner.write && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      // Force overwrite user connect to prevent fake identity
      args.data.avatar = overWrite.image.updateOne(args.data.avatar, user);

      const userUpdated: User = await prisma.updateUser({ ...args });

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `User ${targetUser.email} updated by ${user.displayName}.`,
        userId: user.id
      });

      return userUpdated;
    } catch (error) {
      // Write Log
      if (!/#ERR_/.test(error.message)) {
        throw await log.error({
          ip: context.request.ip,
          code: '#ERR_FFFF',
          customResult: error.message
        });
      }

      throw new Error(error.message);
    }
  },

  async deleteUser(_: any, args: { where: UserWhereUniqueInput }, context: Context): Promise<User> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const targetUser: User = await prisma.user(args.where);

      if (!targetUser) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_P001',
          userId: user.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'user');
      const relation: RelationPayload = await group.relation.$check(user, targetUser.id, 'user');

      if (!(permission.anyone.delete || (permission.group.delete && relation.isMember) || (permission.owner.delete && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      const userDeleted: User = await prisma.deleteUser(args.where);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `User ${targetUser.email} deleted by ${user.displayName}.`,
        userId: user.id
      });

      return userDeleted;
    } catch (error) {
      // Write Log
      if (!/#ERR_/.test(error.message)) {
        throw await log.error({
          ip: context.request.ip,
          code: '#ERR_FFFF',
          customResult: error.message
        });
      }

      throw new Error(error.message);
    }
  }
};

export default userMutation;
