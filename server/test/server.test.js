const request = require('supertest');
const app = require('../server'); // Import your Express app

describe('GET /get-posts', () => {
    it('should return a 200 status and expected data', async () => {
        const response = await request(app).get('/get-posts');
        // Check for status code
        expect(response.status).toBe(200);
        // Check for response body
        expect(response.body).toEqual({ /* expected data */ });
    });
});
