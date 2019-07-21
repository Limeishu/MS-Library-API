import { Context } from 'graphql-yoga/dist/types';
import { prisma, Group, GroupCreateInput, User } from '../model';
import log from '../util/log';
import auth from '../auth';
import group, { PermissionTypePayload } from '../auth/group';

const groupMutation = {
  async createGroup(_, args: { data: GroupCreateInput }, context: Context): Promise<Group> {
    const user: User = await auth.token.parse(context.request);

    try {
      const permission: PermissionTypePayload = await group.permission.$expand(user, 'group');

      if (!user) {
        // Write Log
        await log.warn({
          ip: context.request.ip,
          result: '#ERR_F000: Permission Deny.'
        });

        throw new Error('#ERR_F000: Permission Deny.');
      }

      if (!permission.anyone.write) {
        // Write Log
        await log.warn({
          ip: context.request.ip,
          result: '#ERR_F000: Permission Deny.',
          userId: user.id
        });

        throw new Error('#ERR_F000: Permission Deny.');
      }

      const groupExist: Group = await prisma.group({ name: args.data.name });

      if (groupExist) {
        // Write Log
        await log.warn({
          ip: context.request.ip,
          result: `#ERR_G000 Group ${groupExist.name} already existed.`,
          userId: user.id
        });

        throw new Error(`#ERR_G000 Group ${groupExist.name} already existed.`);
      }
      // Write Log
      await log.write({
        ip: context.request.ip,
        result: `Group ${args.data.name} create successed.`,
        userId: user.id
      });

      return prisma.createGroup(args.data);
    } catch (error) {
      // Write Log
      if (!/#ERR_/.test(error.message)) {
        await log.error({
          ip: context.request.ip,
          result: `#ERR_FFFF Unexpected Error. ${error.message}`
        });
      }

      throw new Error(error.message || '#ERR_FFFF');
    }
  }
};

export default groupMutation;
