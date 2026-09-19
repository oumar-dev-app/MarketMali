import { NextRequest, NextResponse } from "next/server";

import { PaiementRepository } from "@/lib/repositories/paiement.repository";
import { PaiementWebhookEventRepository } from "@/lib/repositories/paiementWebhookEvent.repository";
import { PaiementService } from "@/lib/services/paiement.service";
import { CommandeService } from "@/lib/services/commande.service";

import {
  verifyWaveWebhookSignature,
  type WaveWebhookEvent,
  type WaveWebhookEventData,
} from "@/lib/payments/wave-webhook";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest
) {
  try {
    // =========================================================
    // 1. Lire le body brut
    // =========================================================

    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        {
          success: false,
          message: "Body webhook vide.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================
    // 2. Vérification de la configuration Wave
    // =========================================================

    const webhookSecret =
      process.env.WAVE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "WAVE_WEBHOOK_SECRET n'est pas configuré."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Webhook Wave non configuré.",
        },
        {
          status: 503,
        }
      );
    }

    // =========================================================
    // 3. Vérification de la signature Wave
    // =========================================================

    const waveSignature =
      request.headers.get(
        "Wave-Signature"
      );

    if (!waveSignature) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Signature Wave manquante.",
        },
        {
          status: 401,
        }
      );
    }

    const signatureValid =
      verifyWaveWebhookSignature(
        waveSignature,
        rawBody,
        webhookSecret
      );

    if (!signatureValid) {
      console.error(
        "Signature webhook Wave invalide."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Signature webhook invalide.",
        },
        {
          status: 401,
        }
      );
    }

    // =========================================================
    // 4. Parser le JSON après vérification
    // =========================================================

    let event: WaveWebhookEvent;

    try {
      event = JSON.parse(
        rawBody
      ) as WaveWebhookEvent;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payload JSON invalide.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================
    // 5. Vérifier la structure minimale
    // =========================================================

    if (
      !event.id ||
      !event.type ||
      !event.data
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payload Wave incomplet.",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      event.data as WaveWebhookEventData;

    // =========================================================
    // 6. Récupérer la référence MarketMali
    // =========================================================

    const referenceInterne =
      data.client_reference;

    if (!referenceInterne) {
      console.error(
        "Webhook Wave sans client_reference.",
        {
          eventId: event.id,
          eventType: event.type,
        }
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Événement reçu sans référence MarketMali.",
        },
        {
          status: 200,
        }
      );
    }

    // =========================================================
    // 7. Retrouver le paiement MarketMali
    // =========================================================

    const paiement =
      await PaiementRepository.findByReferenceInterne(
        referenceInterne
      );

    if (!paiement) {
      console.error(
        "Paiement MarketMali introuvable.",
        {
          referenceInterne,
          eventId: event.id,
        }
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Événement reçu mais paiement introuvable.",
        },
        {
          status: 200,
        }
      );
    }

    // =========================================================
    // 8. Vérifier le montant
    // =========================================================

    const montantWave =
      Number(data.amount);

    if (
      !Number.isFinite(montantWave) ||
      montantWave !== Number(paiement.montant)
    ) {
      console.error(
        "Montant Wave différent du montant MarketMali.",
        {
          paiementId: paiement.id,
          montantWave: data.amount,
          montantMarketMali:
            paiement.montant,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Montant du paiement invalide.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================
    // 9. Vérifier la devise
    // =========================================================

    if (
      data.currency &&
      data.currency !== paiement.devise
    ) {
      console.error(
        "Devise Wave différente de la devise MarketMali.",
        {
          paiementId: paiement.id,
          deviseWave: data.currency,
          deviseMarketMali:
            paiement.devise,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Devise du paiement invalide.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================
    // 10. Vérifier si cet événement Wave a déjà été traité
    // =========================================================

    const existingEvent =
      await PaiementWebhookEventRepository.findByProviderAndEventId(
        "wave",
        event.id
      );

    if (
      existingEvent?.processed_at
    ) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Événement Wave déjà traité.",
        },
        {
          status: 200,
        }
      );
    }

    // =========================================================
    // 11. Enregistrer l'événement Wave
    //
    // La contrainte UNIQUE(provider, event_id) protège
    // contre deux traitements simultanés du même événement.
    // =========================================================

    let webhookEvent =
      existingEvent;

    if (!webhookEvent) {
      webhookEvent =
        await PaiementWebhookEventRepository.createIfNotExists(
          {
            provider: "wave",
            event_id: event.id,
            event_type: event.type,
            paiement_id: paiement.id,
            reference_interne:
              referenceInterne,
            payload:
              event as unknown as Record<
                string,
                unknown
              >,
          }
        );

      // Une autre requête a pu créer le même événement
      // entre notre SELECT et notre INSERT.
      if (!webhookEvent) {
        webhookEvent =
          await PaiementWebhookEventRepository.findByProviderAndEventId(
            "wave",
            event.id
          );
      }
    }

    if (!webhookEvent) {
      console.error(
        "Impossible d'enregistrer l'événement webhook Wave.",
        {
          eventId: event.id,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Impossible d'enregistrer l'événement Wave.",
        },
        {
          status: 500,
        }
      );
    }

    // =========================================================
    // 12. Événement de paiement réussi
    // =========================================================

    if (
      event.type ===
      "checkout.session.completed"
    ) {
      if (
        data.payment_status !==
        "succeeded"
      ) {
        console.error(
          "Checkout complété mais paiement non réussi.",
          {
            paiementId:
              paiement.id,
            paymentStatus:
              data.payment_status,
          }
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Statut de paiement Wave invalide.",
          },
          {
            status: 400,
          }
        );
      }

      // -------------------------------------------------------
      // Le paiement est déjà payé
      // -------------------------------------------------------

      if (
        paiement.statut ===
        "paid"
      ) {
        await PaiementWebhookEventRepository.markAsProcessed(
          webhookEvent.id
        );

        return NextResponse.json(
          {
            success: true,
            message:
              "Paiement déjà confirmé.",
          },
          {
            status: 200,
          }
        );
      }

      // -------------------------------------------------------
      // Le paiement a déjà un autre statut final
      // -------------------------------------------------------

      if (
        paiement.statut !==
        "pending"
      ) {
        await PaiementWebhookEventRepository.markAsProcessed(
          webhookEvent.id
        );

        return NextResponse.json(
          {
            success: true,
            message:
              `Paiement déjà traité avec le statut "${paiement.statut}".`,
          },
          {
            status: 200,
          }
        );
      }

      // -------------------------------------------------------
      // Confirmation métier
      // -------------------------------------------------------

      await PaiementService.markAsPaid(
        paiement.uuid
      );

      // -------------------------------------------------------
      // Conserver les informations Wave
      // -------------------------------------------------------

      const metadata = {
        ...(paiement.metadata ?? {}),
        wave_webhook: {
          event_id: event.id,
          event_type: event.type,
          transaction_id:
            data.transaction_id ?? null,
          payment_status:
            data.payment_status ?? null,
          received_at:
            new Date().toISOString(),
        },
      };

      await PaiementRepository.updateMetadata(
        paiement.id,
        metadata
      );

      // -------------------------------------------------------
      // Marquer l'événement comme traité
      // -------------------------------------------------------

      await PaiementWebhookEventRepository.markAsProcessed(
        webhookEvent.id
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Paiement Wave confirmé.",
        },
        {
          status: 200,
        }
      );
    }

    // =========================================================
    // 13. Événement de paiement échoué
    // =========================================================

    if (
      event.type ===
      "checkout.session.payment_failed"
    ) {
      // -------------------------------------------------------
      // Paiement déjà échoué
      // -------------------------------------------------------

      if (
        paiement.statut ===
        "failed"
      ) {
        await PaiementWebhookEventRepository.markAsProcessed(
          webhookEvent.id
        );

        return NextResponse.json(
          {
            success: true,
            message:
              "Paiement déjà marqué comme échoué.",
          },
          {
            status: 200,
          }
        );
      }

      // -------------------------------------------------------
      // Paiement déjà traité autrement
      // -------------------------------------------------------

      if (
        paiement.statut !==
        "pending"
      ) {
        await PaiementWebhookEventRepository.markAsProcessed(
          webhookEvent.id
        );

        return NextResponse.json(
          {
            success: true,
            message:
              `Paiement déjà traité avec le statut "${paiement.statut}".`,
          },
          {
            status: 200,
          }
        );
      }

      // -------------------------------------------------------
      // Enregistrer l'échec
      // -------------------------------------------------------

      await PaiementService.markAsFailed(
        paiement.uuid
      );

      await CommandeService.cancelForPaymentFailure(
        paiement.commande_id
      );
      // -------------------------------------------------------
      // Conserver les informations Wave
      // -------------------------------------------------------

      const metadata = {
        ...(paiement.metadata ?? {}),
        wave_webhook: {
          event_id: event.id,
          event_type: event.type,
          transaction_id:
            data.transaction_id ?? null,
          payment_status:
            data.payment_status ?? null,
          received_at:
            new Date().toISOString(),
        },
      };

      await PaiementRepository.updateMetadata(
        paiement.id,
        metadata
      );

      // -------------------------------------------------------
      // Marquer l'événement comme traité
      // -------------------------------------------------------

      await PaiementWebhookEventRepository.markAsProcessed(
        webhookEvent.id
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Échec du paiement Wave enregistré.",
        },
        {
          status: 200,
        }
      );
    }

    // =========================================================
    // 14. Événement Wave non traité
    // =========================================================

    console.log(
      "Événement Wave non traité :",
      {
        eventId: event.id,
        eventType: event.type,
      }
    );

    // L'événement a été correctement reçu et enregistré,
    // même si MarketMali ne possède pas encore de traitement
    // métier pour ce type d'événement.
    await PaiementWebhookEventRepository.markAsProcessed(
      webhookEvent.id
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Événement Wave reçu.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "Erreur webhook Wave :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Erreur lors du traitement du webhook Wave.",
      },
      {
        status: 500,
      }
    );
  }
}
