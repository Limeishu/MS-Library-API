import { Context } from 'graphql-yoga/dist/types';

import { prisma, News, User, NewsWhereUniqueInput } from '../model';
import { ShadowedNewsCreateInput, ShadowedNewsUpdateInput } from '../types/shadowed/news';
import group, { PermissionTypePayload, RelationPayload } from '../auth/group';
import log from '../util/log';
import auth from '../auth';
import overWrite from '../util/overwrite';

const newsMutation = {
  async createNews(_: any, args: { data: ShadowedNewsCreateInput }, context: Context): Promise<News> {
    try {
      const author: User = await auth.token.parse(context.request);

      if (!author) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(author, 'news');

      if (!permission.owner.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: author.id
        });
      }

      // Force overwrite user connect to prevent fake identity
      args.data = overWrite.news.create(args.data, author);

      const newsCreated: News = await prisma.createNews(args.data);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `News ${args.data.title} create successed.`,
        userId: author.id
      });

      return newsCreated;
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

  async updateNews(_: any, args: { data: ShadowedNewsUpdateInput, where: NewsWhereUniqueInput }, context: Context): Promise<News> {
    try {
      const author: User = await auth.token.parse(context.request);

      if (!author) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const targetNews: News = await prisma.news(args.where);

      if (!targetNews) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_N001',
          userId: author.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(author, 'news');
      const relation: RelationPayload = await group.relation.$check(author, targetNews.id, 'news');

      if (!(permission.anyone.write || (permission.group.write && relation.isMember) || (permission.owner.write && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: author.id
        });
      }

      // Force overwrite user connect to prevent fake identity
      args.data = overWrite.news.update(args.data, author);

      const newsUpdated: News = await prisma.updateNews({ ...args });

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `News ${targetNews.title} updated by ${author.displayName}.`,
        userId: author.id
      });

      return newsUpdated;
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

  async deleteNews(_: any, args: { where: NewsWhereUniqueInput }, context: Context): Promise<News> {
    try {
      const author: User = await auth.token.parse(context.request);

      if (!author) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const targetNews: News = await prisma.news(args.where);

      if (!targetNews) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_N001',
          userId: author.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(author, 'news');
      const relation: RelationPayload = await group.relation.$check(author, targetNews.id, 'news');

      if (!(permission.anyone.delete || (permission.group.delete && relation.isMember) || (permission.owner.delete && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: author.id
        });
      }

      const newsDeleted: News = await prisma.deleteNews(args.where);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `News ${targetNews.title} deleted by ${author.displayName}.`,
        userId: author.id
      });

      return newsDeleted;
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

export default newsMutation;
