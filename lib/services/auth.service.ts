import { LoginInput, loginSchema, RegisterInput, registerSchema } from "../validation";
import { UserRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { generateUUID } from "../utils/uuid";
import { generateToken } from "../jwt";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { ConflictError } from "../errors/ConflictError";
import { InternalServerError } from "../errors/InternalServerError";


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

    // 8. Générer le JWT
    const token = generateToken({
      id: user.id,
      uuid: user.uuid,
      role: user.role,
    });

    // 9. Retour
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
}