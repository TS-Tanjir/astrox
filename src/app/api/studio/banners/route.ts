import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const banner = await db.banner.create({
      data: {
        ...body,
        isActive: true,
      },
    });
    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    console.error("Banner create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isActive } = await request.json();
    const banner = await db.banner.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    console.error("Banner PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
