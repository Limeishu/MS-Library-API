import { Context } from 'graphql-yoga/dist/types';

import { prisma, Group, GroupWhereInput, GroupOrderByInput, GroupWhereUniqueInput, User } from '../model';
import group, { PermissionTypePayload, RelationPayload } from '../auth/group';
import log from '../util/log';
import auth from '../auth';

const groupQuery = {
  async group(_: any, args: { where: GroupWhereUniqueInput }, context: Context): Promise<Group> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      const targetGroup: Group = await prisma.group(args.where);

      if (!targetGroup) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_G001',
          userId: user.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'group');
      const relation: RelationPayload = await group.relation.$check(user, targetGroup.id, 'group');

      if (!(permission.anyone.read || (permission.group.read && relation.isMember) || (permission.owner.read && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      return targetGroup;
    } catch (error) {
      // Write Log
      if (!/#ERR_/.test(error.message)) {
        log.error({
          ip: context.request.ip,
          code: '#ERR_FFFF',
          customResult: error.message
        });
      }

      throw new Error(error.message);
    }
  },

  async groups(
    _: any,
    args: {
      where?: GroupWhereInput;
      orderBy?: GroupOrderByInput;
      skip?: number;
      after?: string;
      before?: string;
      first?: number;
      last?: number;
    },
    context: Context
  ): Promise<Group[]> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'group');

      const queriedGroups: Group[] = await prisma.groups({ ...args });
      const result: Group[] = [];

      if (permission.anyone.read) {
        return queriedGroups;
      }

      queriedGroups.forEach(async groupData => {
        // Filter out content that you don't have permission to browse.
        const relation: RelationPayload = await group.relation.$check(user, groupData.id, 'group');
        if ((permission.group.read && relation.isMember) || (permission.owner.read && relation.isOwner)) {
          result.push(groupData);
        }
        return;
      });

      return result;
    } catch (error) {
      // Write Log
      if (!/#ERR_/.test(error.message)) {
        log.error({
          ip: context.request.ip,
          code: '#ERR_FFFF',
          customResult: error.message
        });
      }

      throw new Error(error.message);
    }
  }
};

export default groupQuery;
