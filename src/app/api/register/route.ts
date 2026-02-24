import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  await connectToDatabase()

  const { email, username, password, inviteCode } = await req.json()

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

  // Look up inviter if a code was supplied
  let invitedByUsername = ''
  if (inviteCode && typeof inviteCode === 'string') {
    const inviter = await User.findOne({ inviteCode: inviteCode.trim() })
    if (inviter) invitedByUsername = inviter.username
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await User.create({
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password: hashedPassword,
    role: 'guest',
    approved: false,
    inviteCode: crypto.randomBytes(8).toString('hex'),
    invitedByUsername,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
