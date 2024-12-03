import client from '@sendgrid/client';
import { ClientRequest } from '@sendgrid/client/src/request';
import { config } from 'dotenv';

config();
config({ path: `.env.local`, override: true });

export type Version = {
  id: string;
  template_id: string;
  active: number;
  name: string;
  generate_plain_content: boolean;
  subject: string;
  updated_at: string;
  editor: 'code' | 'design';
  thumbnail_url: string;

  html_content?: string;
  plain_content?: string;
};

export type Template = {
  id: string;
  name: string;
  generation: 'legacy' | 'dynamic';
  updated_at: string;
  versions: Array<Version>;
};

const getClient = () => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('env SENDGRID_API_KEY is missing');
  }
  client.setApiKey(process.env.SENDGRID_API_KEY);
  return client;
};

export const getTemplates = async (): Promise<Array<Template>> => {
  const queryParams = {
    page_size: 18,
    generations: 'dynamic',
  };

  const request: ClientRequest = {
    url: `v3/templates`,
    method: 'GET',
    qs: queryParams,
  };
  const [result] = await getClient().request(request);
  if (result.statusCode !== 200) {
    throw new Error('response code !== 200');
  }
  return (result.body as any).result;
};

export const createTemplate = async (
  name: string
): Promise<Array<Template>> => {
  const data = {
    name: name,
    generation: 'dynamic',
  };

  const request: ClientRequest = {
    url: `v3/templates`,
    method: 'POST',
    body: data,
  };
  const [result] = await getClient().request(request);
  if (result.statusCode !== 200) {
    throw new Error('response code !== 200');
  }
  return (result.body as any).result;
};

export const getVersion = async (
  template_id: string,
  version_id: string
): Promise<Version> => {
  const request: ClientRequest = {
    url: `v3/templates/${template_id}/versions/${version_id}`,
    method: 'GET',
  };
  const [result] = await getClient().request(request);
  if (result.statusCode !== 200) {
    throw new Error('response code !== 200');
  }
  return result.body as any as Version;
};

export const updateVersion = async (
  templateId: string,
  versionId: string,
  data: Version
): Promise<Version> => {
  const { updated_at, editor, ...toSet } = data;
  const request: ClientRequest = {
    url: `/v3/templates/${templateId}/versions/${versionId}`,
    method: 'PATCH',
    body: toSet,
  };
  const [result] = await getClient().request(request);
  if (result.statusCode !== 200) {
    throw new Error('response code !== 200');
  }
  return result.body as any as Version;
};

export const createVersion = async (
  templateId: string,
  data: Omit<Version, 'editor' | 'updated_at' | 'id' | 'thumbnail_url'>
): Promise<Version> => {
  const request: ClientRequest = {
    url: `/v3/templates/${templateId}/versions`,
    method: 'POST',
    body: data,
  };
  const [result] = await getClient().request(request);
  if (result.statusCode !== 200) {
    throw new Error('response code !== 200');
  }
  return result.body as any as Version;
};
