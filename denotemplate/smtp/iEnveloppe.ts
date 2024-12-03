interface iEmailAddress {
   name?: string
   address: string
}

export interface iEnveloppe {
   from: iEmailAddress
   to: iEmailAddress[]
   cc?: iEmailAddress[]
   bcc?: iEmailAddress[]
   subject: string
   text?: string
   html?: string
   attachments?: []
}
