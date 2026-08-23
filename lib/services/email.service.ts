import { Resend } from "resend";

export class EmailService {
  static async sendPasswordResetEmail(
    email: string,
    prenom: string,
    resetLink: string
  ) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY n'est pas configurée."
      );
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "MarketMali <onboarding@resend.dev>",

      to: [email],

      subject:
        "Réinitialisation de votre mot de passe - MarketMali",

      html: `
        TON HTML ACTUEL ICI
      `,
    });

    if (error) {
      throw new Error(
        `Erreur lors de l'envoi de l'e-mail : ${error.message}`
      );
    }

    return data;
  }
}