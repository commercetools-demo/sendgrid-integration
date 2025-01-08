import { createApiRoot } from '../client/create.client';

export async function getStateById(stateId: string, expands?: string[]) {
  return await createApiRoot()
    .states()
    .withId({
      ID: stateId,
    })
    .get({
      queryArgs: {
        ...(expands && { expand: expands }),
      },
    })
    .execute()
    .then((response) => response.body);
}
