import type { Price, TypedMoney } from "@commercetoolsdemo/sdk"

export const formatMoney = (money: TypedMoney | undefined, locale: string): string => {
	if (money === undefined) return ""
	let amount = ""
	if (money.type && money.type === "highPrecision") {
		amount = (money.preciseAmount / (10 ** money.fractionDigits)).toLocaleString(locale, {
			style: "currency",
			currency: money.currencyCode,
			minimumFractionDigits: money.fractionDigits,
			maximumFractionDigits: money.fractionDigits,
		})
	}
	if (money.type && money.type === "centPrecision") {
		amount = (money.centAmount / 100).toLocaleString(locale, {
			style: "currency",
			currency: money.currencyCode,
			minimumFractionDigits: money.fractionDigits,
			maximumFractionDigits: money.fractionDigits,
		})
	}
	return `${amount}`
}

export const getPriceValue = (price: Price | undefined, locale: string): string | undefined => {
	if (!price || !price.value) return undefined
	const normal = price.discounted ? formatMoney(price.value, locale) : formatMoney(price.value, locale)
	const discounted = price.discounted ? formatMoney(price.discounted.value, locale) : ""

	return `${normal} ${discounted}`
}
