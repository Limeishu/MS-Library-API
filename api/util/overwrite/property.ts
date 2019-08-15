import { User } from '../../model';
import { ShadowedPropertyCreateInput, ShadowedPropertyUpdateOneRequiredInput, ShadowedPropertyUpdateInput } from '../../types/shadowed/property';

import overWrite from '.';

const property = {
  create: (
    data: ShadowedPropertyCreateInput,
    user: User
  ): ShadowedPropertyCreateInput => {
    data.creator.connect = { id: user.id };
    return data;
  },

  update: (
    data: ShadowedPropertyUpdateInput,
    user: User
  ): ShadowedPropertyUpdateInput => {
    data.creator.connect = { id: user.id };
    return data;
  },

  updateOne: (
    data: ShadowedPropertyUpdateOneRequiredInput,
    user: User
  ): ShadowedPropertyUpdateOneRequiredInput => {
    if (data.create) {
      data.create = overWrite.property.create(data.create, user);
    }

    if (data.update) {
      data.update.creator.connect = { id: user.id };
    }

    if (data.upsert) {
      if (data.upsert.create) {
        data.upsert.create = overWrite.property.create(data.create, user);
      }

      if (data.upsert.update && data.upsert.update.creator) {
        data.upsert.update.creator.connect = { id: user.id };
      }
    }

    return data;
  }
};

export default property;
