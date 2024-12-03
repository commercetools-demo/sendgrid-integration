import nodemailer  from "nodemailer" // Import the Nodemailer library
import { iEnveloppe, } from "./iEnveloppe.ts"
import { iSmtp } from "./iSmtp.ts"

/**
 * Sends an email using smtp
 * @param smtp The smpt settings that are required to send out an email, defined in iSmtp
 * @param msg The message, in the as defined in iEnveloppe
 * @returns true on sucsses, false when fails
 * @example 
 * const msg: iEnveloppe = {
      from: {name: "test 1", address: "testone@commercetools.com"},
      to: [{name: "test 1 to", address: "testoneto@commercetools.com"}],
      subject: "test1 subject",
      text: "text1 text"
  }
  const result = await smtpSender(mailtrapconfig, msg)
  console.log(result)
 */
export const smtpSender = async (smtp: iSmtp, msg: iEnveloppe): Promise<boolean> => {
   try {
      const transporter = nodemailer.createTransport(smtp)
      const result = await transporter.sendMail(msg)
      if (result && result.accepted && result.accepted.length) return true
   }
   catch (_error) {
      throw _error
   }
   return false
   
}