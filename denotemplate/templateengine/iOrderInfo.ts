import { Address, Order } from "@commercetoolsdemo/sdk"

export interface iOrderInfo {
   /** the locale that needs to be used to render the output */
   locale: string
   //** the information about the company that is sending the email */
   company: {
      /** the name of the company that is sending the email */
      name: string
      /** the logo of the company that is sending the email */
      logo: string
       /** the address of the company that is sending the email */
      address: Address
   },
   order: Order
}