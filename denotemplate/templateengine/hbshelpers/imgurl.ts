import { Image } from "@commercetoolsdemo/sdk"

export const imgurl = (images: Image[]): string => {
   return images[0].url
}