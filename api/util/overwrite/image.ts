import { User } from '../../model';
import { ShadowedImageCreateInput, ShadowedImageUpdateManyInput, ShadowedImageUpdateOneInput } from '../../types/shadowed/image';
import overWrite from '.';

const image = {
  create: (
    data: ShadowedImageCreateInput | ShadowedImageCreateInput[],
    user: User
  ): ShadowedImageCreateInput | ShadowedImageCreateInput[] => {
    if (Array.isArray(data)) {
      return data.map(ele => {
        ele.file.create.uploadBy.connect = { id: user.id };
        return ele;
      });
    }

    data.file.create.uploadBy.connect = { id: user.id };
    return data;
  },

  update: (
    data: ShadowedImageUpdateManyInput,
    user: User
  ): ShadowedImageUpdateManyInput => {
    if (data.create) {
      data.create = overWrite.image.create(data.create, user);
    }

    if (data.upsert) {
      if (Array.isArray(data.upsert)) {
        data.upsert.map(ele => {
          if (ele.create && ele.create.file.create) {
            ele.create.file.create.uploadBy.connect = { id: user.id };
          }
          return ele;
        });
      } else {
        if (data.upsert.create) {
          data.upsert.create.file.create.uploadBy.connect = { id: user.id };
        }
      }
    }
    return data;
  },

  updateOne: (
    data: ShadowedImageUpdateOneInput,
    user: User
  ): ShadowedImageUpdateOneInput => {
    if (data.create && data.create.file.create) {
      data.create.file.create.uploadBy.connect = { id: user.id };
    }

    if (data.update && data.update.file.update) {
      data.create.file.create.uploadBy.connect = { id: user.id };
    }

    if (data.upsert) {
      if (data.upsert.create) {
        data.upsert.create.file.create.uploadBy.connect = { id: user.id };
      }

      if (data.upsert.update && data.upsert.update.file && data.upsert.update.file.create) {
        data.upsert.update.file.create.uploadBy.connect = { id: user.id };
      }
    }

    return data;
  }
};

export default image;
