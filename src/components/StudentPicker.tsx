'use client'

import { useRouter, usePathname } from 'next/navigation'
import { IUser } from '@/types'
import { GraduationCap, ChevronDown } from 'lucide-react'

interface Props {
  students: IUser[]
  selectedStudentId: string
  lang: string
}

export function StudentPicker({ students, selectedStudentId, lang }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  if (students.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-sm text-[var(--text-muted)]">
        <GraduationCap size={15} />
        {lang === 'nl' ? 'Geen studenten' : 'No students'}
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`${pathname}?student=${e.target.value}`)
  }

  const selected = students.find(s => s._id.toString() === selectedStudentId)

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] flex-shrink-0">
        <GraduationCap size={14} />
        <span className="hidden sm:inline">{lang === 'nl' ? 'Student:' : 'Student:'}</span>
      </div>
      <div className="relative">
        <select
          value={selectedStudentId}
          onChange={handleChange}
          className="appearance-none input text-sm pr-7 py-1.5 font-medium text-[var(--text-primary)] cursor-pointer"
        >
          {students.map(s => (
            <option key={s._id.toString()} value={s._id.toString()}>
              {s.username}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        />
      </div>
      {selected?.internshipPlace && (
        <span className="hidden md:inline text-xs text-[var(--text-muted)] truncate max-w-[140px]">
          · {selected.internshipPlace}
        </span>
      )}
    </div>
  )
}
