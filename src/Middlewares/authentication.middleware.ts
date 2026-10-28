import { NextFunction, Request, Response } from "express";
import { HUserDocument, userModel } from "../DB/Models/user.model";
import {
  getSignature,
  ITokenPayload,
  verifyToken,
} from "../Utils/Security/tokens.security";
import { RoleEnum } from "../Utils/enums/user.enum";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../Utils/response/error.response";

export enum TokenTypeEnum {
  access = "access",
  refresh = "refresh",
}

export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.access,
}: {
  authorization: string | undefined;
  tokenType: TokenTypeEnum;
}): Promise<{ user: HUserDocument; decoded: ITokenPayload }> => {
  const [Bearer, token] = authorization?.split(" ") || [];
  if (!Bearer || !token)
    throw new BadRequestException("Invalid authentication format in headers");

  const signature = getSignature({
    signatureLevel: Bearer === RoleEnum.ADMIN ? RoleEnum.ADMIN : RoleEnum.USER,
  });

  const decoded = verifyToken({
    token,
    secret:
      tokenType === TokenTypeEnum.access
        ? (signature.accessToken as string)
        : (signature.refreshToken as string),
  });

  const user = await userModel.findOne({ _id: decoded.id });
  if (!user) throw new Error("User not found");

  if (user.deletedAt) throw new NotFoundException("Account has been deleted");

  return { decoded, user };
};

export const authentication = ({
  tokenType = TokenTypeEnum.access,
}: {
  tokenType: TokenTypeEnum;
}) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { decoded, user } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType: tokenType,
      })) || {};

    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({
  accessRoles = [],
}: {
  accessRoles: RoleEnum[];
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
      throw new ForbiddenException("Unauthorized access, plz login");
    if (!accessRoles.includes(req.user?.role))
      throw new ForbiddenException("Unauthorized access");

    return next();
  };
};
