// ESA LIFE CEO 61x21 - Phase 15: Backend i18n Support

interface Translation {
  [key: string]: string | Translation;
}

const translations: Record<string, Translation> = {
  es: {
    errors: {
      generic: 'Algo salió mal. Por favor intente de nuevo.',
      notFound: 'No encontrado',
      unauthorized: 'No autorizado',
      forbidden: 'Acceso denegado',
      validation: 'Error de validación',
      serverError: 'Error del servidor',
      databaseError: 'Error de base de datos',
      networkError: 'Error de red',
      timeout: 'Tiempo de espera agotado',
      invalidCredentials: 'Credenciales inválidas',
      emailNotVerified: 'Email no verificado',
      accountLocked: 'Cuenta bloqueada',
      tooManyRequests: 'Demasiadas solicitudes',
      sessionExpired: 'Sesión expirada',
      invalidToken: 'Token inválido',
      duplicateEntry: 'Esta entrada ya existe',
      insufficientPermissions: 'Permisos insuficientes',
      paymentRequired: 'Pago requerido',
      subscriptionExpired: 'Suscripción expirada'
    },
    success: {
      created: 'Creado exitosamente',
      updated: 'Actualizado exitosamente',
      deleted: 'Eliminado exitosamente',
      saved: 'Guardado exitosamente',
      sent: 'Enviado exitosamente',
      uploaded: 'Subido exitosamente',
      processed: 'Procesado exitosamente',
      completed: 'Completado exitosamente',
      activated: 'Activado exitosamente',
      deactivated: 'Desactivado exitosamente'
    },
    emails: {
      welcome: {
        subject: 'Bienvenido a Mundo Tango',
        greeting: 'Hola {{name}}',
        body: 'Bienvenido a la comunidad global del tango.',
        action: 'Comenzar',
        footer: 'Gracias por unirte a nosotros'
      },
      verification: {
        subject: 'Verifica tu email',
        greeting: 'Hola {{name}}',
        body: 'Por favor verifica tu dirección de email haciendo clic en el enlace a continuación.',
        action: 'Verificar Email',
        footer: 'Este enlace expirará en 24 horas'
      },
      passwordReset: {
        subject: 'Restablecer contraseña',
        greeting: 'Hola {{name}}',
        body: 'Recibimos una solicitud para restablecer tu contraseña.',
        action: 'Restablecer Contraseña',
        footer: 'Si no solicitaste esto, ignora este email'
      },
      eventReminder: {
        subject: 'Recordatorio: {{eventName}}',
        greeting: 'Hola {{name}}',
        body: 'Te recordamos que {{eventName}} es {{date}}.',
        action: 'Ver Evento',
        footer: 'No te lo pierdas'
      },
      friendRequest: {
        subject: '{{name}} quiere ser tu amigo',
        greeting: 'Hola {{recipientName}}',
        body: '{{senderName}} te ha enviado una solicitud de amistad.',
        action: 'Ver Solicitud',
        footer: 'Conecta con la comunidad'
      }
    },
    api: {
      user: {
        created: 'Usuario creado exitosamente',
        updated: 'Perfil actualizado',
        deleted: 'Usuario eliminado',
        notFound: 'Usuario no encontrado',
        alreadyExists: 'El usuario ya existe',
        invalidData: 'Datos de usuario inválidos'
      },
      event: {
        created: 'Evento creado exitosamente',
        updated: 'Evento actualizado',
        deleted: 'Evento eliminado',
        notFound: 'Evento no encontrado',
        full: 'El evento está lleno',
        cancelled: 'Evento cancelado',
        rsvpConfirmed: 'Asistencia confirmada',
        rsvpCancelled: 'Asistencia cancelada'
      },
      auth: {
        loginSuccess: 'Inicio de sesión exitoso',
        logoutSuccess: 'Sesión cerrada',
        tokenRefreshed: 'Token actualizado',
        invalidToken: 'Token inválido',
        tokenExpired: 'Token expirado',
        unauthorized: 'No autorizado',
        twoFactorRequired: 'Se requiere autenticación de dos factores',
        twoFactorInvalid: 'Código de dos factores inválido'
      }
    }
  },
  en: {
    errors: {
      generic: 'Something went wrong. Please try again.',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      forbidden: 'Access denied',
      validation: 'Validation error',
      serverError: 'Server error',
      databaseError: 'Database error',
      networkError: 'Network error',
      timeout: 'Request timeout',
      invalidCredentials: 'Invalid credentials',
      emailNotVerified: 'Email not verified',
      accountLocked: 'Account locked',
      tooManyRequests: 'Too many requests',
      sessionExpired: 'Session expired',
      invalidToken: 'Invalid token',
      duplicateEntry: 'This entry already exists',
      insufficientPermissions: 'Insufficient permissions',
      paymentRequired: 'Payment required',
      subscriptionExpired: 'Subscription expired'
    },
    success: {
      created: 'Created successfully',
      updated: 'Updated successfully',
      deleted: 'Deleted successfully',
      saved: 'Saved successfully',
      sent: 'Sent successfully',
      uploaded: 'Uploaded successfully',
      processed: 'Processed successfully',
      completed: 'Completed successfully',
      activated: 'Activated successfully',
      deactivated: 'Deactivated successfully'
    },
    emails: {
      welcome: {
        subject: 'Welcome to Mundo Tango',
        greeting: 'Hello {{name}}',
        body: 'Welcome to the global tango community.',
        action: 'Get Started',
        footer: 'Thank you for joining us'
      },
      verification: {
        subject: 'Verify your email',
        greeting: 'Hello {{name}}',
        body: 'Please verify your email address by clicking the link below.',
        action: 'Verify Email',
        footer: 'This link will expire in 24 hours'
      },
      passwordReset: {
        subject: 'Reset your password',
        greeting: 'Hello {{name}}',
        body: 'We received a request to reset your password.',
        action: 'Reset Password',
        footer: 'If you didn\'t request this, please ignore this email'
      },
      eventReminder: {
        subject: 'Reminder: {{eventName}}',
        greeting: 'Hello {{name}}',
        body: 'This is a reminder that {{eventName}} is on {{date}}.',
        action: 'View Event',
        footer: 'Don\'t miss it'
      },
      friendRequest: {
        subject: '{{name}} wants to be your friend',
        greeting: 'Hello {{recipientName}}',
        body: '{{senderName}} has sent you a friend request.',
        action: 'View Request',
        footer: 'Connect with the community'
      }
    },
    api: {
      user: {
        created: 'User created successfully',
        updated: 'Profile updated',
        deleted: 'User deleted',
        notFound: 'User not found',
        alreadyExists: 'User already exists',
        invalidData: 'Invalid user data'
      },
      event: {
        created: 'Event created successfully',
        updated: 'Event updated',
        deleted: 'Event deleted',
        notFound: 'Event not found',
        full: 'Event is full',
        cancelled: 'Event cancelled',
        rsvpConfirmed: 'RSVP confirmed',
        rsvpCancelled: 'RSVP cancelled'
      },
      auth: {
        loginSuccess: 'Login successful',
        logoutSuccess: 'Logout successful',
        tokenRefreshed: 'Token refreshed',
        invalidToken: 'Invalid token',
        tokenExpired: 'Token expired',
        unauthorized: 'Unauthorized',
        twoFactorRequired: 'Two-factor authentication required',
        twoFactorInvalid: 'Invalid two-factor code'
      }
    }
  },
  pt: {
    errors: {
      generic: 'Algo deu errado. Por favor, tente novamente.',
      notFound: 'Não encontrado',
      unauthorized: 'Não autorizado',
      forbidden: 'Acesso negado',
      validation: 'Erro de validação',
      serverError: 'Erro do servidor',
      databaseError: 'Erro de banco de dados',
      networkError: 'Erro de rede',
      timeout: 'Tempo limite excedido',
      invalidCredentials: 'Credenciais inválidas',
      emailNotVerified: 'Email não verificado',
      accountLocked: 'Conta bloqueada',
      tooManyRequests: 'Muitas solicitações',
      sessionExpired: 'Sessão expirada',
      invalidToken: 'Token inválido',
      duplicateEntry: 'Esta entrada já existe',
      insufficientPermissions: 'Permissões insuficientes',
      paymentRequired: 'Pagamento necessário',
      subscriptionExpired: 'Assinatura expirada'
    },
    success: {
      created: 'Criado com sucesso',
      updated: 'Atualizado com sucesso',
      deleted: 'Excluído com sucesso',
      saved: 'Salvo com sucesso',
      sent: 'Enviado com sucesso',
      uploaded: 'Enviado com sucesso',
      processed: 'Processado com sucesso',
      completed: 'Concluído com sucesso',
      activated: 'Ativado com sucesso',
      deactivated: 'Desativado com sucesso'
    }
  },
  fr: {
    errors: {
      generic: 'Une erreur s\'est produite. Veuillez réessayer.',
      notFound: 'Non trouvé',
      unauthorized: 'Non autorisé',
      forbidden: 'Accès refusé',
      validation: 'Erreur de validation',
      serverError: 'Erreur du serveur',
      databaseError: 'Erreur de base de données',
      networkError: 'Erreur réseau',
      timeout: 'Délai d\'attente dépassé',
      invalidCredentials: 'Identifiants invalides',
      emailNotVerified: 'Email non vérifié',
      accountLocked: 'Compte verrouillé',
      tooManyRequests: 'Trop de demandes',
      sessionExpired: 'Session expirée',
      invalidToken: 'Jeton invalide',
      duplicateEntry: 'Cette entrée existe déjà',
      insufficientPermissions: 'Permissions insuffisantes',
      paymentRequired: 'Paiement requis',
      subscriptionExpired: 'Abonnement expiré'
    },
    success: {
      created: 'Créé avec succès',
      updated: 'Mis à jour avec succès',
      deleted: 'Supprimé avec succès',
      saved: 'Enregistré avec succès',
      sent: 'Envoyé avec succès',
      uploaded: 'Téléchargé avec succès',
      processed: 'Traité avec succès',
      completed: 'Terminé avec succès',
      activated: 'Activé avec succès',
      deactivated: 'Désactivé avec succès'
    }
  },
  it: {
    errors: {
      generic: 'Qualcosa è andato storto. Riprova.',
      notFound: 'Non trovato',
      unauthorized: 'Non autorizzato',
      forbidden: 'Accesso negato',
      validation: 'Errore di validazione',
      serverError: 'Errore del server',
      databaseError: 'Errore del database',
      networkError: 'Errore di rete',
      timeout: 'Timeout della richiesta',
      invalidCredentials: 'Credenziali non valide',
      emailNotVerified: 'Email non verificata',
      accountLocked: 'Account bloccato',
      tooManyRequests: 'Troppe richieste',
      sessionExpired: 'Sessione scaduta',
      invalidToken: 'Token non valido',
      duplicateEntry: 'Questa voce esiste già',
      insufficientPermissions: 'Permessi insufficienti',
      paymentRequired: 'Pagamento richiesto',
      subscriptionExpired: 'Abbonamento scaduto'
    },
    success: {
      created: 'Creato con successo',
      updated: 'Aggiornato con successo',
      deleted: 'Eliminato con successo',
      saved: 'Salvato con successo',
      sent: 'Inviato con successo',
      uploaded: 'Caricato con successo',
      processed: 'Elaborato con successo',
      completed: 'Completato con successo',
      activated: 'Attivato con successo',
      deactivated: 'Disattivato con successo'
    }
  }
};

// Helper function to get nested translation
function getNestedTranslation(obj: Translation | string, path: string[]): string | undefined {
  if (path.length === 0 || typeof obj === 'string') {
    return typeof obj === 'string' ? obj : undefined;
  }
  
  const [head, ...tail] = path;
  const next = obj[head];
  
  if (typeof next === 'string') {
    return tail.length === 0 ? next : undefined;
  }
  
  if (typeof next === 'object' && next !== null) {
    return getNestedTranslation(next, tail);
  }
  
  return undefined;
}

// Main translation function
export function translate(
  key: string,
  language: string = 'es',
  params?: Record<string, string | number>
): string {
  const lang = translations[language] || translations.es;
  const keys = key.split('.');
  
  let translation = getNestedTranslation(lang, keys);
  
  // Fallback to Spanish if not found
  if (!translation && language !== 'es') {
    translation = getNestedTranslation(translations.es, keys);
  }
  
  // Fallback to English if still not found
  if (!translation && language !== 'en') {
    translation = getNestedTranslation(translations.en, keys);
  }
  
  // Return key if no translation found
  if (!translation) {
    return key;
  }
  
  // Replace parameters
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation!.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
    });
  }
  
  return translation;
}

// Middleware function to add translation to response
export function addTranslation(req: any, res: any, next: any) {
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 
                   req.query.lang || 
                   req.cookies?.language || 
                   'es';
  
  res.t = (key: string, params?: Record<string, string | number>) => {
    return translate(key, language, params);
  };
  
  res.language = language;
  
  next();
}

// Function to localize error responses
export function localizeError(error: any, language: string = 'es'): any {
  if (typeof error === 'string') {
    return translate(`errors.${error}`, language) || error;
  }
  
  if (error.message) {
    error.message = translate(`errors.${error.message}`, language) || error.message;
  }
  
  if (error.errors && Array.isArray(error.errors)) {
    error.errors = error.errors.map((e: any) => localizeError(e, language));
  }
  
  return error;
}

// Function to get available languages
export function getAvailableLanguages(): string[] {
  return Object.keys(translations);
}

// Function to check if language is supported
export function isLanguageSupported(language: string): boolean {
  return language in translations;
}

// Export for use in other modules
export default {
  translate,
  addTranslation,
  localizeError,
  getAvailableLanguages,
  isLanguageSupported,
  translations
};