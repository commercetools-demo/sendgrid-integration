import { createApiRoot } from '../client/create.client';

export async function getOrderById(orderId: string) {
  return await createApiRoot()
    .orders()
    .withId({
      ID: orderId,
    })
    .get()
    .execute()
    .then((response) => response.body);
}
