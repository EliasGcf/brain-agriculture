import { EntityValidationError } from '@core/errors/common/entity-validation.error';
import { User } from '@modules/auth/domain/entities/user';

describe('User', () => {
  it('should be able to create a user with a valid email and password', () => {
    const user = User.create({
      email: 'maria@example.com',
      password: 'hashed-password',
    });

    expect(user.email).toBe('maria@example.com');
    expect(user.password).toBe('hashed-password');
  });

  it('should be able to normalize an email to lowercase and trimmed form', () => {
    const user = User.create({
      email: '  MARIA@EXAMPLE.COM  ',
      password: 'hashed-password',
    });

    expect(user.email).toBe('maria@example.com');
  });

  it('should not be able to create a user with an empty email', () => {
    expect(() =>
      User.create({ email: ' ', password: 'hashed-password' }),
    ).toThrow(EntityValidationError);
  });

  it('should not be able to create a user with an invalid email', () => {
    expect(() =>
      User.create({ email: 'invalid-email', password: 'hashed-password' }),
    ).toThrow(EntityValidationError);
  });
});
