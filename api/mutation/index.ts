import groupMutation from './group';
import itemMutation from './item';
import propertyMutation from './property';
import newsMutation from './news';
import postMutation from './post';
import adminMutation from './admin';
import siteMutation from './site';

const Mutation = {
  ...groupMutation,
  ...itemMutation,
  ...propertyMutation,
  ...newsMutation,
  ...postMutation,
  ...adminMutation,
  ...siteMutation
};

export default Mutation;
