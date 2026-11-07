import { Transform } from 'class-transformer';

// "Foo@Gmail.com " and "foo@gmail.com" are the same mailbox; treating them as
// different would allow duplicate accounts and break login for people who type a capital.
export const NormalizeEmail = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));

export const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
