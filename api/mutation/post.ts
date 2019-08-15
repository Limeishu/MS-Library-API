import { Context } from 'graphql-yoga/dist/types';

import { prisma, Post, PostCreateInput, User, PostUpdateInput, PostWhereUniqueInput } from '../model';
import group, { PermissionTypePayload, RelationPayload } from '../auth/group';
import log from '../util/log';
import auth from '../auth';
import { ShadowedPostCreateInput, ShadowedPostUpdateInput } from '../types/shadowed/post';
import overWrite from '../util/overwrite';

const postMutation = {
  async createPost(_: any, args: { data: ShadowedPostCreateInput }, context: Context): Promise<Post> {
    try {
      const author: User = await auth.token.parse(context.request);

      if (!author) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(author, 'post');

      if (!permission.owner.write) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: author.id
        });
      }

      // Force overwrite user connect to prevent fake identity
      args.data = overWrite.post.create(args.data, author);

      const postCreated: Post = await prisma.createPost(args.data);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Post ${args.data.title} create successed.`,
        userId: author.id
      });

      return postCreated;
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

  async updatePost(_: any, args: { data: ShadowedPostUpdateInput, where: PostWhereUniqueInput }, context: Context): Promise<Post> {
    try {
      const author: User = await auth.token.parse(context.request);
      if (!author) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const targetPost: Post = await prisma.post(args.where);

      if (!targetPost) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_M001',
          userId: author.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(author, 'post');
      const relation: RelationPayload = await group.relation.$check(author, targetPost.id, 'post');

      if (!(permission.anyone.write || (permission.group.write && relation.isMember) || (permission.owner.write && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: author.id
        });
      }

      // Force overwrite user connect to prevent fake identity
      args.data = overWrite.post.update(args.data, author);

      const postUpdated: Post = await prisma.updatePost({ ...args });

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Post ${targetPost.title} updated by ${author.displayName}.`,
        userId: author.id
      });

      return postUpdated;
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

  async deletePost(_: any, args: { where: PostWhereUniqueInput }, context: Context): Promise<Post> {
    try {
      const author: User = await auth.token.parse(context.request);

      if (!author) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00'
        });
      }

      const targetPost: Post = await prisma.post(args.where);

      if (!targetPost) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_M001',
          userId: author.id
        });
      }

      const permission: PermissionTypePayload = await group.permission.$expand(author, 'post');
      const relation: RelationPayload = await group.relation.$check(author, targetPost.id, 'post');

      if (!(permission.anyone.delete || (permission.group.delete && relation.isMember) || (permission.owner.delete && relation.isOwner))) {
        // Write Log
        throw await log.warn({
          ip: context.request.ip,
          code: '#ERR_FF00',
          userId: author.id
        });
      }

      const postDeleted: Post = await prisma.deletePost(args.where);

      // Write Log
      await log.write({
        ip: context.request.ip,
        customResult: `Post ${targetPost.title} deleted by ${author.displayName}.`,
        userId: author.id
      });

      return postDeleted;
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

export default postMutation;
