import type { Request } from 'express';

export interface MockMulterFileOptions extends Partial<Express.Multer.File> {
  key?: string;
}

export function createMockFile(
  overrides: MockMulterFileOptions = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    stream: {} as Express.Multer.File['stream'],
    destination: '',
    filename: '',
    path: '',
    buffer: Buffer.from(''),
    ...overrides,
  } as Express.Multer.File;
}

export function createMockRequest(): Request {
  return {} as Request;
}

