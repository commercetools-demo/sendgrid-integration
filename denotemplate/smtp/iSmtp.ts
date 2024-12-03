export interface iSmtp {
   host: string
   port: number
   secure: boolean
   auth: {
      user: string
      pass: string
   }
   authMethod?: string
   logger?: boolean
   ignoreTLS?: boolean
}
