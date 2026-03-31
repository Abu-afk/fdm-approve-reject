import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export function signToken(payload: { employeeId: string; role: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): { employeeId: string; role: string } {
  return jwt.verify(token, SECRET) as { employeeId: string; role: string };
}
