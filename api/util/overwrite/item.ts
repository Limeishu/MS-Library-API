import { User } from '../../model';
import { ShadowedItemCreateInput, ShadowedItemUpdateInput } from '../../types/shadowed/item';

import overWrite from '.';

const item = {
  create: (
    data: ShadowedItemCreateInput,
    user: User
  ): ShadowedItemCreateInput => {
    data.creator.connect = { id: user.id };

    if (data.images.create) {
      data.images.create = overWrite.image.create(data.images.create, user);
    }

    if (data.statements.create) {
      data.statements.create = overWrite.statement.create(data.statements.create, user);
    }

    return data;
  },

  update: (
    data: ShadowedItemUpdateInput,
    user: User
  ): ShadowedItemUpdateInput => {
    data.creator.connect = { id: user.id };

    if (data.images.create) {
      data.images.create = overWrite.image.create(data.images.create, user);
    }

    if (data.statements) {
      data.statements = overWrite.statement.update(data.statements, user);
    }

    return data;
  }
};

export default item;
