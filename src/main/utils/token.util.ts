export function extractTokenFromHeader(request: Request): string {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new Error('Bearer token is missing');
    }
    return token;
  }