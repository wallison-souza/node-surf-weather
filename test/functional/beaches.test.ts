describe('beaches functional tests', () => {
  describe('When creating a beache', () => {
    it('should create a beach with success', async () => {
       const newBeach = {
          lat: -33.792726,
          lng: 151.289824,
          nome: 'Manly',
          position: 'E'
       };

       const response = await global.testRequest.post('/beaches').send(newBeach);
       expect(response.status).toEqual(201);
       expect(response.body).toEqual(expect.objectContaining(newBeach));
    });
  });
});