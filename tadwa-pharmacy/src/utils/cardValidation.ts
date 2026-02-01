export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let isEven = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10)
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }
  return sum % 10 === 0
}

export function validateExpiry(exp: string): boolean {
  const match = exp.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false
  const [, month, year] = match
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)
  if (m < 1 || m > 12) return false
  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1
  if (y < currentYear) return false
  if (y === currentYear && m < currentMonth) return false
  return true
}

export function validateCVV(cvv: string): boolean {
  const digits = cvv.replace(/\D/g, '')
  return digits.length >= 3 && digits.length <= 4
}
