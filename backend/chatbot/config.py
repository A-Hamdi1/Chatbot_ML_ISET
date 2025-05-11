# config.py
shortcuts = {
    "/horaires": "Voici les horaires des cours. Consultez le lien pour plus de détails.",
    "/contact": "Pour contacter l'administration: Email: admin@iset.tn, Tél: +216 XX XXX XXX",
    "/inscription": "Les inscriptions sont ouvertes du 1er au 30 septembre. Consultez le guide d'inscription.",
    "/bibliotheque": "La bibliothèque est ouverte du lundi au vendredi de 8h à 18h",
    "/examens": "Le calendrier des examens est disponible via le lien ci-dessous.",
    "/help": "Commandes disponibles: /horaires, /contact, /inscription, /bibliotheque, /examens, /attestation_presence, /attestation_stage, /releve_de_note, /help",
    "/attestation_presence": "Vous pouvez télécharger le fichier attestation_presence.pdf ici.",
    "/attestation_stage": "Vous pouvez télécharger le fichier attestation_stage.pdf ici.",
    "/releve_de_note": "Vous pouvez télécharger le fichier releve_de_note.pdf ici."
}

shortcut_urls = {
    "/horaires": "/programmes/horaires",
    "/contact": "/contacts/administration",
    "/inscription": "/admissions/procedure-inscription",
    "/bibliotheque": "/services/bibliotheque",
    "/examens": "/programmes/calendrier-examens",
    "/help": None,
    "/attestation_presence": "/api/download/attestation_presence.pdf",
    "/attestation_stage": "/api/download/attestation_stage.pdf",
    "/releve_de_note": "/api/download/releve_de_note.pdf"
}