from typing import Dict, Any
from app.graph.state import TestReport
from app.sandbox.virtual_fs import VirtualFileSystem
from app.sandbox.docker_runner import sandbox_engine

class TesterAgent:
    def __init__(self):
        self.name = "Tester Agent"

    def generate_and_run_tests(self, vfs: VirtualFileSystem, tech_stack: Dict[str, str]) -> TestReport:
        """
        Creates automated test harness files and executes sandbox suite.
        """
        test_file_content = """const request = require('supertest');
const app = require('../backend/src/server');

describe('Todo Application & Auth API Test Suite', () => {
  let authToken;

  test('1. Health Check Endpoint returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('healthy');
  });

  test('2. User Registration returns JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'alex@example.com', password: 'Password123!', name: 'Alex' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  test('3. Create Todo with valid title returns 201 Created', async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Deploy with Docker & Kubernetes', priority: 'high' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.title).toEqual('Deploy with Docker & Kubernetes');
  });

  test('4. Empty Todo Title returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '', priority: 'low' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBeDefined();
  });
});
"""
        vfs.write_file("tests/api.test.js", test_file_content, language="javascript", agent="tester")
        
        # Execute tests via isolated sandbox
        files_dict = {p: rec.content for p, rec in vfs.files.items()}
        report = sandbox_engine.execute_test_suite(files_dict, test_command="npm test -- tests/api.test.js")
        return report

tester_agent = TesterAgent()
