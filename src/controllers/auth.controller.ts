import type { Request, Response } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import type { LoginBody, RegisterBody } from '../schemas/auth.schema';
import type { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from '../utils/cookies';

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await this.auth.register(req.body as RegisterBody);
    setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
    res.status(201).json({ data: { user, accessToken: tokens.accessToken } });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginBody;
    const { user, tokens } = await this.auth.login(email, password);
    setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
    res.json({ data: { user, accessToken: tokens.accessToken } });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = readRefreshCookie(req);
    if (!refreshToken) {
      throw new UnauthorizedError('Sesi berakhir, silakan masuk kembali');
    }
    const { user, tokens } = await this.auth.refresh(refreshToken);
    setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
    res.json({ data: { user, accessToken: tokens.accessToken } });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await this.auth.logout(readRefreshCookie(req));
    clearRefreshCookie(res);
    res.status(204).send();
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.auth.me(req.user!.sub);
    res.json({ data: { user } });
  });
}
