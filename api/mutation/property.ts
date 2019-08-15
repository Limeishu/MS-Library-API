import { Context } from 'graphql-yoga/dist/types';

import { prisma, Property, User, PropertyWhereUniqueInput } from '../model';
import { ShadowedPropertyCreateInput, ShadowedPropertyUpdateInput } from '../types/shadowed/property';
import group, { PermissionTypePayload, RelationPayload } from '../auth/group';
import log from '../util/log';
import auth from '../auth';
import overWrite from '../util/overwrite';

const propertyMutation = {
  async createProperty(_: any, args: { data: ShadowedPropertyCreateInput }, context: Context): Promise<Property> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'property');

      if (!permission.owner.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      const propertyExist: Property = await prisma.property({ propertyId: args.data.propertyId });

      if (propertyExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_P000',
          customResult: `${propertyExist.propertyId} ${propertyExist.name}`,
          userId: user.id
        });
      }

      // Force overwrite user connect to prevent fake identity
      args.data = overWrite.property.create(args.data, user);

      const propertyCreated: Property = await prisma.createProperty(args.data);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Property ${args.data.name} create successed.`,
        userId: user.id
      });

      return propertyCreated;
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

  async updateProperty(_: any, args: { data: ShadowedPropertyUpdateInput, where: PropertyWhereUniqueInput }, context: Context): Promise<Property> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const targetProperty: Property = await prisma.property(args.where);

      if (!targetProperty) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_P001',
          userId: user.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'property');
      const relation: RelationPayload = await group.relation.$check(user, targetProperty.id, 'property');

      if (!(permission.anyone.write || (permission.group.write && relation.isMember) || (permission.owner.write && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      // Force overwrite user connect to prevent fake identity
      args.data = overWrite.property.update(args.data, user);

      const propertyUpdated: Property = await prisma.updateProperty({ ...args });

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Property ${targetProperty.name} updated by ${user.displayName}.`,
        userId: user.id
      });

      return propertyUpdated;
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

  async deleteProperty(_: any, args: { where: PropertyWhereUniqueInput }, context: Context): Promise<Property> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const targetProperty: Property = await prisma.property(args.where);

      if (!targetProperty) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_P001',
          userId: user.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'property');
      const relation: RelationPayload = await group.relation.$check(user, targetProperty.id, 'property');

      if (!(permission.anyone.delete || (permission.group.delete && relation.isMember) || (permission.owner.delete && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      const propertyDeleted: Property = await prisma.deleteProperty(args.where);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Property ${targetProperty.name} deleted by ${user.displayName}.`,
        userId: user.id
      });

      return propertyDeleted;
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

export default propertyMutation;
