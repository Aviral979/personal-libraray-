import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUserRef = await addDoc(collection(db, "users"), {
      name,
      email,
      password: hashedPassword,
      role: "USER",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, userId: newUserRef.id }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
