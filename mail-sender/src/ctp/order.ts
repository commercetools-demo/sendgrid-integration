import { createApiRoot } from '../client/create.client';

export async function getOrderById(orderId: string, expands?: string[]) {
  return await createApiRoot()
    .orders()
    .withId({
      ID: orderId,
    })
    .get({
      queryArgs: {
        ...(expands && { expand: expands }),
      },
    })
    .execute()
    .then((response) => response.body);
}
