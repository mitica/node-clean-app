import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import ms, { StringValue } from "ms";
import { config } from "../../config/config";
import { EntityId } from "../../domain/base/types";

// ============================================================================
// Types
// ============================================================================

export interface JwtPayload {
  sub: EntityId;
  email: string;
  role: string;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
  jti?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
}

export type TokenVerifyResult =
  | { valid: true; payload: JwtPayload }
  | {
      valid: false;
      error: "expired" | "invalid" | "malformed";
      message: string;
    };

// ============================================================================
// Helpers
// ============================================================================

function getSecret(): string {
  if (config.jwt.secret) return config.jwt.secret;
  if (config.nodeEnv !== "development") {
    throw new Error("JWT_SECRET is required in non-development environments");
  }
  console.warn(
    "WARNING: Using default development JWT secret. Do NOT use in production!"
  );
  return "dev-secret-do-not-use-in-production";
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate access and refresh tokens for a user.
 */
export function generateTokenPair(
  userId: EntityId,
  email: string,
  role: string
): TokenPair {
  const secret = getSecret();
  const accessExpiry = config.jwt.accessTokenExpiresIn as StringValue;
  const refreshExpiry = config.jwt.refreshTokenExpiresIn as StringValue;

  const baseOptions: SignOptions = {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  };

  const accessToken = jwt.sign(
    { sub: userId, email, role, type: "access" } as JwtPayload,
    secret,
    { ...baseOptions, jwtid: uuidv4(), expiresIn: accessExpiry }
  );

  const refreshToken = jwt.sign(
    { sub: userId, email, role, type: "refresh" } as JwtPayload,
    secret,
    { ...baseOptions, jwtid: uuidv4(), expiresIn: refreshExpiry }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: ms(accessExpiry) / 1000,
    tokenType: "Bearer",
  };
}

/**
 * Verify an access token.
 */
export function verifyAccessToken(token: string): TokenVerifyResult {
  return verifyToken(token, "access");
}

/**
 * Verify a refresh token.
 */
export function verifyRefreshToken(token: string): TokenVerifyResult {
  return verifyToken(token, "refresh");
}

function verifyToken(
  token: string,
  expectedType: "access" | "refresh"
): TokenVerifyResult {
  const verifyOptions: VerifyOptions = {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  };

  try {
    const decoded = jwt.verify(
      token,
      getSecret(),
      verifyOptions
    ) as unknown as JwtPayload;

    if (decoded.type !== expectedType) {
      return {
        valid: false,
        error: "invalid",
        message: `Expected ${expectedType} token`,
      };
    }

    if (!decoded.sub || !decoded.email || !decoded.role) {
      return {
        valid: false,
        error: "malformed",
        message: "Missing required fields",
      };
    }

    return { valid: true, payload: decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: "expired", message: "Token has expired" };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: "invalid", message: error.message };
    }
    return {
      valid: false,
      error: "malformed",
      message: "Failed to verify token",
    };
  }
}
