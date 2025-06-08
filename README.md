# 🤖 Chatbot ISET Sfax

## 📝 Description

Ce projet est un chatbot intelligent développé pour l'Institut Supérieur des Études Technologiques (ISET) de Sfax. Il utilise des techniques avancées d'apprentissage automatique pour comprendre et répondre aux questions des étudiants concernant les services, les procédures et les informations académiques de l'institut.

Le chatbot est conçu pour faciliter l'accès à l'information, favoriser l'autonomie des étudiants et enrichir leur expérience d'apprentissage en fournissant des réponses précises et contextuelles.

## ✨ Fonctionnalités

- **🔍 Traitement du langage naturel** : Utilisation de NLTK pour comprendre les requêtes en langage naturel
- **🧠 Classification intelligente** : Algorithmes Naive Bayes et KNN pour catégoriser les questions
- **📊 Embeddings vectoriels** : TF-IDF, Word2Vec et FastText pour la compréhension sémantique
- **🔎 Moteur de recherche** : Indexation avec Whoosh pour des réponses rapides
- **🌐 Support multilingue** : Français et anglais
- **💡 Suggestions proactives** : Recommandations contextuelles basées sur les requêtes
- **📈 Auto-apprentissage** : Amélioration continue basée sur les nouvelles questions et les retours utilisateurs
- **⭐ Système d'évaluation** : Notation des réponses pour améliorer la qualité
- **📜 Historique des conversations** : Gestion des sessions de chat
- **🎤 Entrée vocale** : Reconnaissance vocale pour une interaction naturelle
- **⚡ Raccourcis pratiques** : Commandes rapides pour accéder aux informations fréquemment demandées
- **📄 Téléchargement de documents** : Accès aux formulaires et documents administratifs
- **🎨 Interface utilisateur intuitive** : Design moderne et responsive
- **📊 Tableau de bord analytique** : Métriques de performance et visualisations

## 🏗️ Architecture

Le projet est divisé en deux parties principales :

### 🖥️ Backend (Python/Flask)

- **🔌 API RESTful** : Endpoints pour le chat, les évaluations, les métriques, etc.
- **🧮 Modèles ML** : Traitement des données, classification et embeddings
- **🧩 Logique du chatbot** : Algorithmes de correspondance et de réponse
- **🔄 Auto-apprentissage** : Système d'amélioration continue

### 🌈 Frontend (React)

- **🎭 Interface utilisateur moderne** : Design responsive avec Material-UI
- **🔄 Gestion d'état** : React Query pour les requêtes API
- **📈 Visualisations** : Graphiques et métriques avec Chart.js
- **🌓 Thème personnalisable** : Mode clair/sombre

## 🛠️ Technologies utilisées

### Backend
- 🐍 Python 3.x
- 🌶️ Flask (API Web)
- 🔤 NLTK (Traitement du langage naturel)
- 🧪 Scikit-learn (Apprentissage automatique)
- 🔠 Gensim (Word2Vec, FastText)
- 🐼 Pandas (Manipulation de données)
- 🔍 Whoosh (Moteur de recherche)
- 🍽️ Waitress (Serveur WSGI)

### Frontend
- ⚛️ React 19
- 🎨 Material-UI 7
- 🧭 React Router
- 🔄 React Query
- 📊 Chart.js
- 🔄 Axios
- 🎞️ Framer Motion

## 📥 Installation

### Prérequis
- 🐍 Python 3.8+
- 📦 Node.js 16+
- 📦 npm ou yarn

### Backend

```bash
# Cloner le dépôt
git clone https://github.com/A-Hamdi1/Chatbot_ML_ISET.git
cd Chatbot_ML_ISET/backend

# Créer un environnement virtuel
python -m venv venv
.\venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python app.py
```

### Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm start
```

## 📂 Structure du projet

```
Chatbot_ML_ISET/
├── backend/
│   ├── app.py                 # Point d'entrée de l'API Flask
│   ├── wsgi.py               # Configuration WSGI pour le déploiement
│   ├── requirements.txt      # Dépendances Python
│   ├── chatbot/
│   │   ├── __init__.py
│   │   ├── chatbot_logic.py  # Logique principale du chatbot
│   │   ├── config.py         # Configuration et raccourcis
│   │   ├── data_processing.py # Traitement des données
│   │   ├── embeddings_utils.py # Utilitaires pour les embeddings
│   │   ├── models.py         # Modèles d'apprentissage automatique
│   │   └── self_learning.py  # Système d'auto-apprentissage
│   └── data/
│       ├── data.csv          # Données d'entraînement
│       └── data_option1.csv  # Données supplémentaires
└── frontend/
    ├── public/               # Fichiers statiques
    ├── src/
    │   ├── components/       # Composants React réutilisables
    │   ├── pages/            # Pages de l'application
    │   ├── assets/           # Images et ressources
    │   ├── App.js            # Composant principal
    │   └── index.js          # Point d'entrée React
    ├── package.json          # Dépendances npm
    └── .env                  # Variables d'environnement
```

## ⚙️ Fonctionnement

1. **🔤 Prétraitement des questions** : Tokenisation, suppression des mots vides, stemming
2. **🔢 Vectorisation** : Conversion des textes en vecteurs numériques
3. **🏷️ Classification** : Détermination de la catégorie de la question
4. **🔍 Recherche de correspondance** : Utilisation de plusieurs méthodes (TF-IDF, Word2Vec, FastText)
5. **💬 Génération de réponse** : Sélection de la meilleure réponse selon la similarité
6. **📚 Apprentissage continu** : Intégration des nouvelles questions bien notées

## 🚀 Déploiement

Le projet est configuré pour être déployé sur diverses plateformes :

### Heroku

Le fichier `Procfile` dans le dossier backend est configuré pour Heroku.

```bash
# Déploiement sur Heroku
heroku create chatbot-iset
git push heroku main
```

### Docker

Vous pouvez également conteneuriser l'application avec Docker.

## 👥 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. 🍴 Forkez le projet
2. 🌿 Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. 💾 Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. 🔃 Ouvrez une Pull Request

## 📜 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

## 📞 Contact

- Akram Hamdi
- Email : hamdi.akram.dev@gmail.com


---

Développé avec ❤️ pour les étudiants de l'ISET Sfax