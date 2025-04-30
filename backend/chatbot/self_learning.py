"""
Module pour l'auto-apprentissage et l'enrichissement de la base de données du chatbot ISET
"""
import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from chatbot.data_processing import preprocess_text, vectorizer, load_data, word2vec_model, fasttext_model
from chatbot.models import nb_classifier, knn_classifier
from chatbot.embeddings_utils import get_document_vector_w2v, get_document_vector_fasttext

def get_well_rated_questions(limit=10):
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
        new_questions = new_questions.drop_duplicates(subset=['question'], keep='last')
        
        # Associer les questions bien notées à leurs réponses
        merged = pd.merge(well_rated, new_questions, on='question', how='inner')
        if merged.empty:
            print("Aucune correspondance trouvée entre ratings et new_questions")
            return pd.DataFrame()
            
        # Vérifier les colonnes après fusion
        print("Colonnes après fusion:", merged.columns.tolist())
        
        # Sélectionner les colonnes pertinentes et renommer
        result = merged[['question', 'response']].rename(columns={'response': 'answer'})
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
        distances, indices = knn_classifier.kneighbors(question_dense, n_neighbors=1)
        knn_category = knn_classifier.predict(question_dense)[0]
        knn_confidence = 1.0 - distances[0][0]
        
        # Utiliser la catégorie KNN si la confiance est meilleure
        if knn_confidence > proba:
            category = knn_category
            proba = knn_confidence
    
    return category, proba

def update_models(new_data):
    """
    Met à jour les modèles de manière incrémentale avec les nouvelles données
    
    Args:
        new_data (DataFrame): Nouvelles données à intégrer
    """
    try:
        from chatbot.data_processing import word2vec_model, fasttext_model, tfidf_matrix, vectorizer, questions, processed_questions
        from chatbot.models import nb_classifier, knn_classifier
        
        # Convertir les nouvelles questions en format prétraité
        new_questions = new_data['question'].tolist()
        new_processed = [preprocess_text(q) for q in new_questions]
        new_tokenized = [p.split() for p in new_processed]
        new_categories = new_data['category'].tolist()
        
        # 1. Mise à jour des modèles Word2Vec et FastText
        # Update incrémental (mettre à jour sans entrainement complet)
        word2vec_model.build_vocab(new_tokenized, update=True)
        word2vec_model.train(new_tokenized, total_examples=len(new_tokenized), epochs=5)
        word2vec_model.save('models/word2vec.model')
        
        fasttext_model.build_vocab(new_tokenized, update=True)
        fasttext_model.train(new_tokenized, total_examples=len(new_tokenized), epochs=5)
        fasttext_model.save('models/fasttext.model')
        
        # 2. Mise à jour de la matrice TF-IDF
        # Calculer TF-IDF pour les nouvelles questions
        new_tfidf = vectorizer.transform(new_processed)
        # Fusionner avec la matrice existante (simple concaténation verticale)
        updated_tfidf = np.vstack([tfidf_matrix.toarray(), new_tfidf.toarray()])
        
        # 3. Mise à jour des classifieurs
        # Pour Naive Bayes, juste un partial_fit
        nb_classifier.partial_fit(new_tfidf, new_categories, classes=np.unique(new_categories + list(nb_classifier.classes_)))
        
        # Pour KNN, il faut réentraîner sur les données combinées
        all_processed = processed_questions + new_processed
        all_categories = list(categories) + new_categories
        all_tfidf = vectorizer.transform(all_processed)
        knn_classifier.fit(all_tfidf.toarray(), all_categories)
        
        # Sauvegarder les modèles mis à jour
        import pickle
        with open('models/nb_classifier.pkl', 'wb') as f:
            pickle.dump(nb_classifier, f)
        with open('models/knn_classifier.pkl', 'wb') as f:
            pickle.dump(knn_classifier, f)
        with open('models/vectorizer.pkl', 'wb') as f:
            pickle.dump(vectorizer, f)
            
        print("Modèles mis à jour avec succès")
    except Exception as e:
        print(f"Erreur lors de la mise à jour des modèles: {e}")

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
            updated_data = pd.concat([existing_data, validated_data], ignore_index=True)
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
            new_questions = pd.read_csv('data/new_questions.csv', encoding='utf-8')
            num_new_questions = len(new_questions)
            
        return {
            "well_rated_available": num_well_rated,
            "total_questions": num_total_questions,
            "new_questions": num_new_questions,
            "candidates_ready": num_well_rated >= 10  # Au moins 5 questions bien notées
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