# Chatbot ISET

![Chatbot ISET](https://img.shields.io/badge/Version-1.0-blue.svg) ![License](https://img.shields.io/badge/License-MIT-green.svg) ![Python](https://img.shields.io/badge/Python-3.8%2B-yellow.svg)

Ce projet est un **chatbot éducatif** développé dans le cadre du mini-projet de Machine Learning pour le cours DSIR à l'ISET. Il vise à répondre aux questions des utilisateurs sur les services académiques (horaires, inscriptions, examens, etc.) en utilisant des techniques de traitement du langage naturel (NLP) et des algorithmes d'apprentissage automatique. Le chatbot est intégré dans une interface web avec Flask et offre des fonctionnalités avancées comme la recherche, la classification, et l'auto-apprentissage.

## Fonctionnalités

- **Traitement du langage naturel** : Utilisation de NLTK pour le prétraitement des questions (tokenisation, suppression des stop words, stemming).
- **Classification des intentions** : Deux modèles entraînés : Naive Bayes et KNN, avec vectorisation TF-IDF.
- **Recherche textuelle** : Moteur de recherche basé sur Whoosh pour trouver des réponses dans une base de données.
- **Support multilingue** : Détection automatique de la langue (français/anglais) avec prétraitement adapté.
- **Raccourcis prédéfinis** : Commandes comme `/horaires`, `/contact`, `/inscription` pour des réponses rapides.
- **Suggestions contextuelles** : Proposition de liens ou d'informations supplémentaires selon la requête.
- **Auto-apprentissage** : Enregistrement des nouvelles questions pour améliorer la base de données.
- **Évaluation des réponses** : Système de feedback (👍/👎) pour mesurer la satisfaction des utilisateurs.
- **Interface utilisateur** : Interface web moderne avec Tailwind CSS et Flask.

## Prérequis

Avant de lancer le projet, assurez-vous d'avoir les éléments suivants installés :
- **Python 3.8+**
- **Pip** (gestionnaire de paquets Python)
- Un environnement virtuel (recommandé)

### Dépendances
Les bibliothèques nécessaires sont listées dans `requirements.txt`. Principales dépendances :
- `flask` : Framework web
- `nltk` : Traitement du langage naturel
- `sklearn` : Machine Learning (Naive Bayes, KNN, TF-IDF)
- `whoosh` : Moteur de recherche
- `langdetect` : Détection de langue
- `matplotlib` : Visualisation des statistiques
- `waitress` : Serveur de production

## Installation

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/votre-utilisateur/chatbot-iset.git
   cd chatbot-iset
   ```

2. **Créer un environnement virtuel :**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Linux/Mac
   venv\Scripts\activate     # Sur Windows
   ```

3. **Installer les dépendances :**
   ```bash
   pip install -r requirements.txt
   ```

4. **Télécharger les ressources NLTK :**
   Exécutez le script suivant dans un terminal Python pour télécharger les données nécessaires :
   ```python
   import nltk
   nltk.download('punkt')
   nltk.download('stopwords')
   ```

5. **Configurer les données :**
   Assurez-vous que le fichier `data/data.json` contient les questions, réponses et URLs initiales au format suivant :
   ```json
   [
       {"question": "Quels sont les horaires ?", "answer": "Voici les horaires...", "url": "/programmes/horaires", "category": "horaires", "question_variations": ["Heures des cours ?", "Horaires svp"]}
   ]
   ```

6. **Lancer l'application :**
   ```bash
   python app.py
   ```
   Accédez à `http://localhost:5000` dans votre navigateur.

## Utilisation

### Interface Web
- **Chat** : Posez une question ou utilisez un raccourci (ex. `/help`) dans la zone de texte.
- **Statistiques** : Consultez les performances des modèles (précision, F1-score) via l'onglet "Statistiques".
- **À propos** : Informations sur le projet et ses fonctionnalités.

### Raccourcis
- `/horaires` : Horaires des cours
- `/contact` : Coordonnées de l'administration
- `/inscription` : Procédure d'inscription
- `/bibliotheque` : Horaires de la bibliothèque
- `/examens` : Calendrier des examens
- `/help` : Liste des commandes

### Exemple
**Entrée utilisateur :** "Quand sont les examens ?"  
**Réponse du chatbot :** "Le calendrier des examens est disponible via le lien ci-dessous."  
**Lien :** `https://isetsf.rnu.tn/programmes/calendrier-examens`

## Structure du Projet

```
chatbot-iset/
│
├── chatbot/                # Logique principale du chatbot
│   ├── config.py           # Raccourcis et URLs
│   ├── data_processing.py  # Prétraitement et chargement des données
│   ├── models.py           # Entraînement et sauvegarde des modèles
│   └── chatbot_logic.py    # Logique de réponse
│
├── data/                   # Données du chatbot
│   ├── data.json           # Base de connaissances initiale
│   ├── new_questions.json  # Nouvelles questions enregistrées
│   └── ratings.json        # Évaluations des réponses
│
├── models/                 # Modèles entraînés
│   ├── nb_classifier.pkl   # Modèle Naive Bayes
│   ├── knn_classifier.pkl  # Modèle KNN
│   └── vectorizer.pkl      # Vectoriseur TF-IDF
│
├── static/                 # Fichiers statiques (CSS, JS)
│   ├── style.css           # Styles personnalisés
│   └── about.css           # Styles pour la page "À propos"
│
├── templates/              # Modèles HTML
│   ├── base.html           # Template de base
│   ├── chat.html           # Interface de chat
│   ├── metrics.html        # Statistiques
│   └── about.html          # Page "À propos"
│
├── indexdir/               # Index Whoosh (généré automatiquement)
├── app.py                  # Point d'entrée Flask
├── requirements.txt        # Liste des dépendances
└── README.md               # Documentation (ce fichier)
```

## Performances des Modèles

- **Naive Bayes** :
  - Précision : ~X% (selon les données)
  - F1-score : ~Y% (selon les données)
- **KNN** :
  - Précision : ~Z% (avec `n_neighbors` optimal)
  - F1-score : ~W%

Les performances sont calculées avec une validation croisée et affichées dans l'onglet "Statistiques".
