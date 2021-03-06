import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import { Admin, AdminRepository } from "../interfaces";
import {
  invalidLoginInformationError,
  invalidTokenError,
  notRefreshTokenError,
} from "../errors";

export default class AuthService {
  constructor(
    private adminRepository: AdminRepository,
    private jwtSecret: string
  ) {}

  public async signIn(
    admin: Admin
  ): Promise<{ access_token: string; refresh_token: string }> {
    const adminRecord = await this.adminRepository.findOneById(admin.id);

    if (
      !adminRecord ||
      AuthService.isInvalidPassword(adminRecord.pw, admin.pw)
    ) {
      throw invalidLoginInformationError;
    }

    const access_token = this.generateToken({
      id: adminRecord.id,
      type: "access",
    });
    const refresh_token = this.generateToken({
      id: adminRecord.id,
      type: "refresh",
    });

    return { access_token, refresh_token };
  }

  public tokenRefresh({
    refresh_token,
  }: {
    refresh_token: string;
  }): { access_token: string } {
    const splitToken = refresh_token.split(" ");
    if (splitToken[0] !== "Bearer") {
      throw invalidTokenError;
    }
    const refreshPayload: any = jwt.verify(splitToken[1], this.jwtSecret);
    if (refreshPayload.type !== "refresh") {
      throw notRefreshTokenError;
    }
    const access_token = this.generateToken({
      id: refreshPayload.id,
      type: "access",
    });
    return { access_token };
  }

  private generateToken({ id, type }: { id: string; type: string }) {
    return jwt.sign({ id, type }, this.jwtSecret, {
      expiresIn: type === "access" ? "30m" : type === "refresh" ? "7d" : 0,
    });
  }

  private static isInvalidPassword(
    dbPassword: string,
    inputPassword: string
  ): boolean {
    return !bcrypt.compareSync(inputPassword, dbPassword);
  }
}
