/** Single source of truth for public contact details. */
export const SUPPORT_PHONE_DISPLAY = "+91 98196 16789";
export const SUPPORT_PHONE_E164 = "+919819616789";
export const SUPPORT_WHATSAPP = "919819616789"; // wa.me format: country code + number, no plus

/** wa.me deep link with a prefilled message. */
export function whatsappUrl(message: string, phone: string = SUPPORT_WHATSAPP) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_ENQUIRY = `Hi VisaSetGo 👋

I'd like help with a visa application.

Destination: 
Travel dates: 
Number of travellers: 
Visa type (tourist/business): 

Thanks!`;
