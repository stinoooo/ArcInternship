import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import { generatePassword } from '@/lib/utils'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as { role?: string }
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectToDatabase()
  const users = await User.find({}, '-password').sort({ createdAt: 1 })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { role?: string }
  if (sessionUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectToDatabase()
  const { email, username, role } = await req.json()

  const tempPassword = generatePassword()
  const hashedPassword = await bcrypt.hash(tempPassword, 12)

  const user = await User.create({
    email,
    username,
    password: hashedPassword,
    role: role || 'guest',
  })

  // Send welcome email
  try {
    await resend.emails.send({
      from: 'ArcInternship <noreply@stinoo.dev>',
      to: email,
      subject: 'Welkom bij ArcInternship / Welcome to ArcInternship',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563EB; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ArcInternship</h1>
          </div>
          <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a;">Je account is aangemaakt / Your account has been created</h2>
            <p style="color: #475569;">Hieronder vind je je inloggegevens:</p>
            <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>URL:</strong> ${process.env.NEXTAUTH_URL}</p>
              <p style="margin: 4px 0;"><strong>Gebruikersnaam / Username:</strong> ${username}</p>
              <p style="margin: 4px 0;"><strong>E-mail:</strong> ${email}</p>
              <p style="margin: 4px 0;"><strong>Wachtwoord / Password:</strong> ${tempPassword}</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">Part of the ArcNode Network & Stinoo Network</p>
          </div>
        </div>
      `,
    })
  } catch (emailError) {
    console.error('Email send failed:', emailError)
  }

  return NextResponse.json({ ...user.toObject(), password: undefined }, { status: 201 })
}
