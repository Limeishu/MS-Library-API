import { Context } from 'graphql-yoga/dist/types';

import { prisma, Admin, User, AdminWhereUniqueInput } from '../model';
import { ShadowedAdminCreateInput, ShadowedAdminUpdateInput } from '../types/shadowed/admin';
import log from '../util/log';
import auth from '../auth';
import group, { PermissionTypePayload } from '../auth/group';

const adminMutation = {
  async createAdmin(_: any, args: { data: ShadowedAdminCreateInput }, context: Context): Promise<Admin> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'admin');

      if (!permission.anyone.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const adminExist: Admin = await prisma.admin({ name: args.data.name });

      if (adminExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_A000',
          customResult: adminExist.name,
          userId: user.id
        });
      }

      const adminCreated: Admin = await prisma.createAdmin(args.data);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Admin ${args.data.name} created by ${user.displayName}.`,
        userId: user.id
      });

      return adminCreated;
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

  async updateAdmin(_: any, args: { data: ShadowedAdminUpdateInput, where: AdminWhereUniqueInput }, context: Context): Promise<Admin> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'admin');

      if (!permission.owner.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const adminExist: Admin = await prisma.admin(args.where);

      if (!adminExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_A001',
          userId: user.id
        });
      }

      const adminUpdated: Admin = await prisma.updateAdmin({ ...args });

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Admin ${args.data.name} updated by ${user.displayName}`,
        userId: user.id
      });

      return adminUpdated;
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

  async deleteAdmin(_: any, args: { where: AdminWhereUniqueInput }, context: Context): Promise<Admin> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'admin');

      if (!permission.owner.delete) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const adminExist: Admin = await prisma.admin(args.where);

      if (!adminExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_A001',
          userId: user.id
        });
      }

      const adminUpdated: Admin = await prisma.deleteAdmin(args.where);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Admin ${args.where.name} deleted by ${user.displayName}`,
        userId: user.id
      });

      return adminUpdated;
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

export default adminMutation;
