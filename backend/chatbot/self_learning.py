"""
Module pour l'auto-apprentissage et l'enrichissement de la base de données du chatbot ISET
"""
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.naive_bayes import MultinomialNB
from chatbot.data_processing import preprocess_text, vectorizer, load_data, word2vec_model, fasttext_model
from chatbot.models import nb_classifier, knn_classifier
from chatbot.embeddings_utils import get_document_vector_w2v, get_document_vector_fasttext


def integrate_candidates(candidates):
    """
    Intègre les candidates dans data_option1.csv et nettoie new_questions.csv et ratings.csv.
    """
    try:
        # Vérifier l'existence de data_option1.csv
        data_path = 'data/data_option1.csv'
        if not os.path.exists(data_path):
            raise FileNotFoundError("data_option1.csv introuvable")

        # Charger data_option1.csv
        data_option1 = pd.read_csv(data_path, encoding='utf-8')

        # Générer de nouveaux IDs
        max_id = int(data_option1['id'].max()) if not data_option1.empty and not pd.isna(
            data_option1['id']).all() else 0
        candidates = candidates.copy()  # Créer une copie pour éviter de modifier l'original
        candidates['id'] = range(max_id + 1, max_id + 1 + len(candidates))

        # S'assurer que les colonnes sont alignées
        required_columns = ['id', 'category', 'question', 'answer', 'url']

        # Filtrer uniquement les colonnes nécessaires
        candidates = candidates[required_columns]

        # Ajouter les candidates à data_option1
        updated_data = pd.concat([data_option1, candidates], ignore_index=True)

        # Sauvegarder data_option1.csv
        updated_data.to_csv(data_path, index=False, encoding='utf-8')

        # Nettoyer new_questions.csv
        new_questions_path = 'data/new_questions.csv'
        if os.path.exists(new_questions_path):
            new_questions = pd.read_csv(new_questions_path, encoding='utf-8')
            new_questions = new_questions[~new_questions['question'].isin(
                candidates['question'])]
            new_questions.to_csv(new_questions_path,
                                 index=False, encoding='utf-8')

        # Nettoyer ratings.csv
        ratings_path = 'data/ratings.csv'
        if os.path.exists(ratings_path):
            ratings = pd.read_csv(ratings_path, encoding='utf-8')
            ratings = ratings[~ratings['question'].isin(
                candidates['question'])]
            ratings.to_csv(ratings_path, index=False, encoding='utf-8')

        print(f"{len(candidates)} candidates intégrées")
    except Exception as e:
        print(f"Erreur lors de l'intégration: {e}")
        raise


def get_well_rated_questions(limit=5):
    """
    Récupère les questions bien notées dans ratings.csv et les associe aux réponses dans new_questions.csv

    Args:
        limit (int): Nombre maximum de questions à récupérer

    Returns:
        DataFrame: DataFrame contenant les questions bien notées avec leurs réponses
    """
    try:
        if not (os.path.exists('data/ratings.csv') and os.path.exists('data/new_questions.csv')):
            print("Fichiers ratings.csv ou new_questions.csv manquants")
            return pd.DataFrame()

        # Charger les données
        ratings = pd.read_csv('data/ratings.csv', encoding='utf-8')
        new_questions = pd.read_csv('data/new_questions.csv', encoding='utf-8')

        # Vérifier les colonnes
        print("Colonnes de new_questions.csv:", new_questions.columns.tolist())

        # Filtrer les questions bien notées
        well_rated = ratings[ratings['rating'] == True]
        if well_rated.empty:
            print("Aucune question bien notée trouvée dans ratings.csv")
            return pd.DataFrame()

        # Filtrer new_questions pour ne garder que les lignes avec une réponse non vide
        new_questions = new_questions[new_questions['response'].notna()]
        if new_questions.empty:
            print("Aucune réponse valide trouvée dans new_questions.csv")
            return pd.DataFrame()

        # Supprimer les doublons dans new_questions, garder la dernière entrée
        new_questions = new_questions.drop_duplicates(
            subset=['question'], keep='last')

        # Associer les questions bien notées à leurs réponses
        merged = pd.merge(well_rated, new_questions,
                          on='question', how='inner')
        if merged.empty:
            print("Aucune correspondance trouvée entre ratings et new_questions")
            return pd.DataFrame()

        # Vérifier les colonnes après fusion
        print("Colonnes après fusion:", merged.columns.tolist())

        # Sélectionner les colonnes pertinentes et renommer
        result = merged[['question', 'response']].rename(
            columns={'response': 'answer'})
        print(f"{len(result)} questions bien notées récupérées")
        return result.head(limit)
    except Exception as e:
        print(f"Erreur lors de la récupération des questions bien notées: {e}")
        return pd.DataFrame()


def check_for_duplicates(questions, existing_questions, threshold=0.9):
    """
    Vérifie si les questions sont des doublons des questions existantes

    Args:
        questions (list): Liste des nouvelles questions
        existing_questions (list): Liste des questions existantes
        threshold (float): Seuil de similarité pour considérer comme doublon

    Returns:
        list: Liste des indices des questions qui ne sont pas des doublons
    """
    non_duplicate_indices = []

    # Initialiser ou réutiliser le vectorizer TF-IDF
    new_vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    existing_processed = [preprocess_text(q) for q in existing_questions]
    existing_tfidf = new_vectorizer.fit_transform(existing_processed)

    for i, question in enumerate(questions):
        processed_question = preprocess_text(question)
        question_tfidf = new_vectorizer.transform([processed_question])

        # Calculer la similarité avec toutes les questions existantes
        similarities = cosine_similarity(question_tfidf, existing_tfidf)
        max_similarity = similarities.max()

        # Si la similarité est inférieure au seuil, ce n'est pas un doublon
        if max_similarity < threshold:
            non_duplicate_indices.append(i)

    return non_duplicate_indices


def predict_category(question):
    """
    Prédit la catégorie d'une question en utilisant les modèles existants

    Args:
        question (str): Question à catégoriser

    Returns:
        tuple: (categorie prédite, probabilité/confiance)
    """
    processed = preprocess_text(question)
    question_tfidf = vectorizer.transform([processed])

    # Utiliser Naive Bayes pour la prédiction avec probabilités
    category = nb_classifier.predict(question_tfidf)[0]
    proba = nb_classifier.predict_proba(question_tfidf).max()

    # Si la probabilité est faible, essayer KNN
    if proba < 0.6:
        question_dense = question_tfidf.toarray()
        distances, indices = knn_classifier.kneighbors(
            question_dense, n_neighbors=1)
        knn_category = knn_classifier.predict(question_dense)[0]
        knn_confidence = 1.0 - distances[0][0]

        # Utiliser la catégorie KNN si la confiance est meilleure
        if knn_confidence > proba:
            category = knn_category
            proba = knn_confidence

    return category, proba


def update_models(categories=None):
    """
    Met à jour le modèle de classification des catégories avec les données de data_option1.csv.
    """
    try:
        # Charger data_option1.csv
        data_path = 'data/data_option1.csv'
        if not os.path.exists(data_path):
            raise FileNotFoundError("data_option1.csv introuvable")

        data = pd.read_csv(data_path, encoding='utf-8')

        # Vérifier les colonnes nécessaires
        if not all(col in data.columns for col in ['question', 'category']):
            raise ValueError("Colonnes 'question' ou 'category' manquantes")

        # Filtrer les lignes valides
        data = data.dropna(subset=['question', 'category'])
        if data.empty:
            raise ValueError("Aucune donnée valide pour retrainer le modèle")

        # Vectorisation
        vectorizer = TfidfVectorizer()
        X = vectorizer.fit_transform(data['question'])
        y = data['category']

        # Retrainer
        model = MultinomialNB()
        model.fit(X, y)

        # Sauvegarder
        joblib.dump(model, 'models/category_classifier.pkl')
        joblib.dump(vectorizer, 'models/vectorizer.pkl')

        # Journaliser
        unique_categories = data['category'].unique().tolist()
        print(
            f"Modèle mis à jour avec {len(unique_categories)} catégories: {unique_categories}")
        if categories:
            print(f"Catégories fournies: {set(categories)}")

    except Exception as e:
        print(f"Erreur lors de la mise à jour des modèles: {e}")
        raise


def integrate_questions(validated_data):
    """
    Intègre les questions validées dans data_option1.csv

    Args:
        validated_data (DataFrame): DataFrame contenant les questions validées

    Returns:
        bool: True si l'intégration a réussi, False sinon
    """
    try:
        # Vérifier que le DataFrame contient toutes les colonnes nécessaires
        required_columns = ['question', 'answer', 'category', 'url']
        for col in required_columns:
            if col not in validated_data.columns:
                print(f"Colonne manquante: {col}")
                return False

        # Charger le fichier data_option1.csv existant
        data_file = 'data/data_option1.csv'
        if os.path.exists(data_file):
            existing_data = pd.read_csv(data_file, encoding='utf-8')
            # Concaténer avec les nouvelles données
            updated_data = pd.concat(
                [existing_data, validated_data], ignore_index=True)
        else:
            updated_data = validated_data

        # Enregistrer le fichier mis à jour
        updated_data.to_csv(data_file, index=False, encoding='utf-8')

        # Mettre à jour les modèles
        update_models(validated_data)

        return True
    except Exception as e:
        print(f"Erreur lors de l'intégration des questions: {e}")
        return False


def get_learning_status():
    """
    Obtient le statut actuel du système d'auto-apprentissage

    Returns:
        dict: Dictionnaire contenant les informations sur le statut
    """
    try:
        # Nombre de questions bien notées disponibles
        num_well_rated = 0
        if os.path.exists('data/ratings.csv'):
            ratings = pd.read_csv('data/ratings.csv', encoding='utf-8')
            num_well_rated = len(ratings[ratings['rating'] == True])

        # Nombre total de questions dans la base
        num_total_questions = 0
        if os.path.exists('data/data_option1.csv'):
            data = pd.read_csv('data/data_option1.csv', encoding='utf-8')
            num_total_questions = len(data)

        # Statistiques sur les nouvelles questions
        num_new_questions = 0
        if os.path.exists('data/new_questions.csv'):
            new_questions = pd.read_csv(
                'data/new_questions.csv', encoding='utf-8')
            num_new_questions = len(new_questions)

        return {
            "well_rated_available": num_well_rated,
            "total_questions": num_total_questions,
            "new_questions": num_new_questions,
            "candidates_ready": num_well_rated >= 5  # Au moins 5 questions bien notées
        }
    except Exception as e:
        print(f"Erreur lors de l'obtention du statut: {e}")
        return {
            "well_rated_available": 0,
            "total_questions": 0,
            "new_questions": 0,
            "candidates_ready": False,
            "error": str(e)
        }
