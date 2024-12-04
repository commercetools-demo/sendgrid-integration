import { createApiRoot } from '../client/create.client';

export async function getProject() {
  return await createApiRoot()
    .get()
    .execute()
    .then((response) => response.body);
}
