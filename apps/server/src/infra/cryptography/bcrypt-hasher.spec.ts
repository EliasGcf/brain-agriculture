import { BcryptHasher } from '@infra/cryptography/bcrypt-hasher';

describe('BcryptHasher', () => {
  it('should be able to hash a password without returning the plaintext', async () => {
    const hasher = new BcryptHasher();
    const password = 'plain-password';

    const hash = await hasher.hash(password);

    expect(hash).not.toBe(password);
  });

  it('should be able to compare a password with its generated hash', async () => {
    const hasher = new BcryptHasher();
    const password = 'plain-password';
    const hash = await hasher.hash(password);

    await expect(hasher.compare(password, hash)).resolves.toBe(true);
  });

  it('should not be able to compare a wrong password with a generated hash', async () => {
    const hasher = new BcryptHasher();
    const hash = await hasher.hash('plain-password');

    await expect(hasher.compare('wrong-password', hash)).resolves.toBe(false);
  });
});
