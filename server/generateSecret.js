import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// This script will automatically append JWT_SECRET to the .env file if it doesn't exist
const envPath = '/Users/aadinajain/Desktop/Smart Expense tracker/server/.env';
const envContent = fs.readFileSync(envPath, 'utf-8');

if (!envContent.includes('JWT_SECRET')) {
  const secret = crypto.randomBytes(32).toString('hex');
  fs.appendFileSync(envPath, `\nJWT_SECRET=${secret}\n`);
  console.log('Appended JWT_SECRET to .env');
} else {
  console.log('JWT_SECRET already exists in .env');
}
