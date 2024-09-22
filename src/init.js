import bcrypt from 'bcryptjs';
import { Collections, db } from './db.js';

export async function onInit() {
  await initAccounts();
}

async function initAccounts() {
  const coll = db.collection(Collections.Accounts);
  const count = await coll.countDocuments({});
  if (count !== 0) return;

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('12345678', salt);

  const ownerAccounts = [
    {
      accountId: 'owner1@gmail.com',
      hashedPassword,
      roles: ['Owner'],
    },
    {
      accountId: 'owner2@gmail.com',
      hashedPassword,
      roles: ['Owner'],
    },
    {
      accountId: 'owner3@gmail.com',
      hashedPassword,
      roles: ['Owner'],
    },
  ];

  const caAccounts = [
    {
      accountId: 'ca1@gmail.com',
      hashedPassword,
      roles: ['CA'],
    },
    {
      accountId: 'ca2@gmail.com',
      hashedPassword,
      roles: ['CA'],
    },
    {
      accountId: 'ca3@gmail.com',
      hashedPassword,
      roles: ['CA'],
    },
  ];

  const boardAccounts = [
    {
      accountId: 'board1@gmail.com',
      hashedPassword,
      roles: ['Board'],
    },
    {
      accountId: 'board2@gmail.com',
      hashedPassword,
      roles: ['Board'],
    },
    {
      accountId: 'board3@gmail.com',
      hashedPassword,
      roles: ['Board'],
    },
  ];

  await coll.insertMany([...ownerAccounts, ...caAccounts, ...boardAccounts]);
}
