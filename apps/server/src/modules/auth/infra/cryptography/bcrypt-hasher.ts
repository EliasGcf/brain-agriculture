import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { HashComparer } from '@modules/auth/application/cryptography/hash-comparer';
import { HashGenerator } from '@modules/auth/application/cryptography/hash-generator';

@Injectable()
export class BcryptHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 8);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
