import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Users functional tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('When creating a new user', () => {
    it('should successfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'john@email.com',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) },
        })
      );
      console.log(response.body.password);
      await expect(
        AuthService.comparePasswords(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
    });
  });

  it('should return 422 when there is a validation error', async () => {
    const newUser = {
      email: 'john@email.com',
      password: '1234',
    };

    const response = await global.testRequest.post('/users').send(newUser);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      code: 422,
      error: 'User validation failed: name: Path `name` is required.',
    });
  });

  it('should return 409 when email already exists', async () => {
    const newUser = {
      name: 'Jhon Doe',
      email: 'john@email.com',
      password: '1234',
    };

    await global.testRequest.post('/users').send(newUser);
    const response = await global.testRequest.post('/users').send(newUser);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      code: 409,
      error: 'User validation failed: email: already exists in the database.',
    });
  });

  describe('when authenticating a user', () => {
    it('should generate a token for a valid user', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'john@email.com',
        password: '1234',
      };

      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });
      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('Should return UNAUTHORIZED if the user with the given email is not found', async () => {
      const User = {
        email: 'john@email.com',
        password: '1234',
      };
      const response = await global.testRequest
        .post('/users/authenticate')
        .send(User);

      expect(response.status).toBe(401);
    });

    it.only('Should return UNAUTHORIZED if the user is found but the password does not match', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'john@email.com',
        password: '1234',
      };

      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: '2312' });
      expect(response.status).toBe(401);
    });
  });
});
