import { InviteLanding } from '@/components/InviteLanding'

interface Props {
  params: { code: string }
}

export default function InviteCodePage({ params }: Props) {
  return <InviteLanding inviteCode={params.code} />
}
