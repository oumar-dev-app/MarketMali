import { LoginInput, loginSchema, RegisterInput, registerSchema } from "../validation";
import { UserRepository } from "../repositories/user.repository";
import { NotificationService } from "./notification.service";
import { hashPassword, comparePassword } from "../utils/password";
import { generateUUID } from "../utils/uuid";
import { generateToken } from "../jwt";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { ConflictError } from "../errors/ConflictError";
import { InternalServerError } from "../errors/InternalServerError";
import { EmailService } from "./email.service";
import crypto from "crypto";

import {
  PasswordResetTokenRepository,
} from "../repositories/password-reset-token.repository";


export class AuthService {

  static async login(data: LoginInput) {

    const validated = loginSchema.parse(data);

    const user = await UserRepository.findByEmail(
      validated.email
    );

    if (!user) {
      throw new UnauthorizedError(
        "Email ou mot de passe incorrect."
      );
    }

    const passwordCorrect = await comparePassword(
      validated.password,
      user.password
    );

    if (!passwordCorrect) {
      throw new UnauthorizedError(
        "Email ou mot de passe incorrect."
      );
    }

    if (user.status === "blocked") {
      throw new ForbiddenError(
        "Votre compte est bloqué."
      );
    }

    const token = generateToken({
      id: user.id,
      uuid: user.uuid,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        uuid: user.uuid,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        status: user.status,
      },
      token,
    };
  }

static async register(data: RegisterInput) {
  // 1. Validation
  const validated = registerSchema.parse(data);

  // 2. Vérifier si l'email existe
  const emailExists = await UserRepository.findByEmail(validated.email);

  if (emailExists) {
    throw new ConflictError(
      "Cette adresse e-mail est déjà utilisée."
    );
  }

  // 3. Vérifier si le téléphone existe
  const phoneExists = await UserRepository.findByTelephone(
    validated.telephone
  );

  if (phoneExists) {
    throw new ConflictError(
      "Ce numéro de téléphone est déjà utilisé."
    );
  }

  // 4. Hasher le mot de passe
  const hashedPassword = await hashPassword(validated.password);

  // 5. Générer un UUID
  const uuid = generateUUID();

  // 6. Créer l'utilisateur
  const userId = await UserRepository.create({
    uuid,
    nom: validated.nom,
    prenom: validated.prenom,
    email: validated.email,
    telephone: validated.telephone,
    password: hashedPassword,
  });

  // 7. Relire l'utilisateur
  const user = await UserRepository.findById(userId);

  if (!user) {
    throw new InternalServerError(
      "Impossible de récupérer l'utilisateur."
    );
  }

  // 8. Notifier le nouvel utilisateur
  await NotificationService.create({
    user_id: user.id,
    type: "role_request",
    titre: "Bienvenue sur MarketMali",
    message:
      "Bienvenue sur MarketMali ! Souhaitez-vous devenir vendeur ou livreur ?",
  });

  // 9. Générer le JWT
  const token = generateToken({
    id: user.id,
    uuid: user.uuid,
    role: user.role,
  });

  // 10. Retour
  return {
    user: {
      id: user.id,
      uuid: user.uuid,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      status: user.status,
    },
    token,
  };
}

  static async forgotPassword(
    email: string
  ) {

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await UserRepository.findByEmail(
        normalizedEmail
      );

    /*
     * Pour des raisons de sécurité,
     * on ne révèle pas si l'adresse existe.
     */
    if (!user) {
      return;
    }

    /*
     * Invalider les anciens tokens
     */
    await PasswordResetTokenRepository
      .invalidateUserTokens(user.id);

    /*
     * Générer un token aléatoire
     */
    const token =
      crypto.randomBytes(32).toString("hex");

    /*
     * Stocker uniquement le hash
     */
    const tokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    /*
     * Expiration : 30 minutes
     */
    const expiresAt =
      new Date(
        Date.now() + 30 * 60 * 1000
      );

    await PasswordResetTokenRepository.create(
      user.id,
      tokenHash,
      expiresAt
    );

    /*
     * Pour le moment, on retourne le token
     * uniquement pour permettre les tests.
     *
     * Cette partie sera remplacée par
     * l'envoi réel de l'e-mail.
     */
    const appUrl =
      process.env.APP_URL ||
      "http://localhost:3000";

    const resetLink =
      `${appUrl}/reset-password?token=${token}`;

    await EmailService.sendPasswordResetEmail(
      user.email,
      user.prenom,
      resetLink
    );

    return;
  }


  static async resetPassword(
    token: string,
    newPassword: string
  ) {

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const resetToken =
      await PasswordResetTokenRepository
        .findValidToken(tokenHash);

    if (!resetToken) {
      throw new UnauthorizedError(
        "Le lien de réinitialisation est invalide ou expiré."
      );
    }

    const hashedPassword =
      await hashPassword(newPassword);

    await UserRepository.update(
      resetToken.user_id,
      {
        password: hashedPassword,
      }
    );

    /*
     * Le token devient inutilisable
     */
    await PasswordResetTokenRepository
      .markAsUsed(resetToken.id);

    /*
     * Invalider également les éventuels
     * autres tokens de cet utilisateur.
     */
    await PasswordResetTokenRepository
      .invalidateUserTokens(
        resetToken.user_id
      );
  }
}