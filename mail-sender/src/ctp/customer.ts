import { createApiRoot } from '../client/create.client';

export async function getCustomerById(customerId: string) {
  return await createApiRoot()
    .customers()
    .withId({
      ID: customerId,
    })
    .get()
    .execute()
    .then((response) => response.body);
}

export const createTokenForVerification = async (customerId: string) => {
  return await createApiRoot()
    .customers()
    .emailToken()
    .post({ body: { id: customerId, ttlMinutes: 43200 } })
    .execute()
    .then((response) => response.body);
};

export const generatePasswordResetToken = async (email: string) => {
  return await createApiRoot()
    .customers()
    .passwordToken()
    .post({ body: { email: email, ttlMinutes: 34560 } })
    .execute()
    .then((response) => response.body);
};
