import * as sinon from "sinon";
import * as jwt from "jsonwebtoken";
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { AuthService } from "../services";
import { FakeAdminRepository, fakeLogger } from "./fakes";
import { IAdmin } from "../interfaces";
import { invalidLoginInformationError } from "../errors";

use(chaiAsPromised);

describe("AuthService", () => {
  const jwtSecret = "venus_test";
  let stub;
  const authService = new AuthService(
    new FakeAdminRepository(),
    fakeLogger,
    jwtSecret
  );

  beforeEach(() => {
    stub = sinon.stub(jwt, "sign");
  });

  afterEach(() => {
    stub.restore();
  });

  it("should return token with valid id and pw", async () => {
    const expectedResult = {
      access_token: "access_token",
      refresh_token: "refresh_token",
    };
    const admin: IAdmin = { id: "admin", pw: "validpass" };

    stub
      .withArgs({ id: "admin", type: "access" }, jwtSecret, {
        expiresIn: "30m",
      })
      .returns("access_token")
      .withArgs({ id: "admin", type: "refresh" }, jwtSecret, {
        expiresIn: "14d",
      })
      .returns("refresh_token");

    const result = await authService.signIn(admin);
    expect(result).to.deep.equal(expectedResult);
  });

  it("should throw invalid login info error with invalid id", () => {
    const admin: IAdmin = { id: "invalid", pw: "validpass" };

    expect(authService.signIn(admin)).to.be.rejectedWith(
      invalidLoginInformationError
    );
  });

  it("should throw invalid login info error with invalid pw", () => {
    const admin: IAdmin = { id: "admin", pw: "invalidpass" };

    expect(authService.signIn(admin)).to.be.rejectedWith(
      invalidLoginInformationError
    );
  });
});