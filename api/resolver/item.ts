import { prisma, Item, Image, Paragraph, Statement, Log, i18n, FragmentableArray } from '../model';

const Item = {
  i18n(parent: Item): FragmentableArray<i18n> {
    return prisma.item({ id: parent.id }).i18n();
  },

  images(parent: Item): FragmentableArray<Image> {
    return prisma.item({ id: parent.id }).images({ orderBy: 'createdAt_ASC' });
  },

  introduction(parent: Item): FragmentableArray<Paragraph> {
    return prisma.item({ id: parent.id }).introduction({ orderBy: 'index_ASC' });
  },

  statements(parent: Item): FragmentableArray<Statement> {
    return prisma.item({ id: parent.id }).statements({ orderBy: 'index_ASC' });
  },

  logs(parent: Item): FragmentableArray<Log> {
    return prisma.item({ id: parent.id }).logs({ orderBy: 'createdAt_ASC' });
  }
};

export default Item;
