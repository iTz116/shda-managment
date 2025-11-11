// app/api/admin/create/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // ✅ اجلب الجلسة بالطريقة الصحيحة من API
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // ✅ أنشئ مستخدم جديد عبر واجهة الـ admin
    const newUser = await auth.api.createUser({
      body: {
        email,
        password,
        name: name || "",
        role: "admin",
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
