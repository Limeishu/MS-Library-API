import { Context } from 'graphql-yoga/dist/types';

import { prisma, Site, User, SiteWhereUniqueInput } from '../model';
import { ShadowedSiteCreateInput, ShadowedSiteUpdateInput } from '../types/shadowed/site';
import log from '../util/log';
import auth from '../auth';
import group, { PermissionTypePayload } from '../auth/group';

const siteMutation = {
  async createSite(_: any, args: { data: ShadowedSiteCreateInput }, context: Context): Promise<Site> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'site');

      if (!permission.anyone.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const siteExist: Site = await prisma.site({ name: args.data.name });

      if (siteExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_A000',
          customResult: siteExist.name,
          userId: user.id
        });
      }

      const siteCreated: Site = await prisma.createSite(args.data);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Site ${args.data.name} created by ${user.displayName}`,
        userId: user.id
      });

      return siteCreated;
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

  async updateSite(_: any, args: { data: ShadowedSiteUpdateInput, where: SiteWhereUniqueInput }, context: Context): Promise<Site> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'site');

      if (!permission.owner.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const siteExist: Site = await prisma.site(args.where);

      if (!siteExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_B001',
          userId: user.id
        });
      }

      const siteUpdated: Site = await prisma.updateSite({ ...args });

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Site ${args.data.name} updated by ${user.displayName}`,
        userId: user.id
      });

      return siteUpdated;
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

  async deleteSite(_: any, args: { where: SiteWhereUniqueInput }, context: Context): Promise<Site> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'site');

      if (!permission.owner.delete) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const siteExist: Site = await prisma.site(args.where);

      if (!siteExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_B001',
          userId: user.id
        });
      }

      const siteUpdated: Site = await prisma.deleteSite(args.where);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Site ${args.where.name} deleted by ${user.displayName}`,
        userId: user.id
      });

      return siteUpdated;
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

export default siteMutation;
