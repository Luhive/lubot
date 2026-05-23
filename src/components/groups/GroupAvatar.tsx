import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Group } from '@/types'

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
}

interface GroupAvatarProps {
    group: Group
    className?: string
}

export function GroupAvatar({ group, className }: GroupAvatarProps) {
    const avatarSrc = group.telegram_chat_id
        ? `/api/groups/avatar?chatId=${encodeURIComponent(group.telegram_chat_id)}`
        : undefined

    return (
        <Avatar className={cn('h-8 w-8 shrink-0', className)}>
            {avatarSrc && <AvatarImage src={avatarSrc} alt={group.name} />}
            <AvatarFallback className="text-xs font-medium">
                {getInitials(group.name)}
            </AvatarFallback>
        </Avatar>
    )
}
