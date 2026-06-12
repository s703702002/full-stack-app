import fs from 'node:fs';

export const deleteFile = fs.unlinkSync;
export const existsSync = fs.existsSync;
export const readFileSync = fs.readFileSync;
export const mkdirSync = fs.mkdirSync;
export const existSync = fs.existsSync;
