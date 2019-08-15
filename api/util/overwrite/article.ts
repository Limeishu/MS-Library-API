import { User } from '../../model';
import { ShadowedNewsCreateInput, ShadowedNewsUpdateInput } from '../../types/shadowed/news';
import { ShadowedPostCreateInput, ShadowedPostUpdateInput } from '../../types/shadowed/post';

import overWrite from '.';

const article = {
  create: (
    data: ShadowedNewsCreateInput | ShadowedPostCreateInput,
    user: User
  ): ShadowedNewsCreateInput | ShadowedPostCreateInput => {
    data.author.connect = { id: user.id };

    if (data.banner.create) {
      data.banner.create = overWrite.image.create(data.banner.create, user);
    }

    return data;
  },

  update: (
    data: ShadowedNewsUpdateInput | ShadowedPostUpdateInput,
    user: User
  ): ShadowedNewsUpdateInput | ShadowedPostUpdateInput => {
    data.author.connect = { id: user.id };

    if (data.banner.create) {
      data.banner.create = overWrite.image.create(data.banner.create, user);
    }

    if (data.banner.upsert) {
      if (Array.isArray(data.banner.upsert)) {
        data.banner.upsert = data.banner.upsert.map(ele => {
          if (Object.keys(ele)[0] === 'create') {
            ele.create.file.create.uploadBy.connect = { id: user.id };
          }
          return ele;
        });
      } else {
        data.banner.upsert.create.file.create.uploadBy.connect = { id: user.id };
      }
    }

    return data;
  }
};

export default article;
