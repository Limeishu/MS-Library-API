import { Context } from 'graphql-yoga/dist/types';

import { prisma, Item, User, ItemWhereUniqueInput } from '../model';
import { ShadowedItemCreateInput, ShadowedItemUpdateInput } from '../types/shadowed/item';
import group, { PermissionTypePayload, RelationPayload } from '../auth/group';
import log from '../util/log';
import auth from '../auth';
import overWrite from '../util/overwrite';

const itemMutation = {
  async createItem(_: any, args: { data: ShadowedItemCreateInput }, context: Context): Promise<Item> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'item');

      if (!permission.owner.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      const itemExist: Item = await prisma.item({ itemId: args.data.itemId });

      if (itemExist) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_I000',
          customResult: `${itemExist.itemId} ${itemExist.name}`,
          userId: user.id
        });
      }

      // Force overwrite user connect to prevent fake identity
      args.data = overWrite.item.create(args.data, user);

      const itemCreated: Item = await prisma.createItem(args.data);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Item ${args.data.name} create successed.`,
        userId: user.id
      });

      return itemCreated;
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

  async updateItem(_: any, args: { data: ShadowedItemUpdateInput, where: ItemWhereUniqueInput }, context: Context): Promise<Item> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const targetItem: Item = await prisma.item(args.where);

      if (!targetItem) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_I001',
          userId: user.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'item');
      const relation: RelationPayload = await group.relation.$check(user, targetItem.id, 'item');

      if (!(permission.anyone.write || (permission.group.write && relation.isMember) || (permission.owner.write && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      // Force overwrite user connect to prevent fake identity
      args.data = overWrite.item.update(args.data, user);

      const itemUpdated: Item = await prisma.updateItem({ ...args });

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Item ${targetItem.name} updated by ${user.displayName}.`,
        userId: user.id
      });

      return itemUpdated;
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

  async deleteItem(_: any, args: { where: ItemWhereUniqueInput }, context: Context): Promise<Item> {
    try {
      const user: User = await auth.token.parse(context.request);

      if (!user) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const targetItem: Item = await prisma.item(args.where);

      if (!targetItem) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_I001',
          userId: user.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(user, 'item');
      const relation: RelationPayload = await group.relation.$check(user, targetItem.id, 'item');

      if (!(permission.anyone.delete || (permission.group.delete && relation.isMember) || (permission.owner.delete && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: user.id
        });
      }

      const itemDeleted: Item = await prisma.deleteItem(args.where);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Item ${targetItem.name} deleted by ${user.displayName}.`,
        userId: user.id
      });

      return itemDeleted;
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

export default itemMutation;
