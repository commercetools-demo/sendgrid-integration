import {  Mail, MailtrapClient, TemplateVariables } from "mailtrap"
import { Order, sdk } from "@commercetoolsdemo/sdk"



const sendOrderConfirmation = async (order: Order): Promise<boolean> => {
  const TOKEN = Deno.env.get("API_TOKEN")!
  const TEST_INBOX_ID = parseInt(Deno.env.get("INBOX_ID")!)
  const ACCOUNT_ID = parseInt(Deno.env.get("ACCOUNT_ID")!)

  const sender = new MailtrapClient({ token: TOKEN, accountId: ACCOUNT_ID, testInboxId: TEST_INBOX_ID })

  const mailtrapaccount = await sender.general.accounts.getAllAccounts()
  const firstuser = mailtrapaccount[0]

  const email: Mail = {
    from: {name: firstuser.name, email: firstuser.name},
    to: [{name: order.customerEmail, email: order.customerEmail!}],
    template_uuid: "300c2b29-def0-479e-b722-fc47c78fde5d",
    template_variables: order as unknown as TemplateVariables
  }

  
  const response = await sender.testing.send(email)
  console.log(response)
  return response.success
}


if (import.meta.main) {
  const handle = sdk.init()
  const orders = await handle.root().orders().get({queryArgs: {limit: 100}}).execute().then(res => res.body.results)
  orders.map(order => {
    console.log(`#: ${order.orderNumber} licount: ${order.lineItems.length} clicount: ${order.customLineItems.length}`)
    if (order.lineItems.length > 3) Deno.writeTextFileSync("order.json", JSON.stringify(order, null, 3))
  })
  //console.log(order)
  //Deno.writeTextFileSync("order.json", JSON.stringify(order, null, 3))
  //await sendOrderConfirmation(order)
}
 