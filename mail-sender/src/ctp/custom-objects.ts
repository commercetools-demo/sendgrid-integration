import { createApiRoot } from '../client/create.client';

export async function getCustomObjectByContainerAndKey(
  container: string,
  key: string
) {
  return await createApiRoot()
    .customObjects()
    .withContainerAndKey({ container: container, key: key })
    .get()
    .execute()
    .then((response) => response.body);
}
