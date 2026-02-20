import request from 'supertest';
import app from '../app';

describe('Health Check', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/api/v1/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'success');
    });
});
