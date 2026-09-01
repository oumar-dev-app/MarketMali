import {
  createHash,
  randomBytes,
  randomInt,
} from "crypto";

import { PoolConnection } from "mysql2/promise";

import {
  LivraisonSecuriteRepository,
} from "../repositories/livraison-securite.repository";

import {
  LivraisonRepository,
} from "../repositories/livraison.repository";

import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";


export class LivraisonSecuriteService {

  /**
   * Durée de validité de l'OTP.
   */
  private static readonly OTP_VALIDITY_MINUTES = 10;


  /**
   * SHA-256.
   */
  private static hash(
    value: string
  ): string {

    return createHash("sha256")
      .update(value, "utf8")
      .digest("hex");
  }


  /**
   * Générer un token QR.
   */
  private static generateQrToken(): string {

    return randomBytes(32)
      .toString("hex");
  }


  /**
   * Générer un OTP à 6 chiffres.
   */
  private static generateOtp(): string {

    return randomInt(
      100000,
      1000000
    ).toString();
  }


  /**
   * Calculer l'expiration de l'OTP.
   */
  private static getOtpExpiration(): Date {

    const expiration =
      new Date();

    expiration.setMinutes(
      expiration.getMinutes() +
      this.OTP_VALIDITY_MINUTES
    );

    return expiration;
  }


  /**
   * Générer le QR de récupération.
   *
   * Cette méthode est appelée lorsque
   * le livreur est affecté à la commande.
   *
   * Aucun OTP n'est généré ici.
   */
  static async generatePickupQr(
    livraison_id: number,
    connection?: PoolConnection
  ) {

    const livraison =
      await LivraisonRepository.findById(
        livraison_id,
        connection
      );

    if (!livraison) {
      throw new NotFoundError(
        "Livraison introuvable."
      );
    }

    if (
      livraison.status !== "assigned"
    ) {
      throw new ForbiddenError(
        "Le QR de récupération ne peut être généré que pour une livraison affectée."
      );
    }

    const qrToken =
      this.generateQrToken();

    const qrTokenHash =
      this.hash(qrToken);

    const existing =
      await LivraisonSecuriteRepository.findByLivraisonId(
        livraison_id,
        connection
      );

    if (existing) {

      await LivraisonSecuriteRepository.updateQr(
        existing.id,
        qrTokenHash,
        connection
      );

    } else {

      await LivraisonSecuriteRepository.create(
        {
          livraison_id,
          qr_token_hash: qrTokenHash,
        },
        connection
      );
    }

    return {
      qrToken,
    };
  }


  /**
   * Générer l'OTP de confirmation
   * de réception par le client.
   */
  static async generateDeliveryOtp(
    livraison_id: number,
    connection?: PoolConnection
  ) {

    const livraison =
      await LivraisonRepository.findById(
        livraison_id,
        connection
      );

    if (!livraison) {
      throw new NotFoundError(
        "Livraison introuvable."
      );
    }

    if (
      livraison.status !==
      "delivery_pending_confirmation"
    ) {
      throw new ForbiddenError(
        "L'OTP ne peut être généré que lorsque la livraison est en attente de confirmation."
      );
    }

    const securite =
      await LivraisonSecuriteRepository.findByLivraisonId(
        livraison_id,
        connection
      );

    if (!securite) {
      throw new NotFoundError(
        "Informations de sécurité introuvables pour cette livraison."
      );
    }

    const otp =
      this.generateOtp();

    const otpHash =
      this.hash(otp);

    const otpExpiresAt =
      this.getOtpExpiration();

    await LivraisonSecuriteRepository.updateOtp(
      securite.id,
      {
        otp_hash: otpHash,
        otp_expires_at: otpExpiresAt,
      },
      connection
    );

    return {
      otp,
      otpExpiresAt,
    };
  }


  /**
   * Vérifier et consommer le QR
   * lors de la récupération du colis.
   */
  static async verifyPickupQr(
    qrToken: string,
    connection?: PoolConnection
  ) {

    const token =
      qrToken.trim();

    if (!token) {
      throw new ForbiddenError(
        "Token QR invalide."
      );
    }

    const qrTokenHash =
      this.hash(token);

    const securite =
      await LivraisonSecuriteRepository.findByQrTokenHash(
        qrTokenHash,
        connection
      );

    if (!securite) {
      throw new ForbiddenError(
        "QR invalide."
      );
    }

    if (securite.qr_used_at) {
      throw new ForbiddenError(
        "Ce QR a déjà été utilisé."
      );
    }

    const livraison =
      await LivraisonRepository.findById(
        securite.livraison_id,
        connection
      );

    if (!livraison) {
      throw new NotFoundError(
        "Livraison introuvable."
      );
    }

    if (
      livraison.status !== "assigned"
    ) {
      throw new ForbiddenError(
        "Cette livraison n'est plus en attente de récupération."
      );
    }

    const used =
      await LivraisonSecuriteRepository.markQrAsUsed(
        securite.id,
        connection
      );

    if (!used) {
      throw new ForbiddenError(
        "Ce QR a déjà été utilisé."
      );
    }

    return {
      success: true,
      livraison_id: livraison.id,
    };
  }


  /**
   * Vérifier et consommer l'OTP.
   */
  static async verifyOtp(
    otp: string,
    livraison_id: number,
    connection?: PoolConnection
  ) {

    const value =
      otp.trim();

    if (
      !/^\d{6}$/.test(value)
    ) {
      throw new ForbiddenError(
        "Le code OTP doit contenir exactement 6 chiffres."
      );
    }

    const securite =
      await LivraisonSecuriteRepository.findByLivraisonId(
        livraison_id,
        connection
      );

    if (!securite) {
      throw new NotFoundError(
        "Informations de sécurité introuvables pour cette livraison."
      );
    }

    if (!securite.otp_hash) {
      throw new ForbiddenError(
        "Aucun code OTP n'est disponible pour cette livraison."
      );
    }

    if (securite.otp_used_at) {
      throw new ForbiddenError(
        "Ce code OTP a déjà été utilisé."
      );
    }

    if (
      !securite.otp_expires_at ||
      new Date(
        securite.otp_expires_at
      ).getTime() <= Date.now()
    ) {
      throw new ForbiddenError(
        "Le code OTP a expiré."
      );
    }

    const otpHash =
      this.hash(value);

    if (
      otpHash !==
      securite.otp_hash
    ) {
      throw new ForbiddenError(
        "Code OTP incorrect."
      );
    }
    

    const used =
      await LivraisonSecuriteRepository.markOtpAsUsed(
        securite.id,
        connection
      );

    if (!used) {
      throw new ForbiddenError(
        "Ce code OTP a déjà été utilisé."
      );
    }

    return {
      success: true,
    };
  }
}