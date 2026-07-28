import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'
import User from '@/lib/models/User'
import ExcelJS from 'exceljs'
import { getDayName, formatDate } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { id?: string; role?: string }
  const sessionUserId = sessionUser.id
  if (!sessionUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectToDatabase()

  const url = new URL(req.url)
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'nl'
  const completedOnly = url.searchParams.get('completed') === 'true'

  // Guests use the same read-only admin logbook shown on the Days page. Exporting
  // the guest account itself produces an empty workbook because guests do not own
  // day records in the single-logbook account model.
  let targetUserId = sessionUserId
  if (sessionUser.role === 'guest') {
    const admin = await User.findOne({ role: 'admin' }, '_id').lean()
    if (admin) targetUserId = admin._id.toString()
  }

  const query: Record<string, unknown> = { userId: targetUserId }
  if (completedOnly) query.isComplete = true

  const [days, currentUser] = await Promise.all([
    Day.find(query).sort({ date: 1 }),
    User.findById(targetUserId, 'requiredHours username'),
  ])

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'ArcInternship'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(lang === 'nl' ? 'Stage Uren' : 'Internship Hours')

  // Title
  sheet.mergeCells('A1:I1')
  const titleCell = sheet.getCell('A1')
  titleCell.value = lang === 'nl'
    ? 'Stage Uren Overzicht – ArcInternship'
    : 'Internship Hours Overview – ArcInternship'
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(1).height = 36

  // Summary block
  const totalCompleted = days.filter(d => d.isComplete).reduce((sum, d) => sum + d.hours, 0)
  const target = currentUser?.requiredHours || 760
  const remaining = Math.max(0, target - totalCompleted)
  const pct = Math.min(100, Math.round((totalCompleted / target) * 100))

  sheet.mergeCells('A2:I2')
  sheet.getRow(2).height = 8

  const summaryLabels = lang === 'nl'
    ? ['Totaal gelopen:', 'Resterend:', 'Voortgang:', 'Doelstelling:']
    : ['Completed:', 'Remaining:', 'Progress:', 'Target:']

  sheet.getCell('A3').value = summaryLabels[0]
  sheet.getCell('B3').value = `${totalCompleted}u`
  sheet.getCell('C3').value = summaryLabels[1]
  sheet.getCell('D3').value = `${remaining}u`
  sheet.getCell('E3').value = summaryLabels[2]
  sheet.getCell('F3').value = `${pct}%`
  sheet.getCell('G3').value = summaryLabels[3]
  sheet.getCell('H3').value = `${target}u`
  ;[3].forEach(r => {
    for (let c = 1; c <= 9; c++) {
      const cell = sheet.getCell(r, c)
      cell.font = { bold: c % 2 === 1, size: 11 }
    }
  })

  sheet.getRow(4).height = 8

  // Headers
  const headers = lang === 'nl'
    ? ['Datum', 'Dag', 'Week', 'Type', 'Starttijd', 'Eindtijd', 'Uren', 'Activiteiten', 'Compleet']
    : ['Date', 'Day', 'Week', 'Type', 'Start Time', 'End Time', 'Hours', 'Activities', 'Complete']

  const headerRow = sheet.addRow(headers)
  headerRow.height = 24
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF2563EB' } },
    }
  })

  // Day type display
  const typeLabels: Record<string, Record<string, string>> = {
    nl: { werkdag: 'Werkdag', thuiswerk: 'Thuiswerk', vrij: 'Vrij', ziek: 'Ziek', feestdag: 'Feestdag' },
    en: { werkdag: 'Work Day', thuiswerk: 'Remote Work', vrij: 'Day Off', ziek: 'Sick', feestdag: 'Holiday' },
  }

  // Data rows
  let rowNum = 6
  days.forEach((day, idx) => {
    const isEven = idx % 2 === 0
    // The ISO date is canonical. Deriving the weekday here prevents stale values
    // from older seeded records from producing an incorrect day in the export.
    const dayOfWeek = new Date(`${day.date}T00:00:00`).getDay()
    const row = sheet.addRow([
      formatDate(day.date, lang),
      getDayName(dayOfWeek, lang, true),
      `Week ${day.weekNumber}`,
      typeLabels[lang][day.type] || day.type,
      ['vrij', 'ziek', 'feestdag'].includes(day.type) ? '-' : day.startTime,
      ['vrij', 'ziek', 'feestdag'].includes(day.type) ? '-' : day.endTime,
      day.hours,
      day.activities || '',
      lang === 'nl' ? (day.isComplete ? 'Ja' : 'Nee') : (day.isComplete ? 'Yes' : 'No'),
    ])
    row.height = 20
    row.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' },
      }
      cell.alignment = { vertical: 'middle' }
      cell.font = { size: 10 }
    })
    const completeCell = row.getCell(9)
    if (day.isComplete) {
      completeCell.font = { bold: true, color: { argb: 'FF16A34A' }, size: 10 }
    }
    rowNum++
  })

  // Total row
  const totalHours = days.reduce((sum, d) => sum + d.hours, 0)
  const totalRow = sheet.addRow([
    lang === 'nl' ? 'TOTAAL' : 'TOTAL',
    '', '', '', '', '',
    totalHours,
    '',
    '',
  ])
  totalRow.height = 24
  totalRow.eachCell(cell => {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  // Column widths
  sheet.columns = [
    { key: 'date', width: 14 },
    { key: 'day', width: 8 },
    { key: 'week', width: 10 },
    { key: 'type', width: 14 },
    { key: 'start', width: 12 },
    { key: 'end', width: 12 },
    { key: 'hours', width: 8 },
    { key: 'activities', width: 50 },
    { key: 'complete', width: 10 },
  ]

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ArcInternship_Stage_Uren.xlsx"`,
    },
  })
}
