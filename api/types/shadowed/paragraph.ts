import { Maybe, UUID, Json, ParagraphWhereUniqueInput, Int, ParagraphType, MarkupCreateManyInput, ParagraphScalarWhereInput, ParagraphUpdateManyWithWhereNestedInput, MarkupUpdateManyInput } from '../../model';
import { ShadowedQuoteCreateManyInput, ShadowedQuoteUpdateManyInput } from './quote';
import { ShadowedReplyCreateManyInput, ShadowedReplyUpdateManyInput } from './reply';

export interface ShadowedParagraphCreateInput {
  id?: Maybe<UUID>;
  index?: Maybe<Int>;
  text?: Maybe<string>;
  type?: Maybe<ParagraphType>;
  markup?: Maybe<MarkupCreateManyInput>;
  quotes?: Maybe<ShadowedQuoteCreateManyInput>;
  replies?: Maybe<ShadowedReplyCreateManyInput>;
  meta?: Maybe<Json>;
}

export interface ShadowedParagraphUpdateDataInput {
  index?: Maybe<Int>;
  text?: Maybe<string>;
  type?: Maybe<ParagraphType>;
  markup?: Maybe<MarkupUpdateManyInput>;
  quotes?: Maybe<ShadowedQuoteUpdateManyInput>;
  replies?: Maybe<ShadowedReplyUpdateManyInput>;
  meta?: Maybe<Json>;
}

export interface ShadowedParagraphCreateManyInput {
  create?: Maybe<ShadowedParagraphCreateInput[] | ShadowedParagraphCreateInput>;
  connect?: Maybe<ParagraphWhereUniqueInput[] | ParagraphWhereUniqueInput>;
}

export interface ShadowedParagraphUpdateManyInput {
  create?: Maybe<ShadowedParagraphCreateInput[] | ShadowedParagraphCreateInput>;
  update?: Maybe<
    | ShadowedParagraphUpdateWithWhereUniqueNestedInput[]
    | ShadowedParagraphUpdateWithWhereUniqueNestedInput
  >;
  upsert?: Maybe<
    | ShadowedParagraphUpsertWithWhereUniqueNestedInput[]
    | ShadowedParagraphUpsertWithWhereUniqueNestedInput
  >;
  delete?: Maybe<ParagraphWhereUniqueInput[] | ParagraphWhereUniqueInput>;
  connect?: Maybe<ParagraphWhereUniqueInput[] | ParagraphWhereUniqueInput>;
  set?: Maybe<ParagraphWhereUniqueInput[] | ParagraphWhereUniqueInput>;
  disconnect?: Maybe<ParagraphWhereUniqueInput[] | ParagraphWhereUniqueInput>;
  deleteMany?: Maybe<ParagraphScalarWhereInput[] | ParagraphScalarWhereInput>;
  updateMany?: Maybe<
    | ParagraphUpdateManyWithWhereNestedInput[]
    | ParagraphUpdateManyWithWhereNestedInput
  >;
}

export interface ShadowedParagraphUpsertWithWhereUniqueNestedInput {
  where: ParagraphWhereUniqueInput;
  update: ShadowedParagraphUpdateDataInput;
  create: ShadowedParagraphCreateInput;
}

export interface ShadowedParagraphUpdateWithWhereUniqueNestedInput {
  where: ParagraphWhereUniqueInput;
  data: ShadowedParagraphUpdateDataInput;
}
