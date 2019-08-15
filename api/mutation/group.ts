import { Context } from 'graphql-yoga/dist/types';
import { prisma, Group, GroupCreateInput, User, GroupUpdateInput, GroupWhereUniqueInput } from '../model';
import log from '../util/log';
import auth from '../auth';
import group, { PermissionTypePayload } from '../auth/group';

const groupMutation = {
  async createGroup(_: any, args: { data: GroupCreateInput }, context: Context): Promise<Group> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'group');

      if (!permission.anyone.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      const groupExist: Group = await prisma.group({ name: args.data.name });

      if (groupExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_G000',
          customResult: groupExist.name,
          userId: user.id
        });
      }

      const groupCreated: Group = await prisma.createGroup(args.data);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Group ${args.data.name} created by ${user.displayName}.`,
        userId: user.id
      });

      return groupCreated;
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

  async updateGroup(_: any, args: { data: GroupUpdateInput, where: GroupWhereUniqueInput }, context: Context): Promise<Group> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'group');

      if (!permission.anyone.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      const groupExist: Group = await prisma.group(args.where);

      if (!groupExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_G001',
          userId: user.id
        });
      }

      const groupUpdate: Group = await prisma.updateGroup({ ...args });

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Group ${args.data.name} updated by ${user.displayName}`,
        userId: user.id
      });

      return groupUpdate;
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

  async deleteGroup(_: any, args: { where: GroupWhereUniqueInput }, context: Context): Promise<Group> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'group');

      if (!permission.anyone.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      const groupExist: Group = await prisma.group(args.where);

      if (!groupExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_G001',
          userId: user.id
        });
      }

      const groupDelete: Group = await prisma.deleteGroup(args.where);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Group ${args.where.name} deleted by ${user.displayName}`,
        userId: user.id
      });

      return groupDelete;
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

export default groupMutation;
