import { hash, verify, type Options } from "@node-rs/argon2";

const ARGON2ID_OPTIONS: Options = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
  outputLen: 32,
  algorithm: 2,
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2ID_OPTIONS);
}

export async function verifyPassword(
  hashVal: string,
  password: string,
): Promise<boolean> {
  return verify(hashVal, password);
}
