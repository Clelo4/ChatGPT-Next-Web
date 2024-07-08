import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { returnError, returnForbidden, returnSuccess } from "../../common";
import { hashStringUsingSHA256 } from "@/app/utils/crypto";
import { query } from "../../db";
import { getServerSideConfig } from "@/app/config/server";

const serverConfig = getServerSideConfig();
const googleClientId = serverConfig.googleClientId;

interface GoogleVerifyData {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  nonce: string;
  nbf: number;
  iat: number;
  exp: number;
  jti: string;
  name: string;
  picture: string;
}

const client = new OAuth2Client();
async function verify(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: googleClientId, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  return payload as GoogleVerifyData;
}

export default async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[Auth Google Route] params ", params);
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  if (req.method === "GET") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const { token, csrfToken } = await req.json();

  const verifyRes = await verify(token);

  if (!verifyRes?.email) {
    return returnError("Login With Google Error");
  }
  if (verifyRes.email_verified !== true) {
    return returnError("Google email is not verified");
  }
  if (verifyRes.aud !== googleClientId) {
    return returnError("Google aud is not match");
  }
  if (verifyRes.iss !== "https://accounts.google.com") {
    return returnError("Google iss is not match");
  }
  if (verifyRes.exp < Math.floor(Date.now() / 1000)) {
    return returnError("Google token expired");
  }
  if ((await hashStringUsingSHA256(csrfToken)) !== verifyRes.nonce) {
    return returnForbidden("CSRF attack");
  }

  console.log("Google verifyRes", verifyRes);
  const { email, name, picture } = verifyRes || {};

  try {
    const dbRes = await query("select * from user where email = ?", [email]);
    console.log("dbRes", dbRes);
    if (dbRes?.length > 0) {
      return returnSuccess({ email, name, avatar: picture });
    } else {
      return returnError("Login With Google Error");
    }
  } catch (error: any) {
    return returnError(error?.message);
  }

  return returnError();
}

export const GET = handler;
export const POST = handler;

export const runtime = "nodejs";
