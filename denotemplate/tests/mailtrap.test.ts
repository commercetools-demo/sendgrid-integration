import { mailtrapconfig } from "../config/mailtrapconfig.ts"
import { iEnveloppe } from "../smtp/iEnveloppe.ts"
import { smtpSender } from "../smtp/smtpSender.ts"
import { expect } from "jsr:@std/expect"

Deno.test("Test 1: send a text message to a single recipient", async () => {
   const msg: iEnveloppe = {
      from: {name: "test 1", address: "testone@commercetools.com"},
      to: [{name: "test 1 to", address: "testoneto@commercetools.com"}],
      subject: "test1 subject",
      text: "text1 text"
   }
   const result = await smtpSender(mailtrapconfig, msg)
   expect(result).toBe(true)
})

Deno.test("Test2: send a text message to a multiple recipients", async () => {
   const msg: iEnveloppe = {
      from: {name: "test 2", address: "testtwo@commercetools.com"},
      to: [{name: "test 2 to 1", address: "testtwotoone@commercetools.com"},
           {name: "test 2 to 2", address: "testtwototwo@commercetools.com"}
      ],
      subject: "test2 subject",
      text: "text2 text"
   }
   const result = await smtpSender(mailtrapconfig, msg)
   expect(result).toBe(true)
})

Deno.test("Test3: send a text message to a multiple recipients, only email addresses", async () => {
   const msg: iEnveloppe = {
      from: {address: "testthree@commercetools.com"},
      to: [{address: "testthreetoone@commercetools.com"},
           {address: "testthreetotwo@commercetools.com"}
      ],
      subject: "test3 subject",
      text: "text3 text"
   }
   const result = await smtpSender(mailtrapconfig, msg)
   expect(result).toBe(true)
})

Deno.test("Test4: send a text and html message to a multiple recipients, only email addresses and to cc and bcc", async () => {
   const msg: iEnveloppe = {
      from: {address: "testfour@commercetools.com"},
      to: [{address: "testfourtoone@commercetools.com"},
           {address: "testfourtotwo@commercetools.com"}
      ],
      cc: [{address: "testfourccone@commercetools.com"},
         {address: "testfourcctwo@commercetools.com"}
      ],
      bcc: [{address: "testfourbccone@commercetools.com"},
         {address: "testfourbccwo@commercetools.com"}
      ],
      subject: "test4 subject",
      text: "text4 text",
      html: "<h1>text4 html</h1>"
   }
   const result = await smtpSender(mailtrapconfig, msg)
   expect(result).toBe(true)
})
