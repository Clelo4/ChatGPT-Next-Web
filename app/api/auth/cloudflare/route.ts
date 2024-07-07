import { NextRequest, NextResponse } from "next/server";
import { jwtSign } from "../../common";

const SECRET_KEY = "0x4AAAAAAAeaY1X3RKMFtyg7vlnYSTxRrAw";

async function validateToken(token: string) {
  // Validate the token by calling the
  // "/siteverify" API endpoint.
  let formData = new FormData();
  formData.append("secret", SECRET_KEY);
  formData.append("response", token);

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const result = await fetch(url, {
    body: formData,
    method: "POST",
  });

  const outcome = await result.json();
  return outcome;
}

export default async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[Auth Cloudflare Route] params ", params);
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  if (req.method === "GET") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const { token } = await req.json();

  const verifyRes = await validateToken(token);

  console.debug("Cloudflare verifyRes", verifyRes);

  if (!verifyRes?.success) {
    return NextResponse.json(
      {
        errCode: 1,
        message: "You are bot",
      },
      { status: 403 },
    );
  }

  const jwtToken = jwtSign("cloudflare captcha", "");
  return NextResponse.json({ errCode: 0, data: { jwtToken } });
}

export const GET = handler;
export const POST = handler;

export const runtime = "nodejs";
