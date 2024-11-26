import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { envConfig } from '../config/env.config';
import { UnprocessableEntityException } from '@nestjs/common';
import { convert } from 'html-to-text';
import { diskStorage } from 'multer';
import { VALID_FILE_FORMAT } from '../constants';
import { Request } from 'express';

const pepper = envConfig.BCRYPT_PASSWORD;
const saltRound = envConfig.SALT_ROUNDS;

export const generateHash = async (plainPassword: string): Promise<string> => {
  const hash = await bcrypt.hash(plainPassword + pepper, saltRound);
  return hash;
};

export const generateRandomCode = (size = 8, alpha = true): number | string => {
  const characters = alpha
    ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-'
    : '0123456789';
  const chars = characters.split('');
  let selections = '';
  for (let i = 0; i < size; i++) {
    const index = Math.floor(Math.random() * chars.length);
    selections += chars[index];
    chars.splice(index, 1);
  }
  return selections;
};

export const generateOtpCode = () => {
  const OTP = generateRandomCode(6, false);
  return {
    OTP,
    otpExpiresAt: (Date.now() + 10 * 60 * 1000) as number,
  };
};

export const comparePassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password + pepper, hashPassword);
};

export const generateUUID = (): string => {
  const uuid = uuidv4();
  return uuid;
};

export const convertEmailToText = (html: string) => {
  const result = convert(html, {
    wordwrap: 130,
  });
  return result;
};

export function getFormattedDate() {
  const currentdate = new Date();
  const datetime =
    'Last Sync: ' +
    currentdate.getDate() +
    '/' +
    (currentdate.getMonth() + 1) +
    '/' +
    currentdate.getFullYear() +
    ' @ ' +
    currentdate.getHours() +
    ':' +
    currentdate.getMinutes() +
    ':' +
    currentdate.getSeconds();
  return datetime;
}

export function monthlyInterval(durationMonths: number): string {
  let duration: string = '';
  switch (durationMonths) {
    case 1:
      duration = 'monthly';
      break;
    case 3:
      duration = 'quarterly';
      break;
    case 6:
      duration = 'biannually';
    case 12:
      duration = 'annually';
      break;
    default:
      duration = 'Unknown Duration';
      break;
  }
  return duration;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export function processFilePath(req: Request, file: UploadedFile) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const filePath = `${protocol}://${host}/api/v1/${file.path}`;
  return filePath;
}

export const storageConfig = diskStorage({
  destination: 'public/files',
  filename: (req, file, cb) => {
    if (!VALID_FILE_FORMAT.includes(file.mimetype)) {
      return cb(
        new UnprocessableEntityException(
          'Only .html, .doc, .docx, and .pdf files are allowed!',
        ),
        null,
      );
    }
    const fileName = `${Date.now()}--${file.originalname}`;
    cb(null, fileName);
  },
});

export const getDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export function getTrialEndDate(trialDays: number) {
  // Get the current date
  const currentDate = new Date();

  // Calculate the end date after adding the number of trial days
  const endDate = new Date(
    currentDate.getTime() + trialDays * 24 * 60 * 60 * 1000,
  );

  // Set the time of the new date to midnight (12:00 AM)
  endDate.setHours(0);
  endDate.setMinutes(0);
  endDate.setSeconds(0);
  endDate.setMilliseconds(0);

  // Return the new date
  return endDate;
}

export function getCurrentTimeAt12AM() {
  // Get the current date
  const now = new Date();

  // Set the time to 12:00 AM
  now.setHours(0, 0, 0, 0);

  return now;
}
