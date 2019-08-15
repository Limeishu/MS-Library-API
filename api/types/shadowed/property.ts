import { Maybe, UUID, Json, i18nCreateManyInput, PropertyWhereUniqueInput, i18nUpdateManyInput } from '../../model';
import { ShadowedUserCreateOneInput, ShadowedUserUpdateOneRequiredInput } from './user';
import { ShadowedLogCreateManyInput, ShadowedLogUpdateManyInput } from './log';

export interface ShadowedPropertyCreateInput {
  id?: Maybe<UUID>;
  propertyId: string;
  name: string;
  description?: Maybe<string>;
  i18n?: Maybe<i18nCreateManyInput>;
  logs?: Maybe<ShadowedLogCreateManyInput>;
  creator: ShadowedUserCreateOneInput;
  meta?: Maybe<Json>;
}

export interface ShadowedPropertyUpdateInput {
  propertyId?: Maybe<string>;
  name?: Maybe<string>;
  description?: Maybe<string>;
  i18n?: Maybe<i18nUpdateManyInput>;
  logs?: Maybe<ShadowedLogUpdateManyInput>;
  creator?: Maybe<ShadowedUserUpdateOneRequiredInput>;
  meta?: Maybe<Json>;
}

export interface ShadowedPropertyUpdateDataInput {
  propertyId?: Maybe<string>;
  name?: Maybe<string>;
  description?: Maybe<string>;
  i18n?: Maybe<i18nUpdateManyInput>;
  logs?: Maybe<ShadowedLogUpdateManyInput>;
  creator?: Maybe<ShadowedUserUpdateOneRequiredInput>;
  meta?: Maybe<Json>;
}

export interface ShadowedPropertyCreateOneInput {
  create?: Maybe<ShadowedPropertyCreateInput>;
  connect?: Maybe<PropertyWhereUniqueInput>;
}

export interface ShadowedPropertyUpdateOneRequiredInput {
  create?: Maybe<ShadowedPropertyCreateInput>;
  update?: Maybe<ShadowedPropertyUpdateDataInput>;
  upsert?: Maybe<ShadowedPropertyUpsertNestedInput>;
  connect?: Maybe<PropertyWhereUniqueInput>;
}

export interface ShadowedPropertyUpsertNestedInput {
  update: ShadowedPropertyUpdateDataInput;
  create: ShadowedPropertyCreateInput;
}
