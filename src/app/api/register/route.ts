import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  await connectToDatabase()

  const { email, username, password } = await req.json()

  if (!email || !username || !password) {
    return NextResponse.json({ error: 'Alle velden zijn verplicht' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Wachtwoord moet minimaal 8 tekens zijn' }, { status: 400 })
  }

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] })
  if (existing) {
    return NextResponse.json({ error: 'E-mail of gebruikersnaam is al in gebruik' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await User.create({
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password: hashedPassword,
    role: 'guest',
    approved: false,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
