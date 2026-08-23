import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export class EmailService {
  static async sendPasswordResetEmail(
    email: string,
    prenom: string,
    resetLink: string
  ) {
    const { data, error } =
      await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL! ||
          "MarketMali <onboarding@resend.dev>",

        to: [email],

        subject:
          "Réinitialisation de votre mot de passe - MarketMali",

        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Réinitialisation du mot de passe</title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background: #f7f8fa;
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
            "
          >

            <div
              style="
                max-width: 600px;
                margin: 40px auto;
                padding: 20px;
              "
            >

              <div
                style="
                  background: white;
                  border-radius: 20px;
                  padding: 40px 30px;
                  border: 1px solid #e5e7eb;
                "
              >

                <div
                  style="
                    text-align: center;
                    margin-bottom: 30px;
                  "
                >
                  <div
                    style="
                      display: inline-block;
                      background: #14a800;
                      color: white;
                      padding: 12px 18px;
                      border-radius: 12px;
                      font-weight: bold;
                      font-size: 20px;
                    "
                  >
                    MarketMali
                  </div>
                </div>

                <h1
                  style="
                    font-size: 24px;
                    margin-bottom: 15px;
                  "
                >
                  Réinitialisation du mot de passe
                </h1>

                <p
                  style="
                    font-size: 15px;
                    line-height: 1.7;
                    color: #4b5563;
                  "
                >
                  Bonjour ${prenom},
                </p>

                <p
                  style="
                    font-size: 15px;
                    line-height: 1.7;
                    color: #4b5563;
                  "
                >
                  Nous avons reçu une demande de
                  réinitialisation du mot de passe de
                  votre compte MarketMali.
                </p>

                <p
                  style="
                    font-size: 15px;
                    line-height: 1.7;
                    color: #4b5563;
                  "
                >
                  Cliquez sur le bouton ci-dessous pour
                  choisir un nouveau mot de passe.
                </p>

                <div
                  style="
                    text-align: center;
                    margin: 30px 0;
                  "
                >
                  <a
                    href="${resetLink}"
                    style="
                      display: inline-block;
                      background: #14a800;
                      color: white;
                      text-decoration: none;
                      padding: 14px 24px;
                      border-radius: 10px;
                      font-weight: bold;
                      font-size: 14px;
                    "
                  >
                    Réinitialiser mon mot de passe
                  </a>
                </div>

                <p
                  style="
                    font-size: 13px;
                    line-height: 1.6;
                    color: #6b7280;
                  "
                >
                  Ce lien est valable pendant
                  <strong>30 minutes</strong>.
                </p>

                <p
                  style="
                    font-size: 13px;
                    line-height: 1.6;
                    color: #6b7280;
                  "
                >
                  Si vous n'êtes pas à l'origine de
                  cette demande, vous pouvez simplement
                  ignorer cet e-mail.
                </p>

                <hr
                  style="
                    border: 0;
                    border-top: 1px solid #e5e7eb;
                    margin: 30px 0;
                  "
                />

                <p
                  style="
                    margin: 0;
                    text-align: center;
                    font-size: 12px;
                    color: #9ca3af;
                  "
                >
                  MarketMali
                </p>

              </div>

            </div>

          </body>
          </html>
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
