import { User } from '../../model';
import { ShadowedStatementCreateInput, ShadowedStatementUpdateManyInput } from '../../types/shadowed/statement';
import overWrite from '.';

const statement = {
  create: (
    data: ShadowedStatementCreateInput | ShadowedStatementCreateInput[],
    user: User
  ): ShadowedStatementCreateInput | ShadowedStatementCreateInput[] => {
    if (Array.isArray(data)) {
      return data.map(ele => {
        if (ele.property.create) {
          ele.property.create = overWrite.property.create(ele.property.create, user);
        }
        return ele;
      });
    }

    data.property.create = overWrite.property.create(data.property.create, user);
    return data;
  },

  update: (
    data: ShadowedStatementUpdateManyInput,
    user: User
  ): ShadowedStatementUpdateManyInput => {
    if (data.create) {
      data.create = overWrite.statement.create(data.create, user);
    }

    if (data.upsert) {
      if (Array.isArray(data.upsert)) {
        data.upsert.map(ele => {
          if (ele.create && ele.create.property.create) {
            ele.create.property.create.creator.connect = { id: user.id };
          }
          return ele;
        });
      } else {
        if (data.upsert.create) {
          data.upsert.create.property.create.creator.connect = { id: user.id };
        }
      }
    }
    return data;
  }
};

export default statement;
