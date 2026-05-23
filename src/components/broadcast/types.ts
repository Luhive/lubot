export type MockAttachment =
    | { id: string; type: 'image'; filename: string; size: string }
    | { id: string; type: 'voice'; duration: string }

export interface BroadcastComposerPayload {
    groupIds: string[]
    message: string
    scheduledAt?: string
}
