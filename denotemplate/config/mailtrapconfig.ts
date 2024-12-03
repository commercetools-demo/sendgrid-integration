import { iSmtp } from "../smtp/iSmtp.ts"

/**
 * this is a tested configuration for mailtrap. Replace auth details for your own mailbox
 */
export const mailtrapconfig: iSmtp = {
   host: "sandbox.smtp.mailtrap.io",
   port: 2525,
   secure: false,
   auth: {
      user: "ff7682efeffaba",
      pass: "6fc3839f79eda7"
   },
   authMethod: "PLAIN",
   logger: false,
   ignoreTLS: true
}

