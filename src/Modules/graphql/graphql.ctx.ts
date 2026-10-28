import { HUserDocument } from "../../DB/Models/user.model";
import {
  decodedToken,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";

export interface IGraphQLCtx {
  user?: HUserDocument;
}

export const buildCtx = async (
  authorization: string | undefined,
): Promise<IGraphQLCtx> => {
  if (!authorization) return {};

  try {
    const { user } = await decodedToken({
      authorization,
      tokenType: TokenTypeEnum.access,
    });

    return { user };
  } catch (error) {
    return {};
  }
};
