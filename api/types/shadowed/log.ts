import { Maybe, UUID, Json, EventCreateOneInput } from '../../model';
import { ShadowedUserCreateOneInput } from './user';

export interface ShadowedLogCreateInput {
  id?: Maybe<UUID>;
  ip: string;
  event: EventCreateOneInput;
  user?: Maybe<ShadowedUserCreateOneInput>;
  meta?: Maybe<Json>;
}

export interface ShadowedLogCreateManyInput {
  create?: Maybe<ShadowedLogCreateInput[] | ShadowedLogCreateInput>;
}

export interface ShadowedLogUpdateManyInput {
  create?: Maybe<ShadowedLogCreateInput[] | ShadowedLogCreateInput>;
}
