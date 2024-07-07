import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "../../db";
import { returnNoAuth } from "../../common";

export default async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  if (req.method === "GET") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const cookieStore = cookies();
  const sessionId = cookieStore.get("session_id");

  if (!sessionId) {
    return returnNoAuth();
  }

  const verifyRes = await query("select * from user", []);

  return NextResponse.json(verifyRes);
}

export const GET = handler;
export const POST = handler;

export const runtime = "nodejs";
