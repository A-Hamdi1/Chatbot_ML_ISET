from http.client import responses as http_responses
import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from waitress import serve
from chatbot.data_processing import load_data, preprocess_text, vectorizer, tfidf_matrix, categories
from chatbot.embeddings_utils import ensemble_similarity, get_best_match_with_fasttext, get_best_match_with_word2vec
from chatbot.models import nb_classifier, knn_classifier, nb_score, nb_f1, best_knn_score, best_knn_f1, best_n_neighbors
from chatbot.chatbot_logic import get_response, save_new_question, search_in_index
from sklearn.metrics.pairwise import cosine_similarity
from chatbot.self_learning import get_well_rated_questions, check_for_duplicates, integrate_candidates, predict_category, integrate_questions, get_learning_status, update_models
import pandas as pd
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# File to store chat sessions persistently
CHAT_FILE = "data/chat_sessions.csv"

def load_chat_sessions():
    try:
        if os.path.exists(CHAT_FILE):
            df = pd.read_csv(CHAT_FILE, encoding='utf-8')
            sessions = []
            for session_id, group in df.groupby('session_id'):
                messages = []
                for _, row in group.iterrows():
                    bot_response = {
                        "answer": row['bot_answer'],
                        "url": row['bot_url'],
                        "similarity": row['bot_similarity'],
                        "category": row['bot_category'],
                        "is_shortcut": row['bot_is_shortcut'] == 'True',
                        "method": row['bot_method'] if pd.notna(row['bot_method']) else None
                    }
                    messages.append({
                        "user": row['user_message'],
                        "bot": bot_response,
                        "timestamp": row['timestamp']
                    })
                sessions.append({
                    "id": session_id,
                    "date": group['date'].iloc[0],
                    "messages": messages
                })
            return sessions
        return []
    except Exception as e:
        print(f"Error loading chat sessions: {e}")
        return []

def save_chat_sessions(sessions):
    try:
        os.makedirs(os.path.dirname(CHAT_FILE), exist_ok=True)
        rows = []
        for session in sessions:
            for msg in session['messages']:
                row = {
                    "session_id": session['id'],
                    "date": session['date'],
                    "user_message": msg['user'],
                    "bot_answer": msg['bot']['answer'] if msg['bot'] else None,
                    "bot_url": msg['bot']['url'] if msg['bot'] else None,
                    "bot_similarity": msg['bot']['similarity'] if msg['bot'] else None,
                    "bot_category": msg['bot']['category'] if msg['bot'] else None,
                    "bot_is_shortcut": str(msg['bot']['is_shortcut']) if msg['bot'] else None,
                    "bot_method": msg['bot'].get('method', 'shortcut') if msg['bot'] else None,
                    "timestamp": msg['timestamp']
                }
                rows.append(row)
        df = pd.DataFrame(rows)
        df.to_csv(CHAT_FILE, index=False, encoding='utf-8')
    except Exception as e:
        print(f"Error saving chat sessions: {e}")

@app.route('/')
def index():
    return jsonify({"status": "success", "message": "Welcome to Chatbot ISET API"})

@app.route('/api/chat', methods=['POST'])
def chat_api():
    try:
        data = request.json
        user_input = data.get('message')
        session_id = data.get('session_id')
        input_source = data.get('source', 'text')  # 'voice' or 'text'

        if not user_input:
            return jsonify({"status": "error", "message": "Message is required"}), 400

        # Clean transcribed input (remove excessive whitespace, invalid characters)
        user_input = re.sub(r'\s+', ' ', user_input.strip())
        if not re.match(r'^[\w\s.,!?\'"/-]+$', user_input):
            return jsonify({"status": "error", "message": "Invalid characters in input"}), 400

        print(f"Processing {input_source} input: {user_input}")
        response = get_response(user_input)
        timestamp = datetime.datetime.now().isoformat()
        chat_entry = {
            "user": user_input,
            "bot": response,
            "timestamp": timestamp
        }

        sessions = load_chat_sessions()
        current_session = None
        if session_id:
            try:
                session_id = int(session_id)
                current_session = next((s for s in sessions if s['id'] == session_id), None)
            except ValueError:
                session_id = None

        if not current_session:
            session_id = max([s['id'] for s in sessions], default=0) + 1
            current_session = {
                "id": session_id,
                "date": timestamp,
                "messages": []
            }
            sessions.insert(0, current_session)
        current_session['messages'].append(chat_entry)

        save_chat_sessions(sessions)
        if response['similarity'] < 0.8 and not response.get('is_shortcut', False):
            save_new_question(user_input, response['answer'])

        return jsonify({
            "status": "success",
            "response": response,
            "session_id": session_id,
            "chat_entry": chat_entry
        })
    except Exception as e:
        print(f"Error in chat API: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500

@app.route('/metrics')
def metrics():
    try:
        ratings_summary = {"utile": 0, "non_utile": 0}
        if os.path.exists('data/ratings.csv'):
            ratings = pd.read_csv('data/ratings.csv', encoding='utf-8')
            ratings_summary["utile"] = len(ratings[ratings['rating'] == True])
            ratings_summary["non_utile"] = len(ratings[ratings['rating'] == False])

        return jsonify({
            "nb_score": nb_score,
            "nb_f1": nb_f1,
            "best_knn_score": best_knn_score,
            "best_knn_f1": best_knn_f1,
            "best_n_neighbors": best_n_neighbors,
            "ratings_summary": ratings_summary
        })
    except Exception as e:
        print(f"Error generating metrics: {e}")
        return jsonify({"status": "error", "message": "Erreur lors de la génération des métriques."}), 500

@app.route('/about')
def about():
    return jsonify({
        "title": "Chatbot ISET SFAX",
        "description": "Ce chatbot a été développé dans le cadre du mini-projet de Machine Learning du cours DSIR 12 pour aider les étudiants de l’ISET. Il utilise des techniques d’apprentissage automatique pour comprendre les questions et y répondre de manière claire et adaptée au contexte académique. Son objectif est de faciliter l’accès à l’information, favoriser l’autonomie et enrichir l’expérience d’apprentissage des étudiants.",
        "features": [
            "Traitement du langage naturel avec NLTK",
            "Classification avec Naive Bayes et KNN",
            "Embeddings avec TF-IDF, Word2Vec, et FastText",
            "Moteur de recherche avec Whoosh",
            "Support multilingue (français et anglais)",
            "Suggestions proactives selon le contexte",
            "Auto-apprentissage basé sur les nouvelles questions",
            "Système d’évaluation des réponses",
            "Gestion des sessions de chat avec historique",
            "Entrée vocale via reconnaissance vocale"
        ]
    })

@app.route('/rate', methods=['POST'])
def rate_response():
    try:
        data = request.json
        save_new_question(data.get('question'), None, data.get('rating'))
        rating_entry = {
            "question": data.get('question'),
            "rating": data.get('rating'),
            "timestamp": pd.Timestamp.now().isoformat()
        }
        if os.path.exists('data/ratings.csv'):
            df = pd.read_csv('data/ratings.csv', encoding='utf-8')
            df = pd.concat([df, pd.DataFrame([rating_entry])], ignore_index=True)
        else:
            df = pd.DataFrame([rating_entry])
        df.to_csv('data/ratings.csv', index=False, encoding='utf-8')
        return jsonify({"status": "success"})
    except Exception as e:
        print(f"Error saving rating: {e}")
        return jsonify({"status": "error", "message": "Erreur lors de l'enregistrement du retour."}), 500

@app.route('/report', methods=['GET'])
def generate_report():
    try:
        from chatbot.config import shortcuts
        from sklearn.model_selection import cross_val_score
        shortcut_stats = {shortcut: 0 for shortcut in shortcuts.keys()}
        if os.path.exists('data/new_questions.csv'):
            questions = pd.read_csv('data/new_questions.csv', encoding='utf-8')['question'].tolist()
            for shortcut in shortcuts.keys():
                shortcut_stats[shortcut] = questions.count(shortcut)
        return jsonify({
            "modeles": {
                "naive_bayes": {"accuracy": nb_score, "f1_score": nb_f1, "cv_scores": cross_val_score(nb_classifier, tfidf_matrix, categories, cv=5).tolist()},
                "knn": {"accuracy": best_knn_score, "f1_score": best_knn_f1, "best_n_neighbors": best_n_neighbors}
            },
            "raccourcis": shortcut_stats
        })
    except Exception as e:
        print(f"Error generating report: {e}")
        return jsonify({"status": "error", "message": "Erreur lors de la génération du rapport."}), 500

@app.route('/embeddings-metrics')
def embeddings_metrics():
    try:
        test_questions = []
        if os.path.exists('data/test_questions.csv'):
            test_questions = pd.read_csv('data/test_questions.csv', encoding='utf-8')['question'].tolist()

        if not test_questions:
            test_questions = [
                "Quelles sont les horaires d'ouverture de la bibliothèque?",
                "Comment s'inscrire pour la nouvelle année?",
                "Où puis-je trouver les résultats des examens?",
                "Quand commence la période d'inscription?",
                "Comment contacter l'administration?",
                "Quels sont les programmes disponibles à l'ISET?"
            ]

        questions, responses, _, _ = load_data()
        results = []
        for question in test_questions:
            processed_input = preprocess_text(question)
            input_tfidf = vectorizer.transform([processed_input])

            tfidf_similarities = cosine_similarity(input_tfidf, tfidf_matrix)
            tfidf_best_idx = tfidf_similarities.argmax()
            tfidf_similarity = float(tfidf_similarities[0, tfidf_best_idx])

            w2v_idx, w2v_sim = get_best_match_with_word2vec(question)
            ft_idx, ft_sim = get_best_match_with_fasttext(question)
            ens_idx, ens_sim = ensemble_similarity(question)

            result = {
                'question': question,
                'tfidf': {'response': responses[tfidf_best_idx], 'similarity': float(tfidf_similarity)},
                'word2vec': {'response': responses[w2v_idx], 'similarity': float(w2v_sim)},  # Convertir
                'fasttext': {'response': responses[ft_idx], 'similarity': float(ft_sim)},  # Convertir
                'ensemble': {'response': responses[ens_idx], 'similarity': float(ens_sim)},  
            }
            results.append(result)

        methods = ['tfidf', 'word2vec', 'fasttext', 'ensemble']
        # similarities = [[r[m]['similarity'] for r in results] for m in methods]
        similarities = [[float(r[m]['similarity']) for r in results] for m in methods]  # Convertir toutes les similarités
        method_counts = {}
        for r in results:
            best_method = max(methods, key=lambda m: r[m]['similarity'])
            method_counts[best_method] = method_counts.get(best_method, 0) + 1

        return jsonify({
            "results": results,
            "similarities": similarities,
            "method_counts": method_counts
        })
    except Exception as e:
        print(f"Error generating embeddings metrics: {e}")
        return jsonify({"status": "error", "message": "Erreur lors de la génération des métriques d'embeddings."}), 500

@app.route('/new_chat', methods=['POST'])
def new_chat():
    try:
        sessions = load_chat_sessions()
        new_session = {
            "id": max([s['id'] for s in sessions], default=0) + 1,
            "date": datetime.datetime.now().isoformat(),
            "messages": []
        }
        sessions.insert(0, new_session)
        save_chat_sessions(sessions)
        return jsonify({"status": "success", "session_id": new_session['id']})
    except Exception as e:
        print(f"Error creating new chat: {e}")
        return jsonify({"status": "error", "message": "Erreur lors de la création d'une nouvelle session."}), 500

@app.route('/delete_chat', methods=['POST'])
def delete_chat():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        if not session_id:
            return jsonify({"status": "error", "message": "session_id manquant."}), 400
        sessions = load_chat_sessions()
        sessions = [session for session in sessions if session['id'] != int(session_id)]
        save_chat_sessions(sessions)
        return jsonify({"status": "success"})
    except Exception as e:
        print(f"Error deleting chat: {e}")
        return jsonify({"status": "error", "message": "Erreur lors de la suppression de la session."}), 500

@app.route('/get_sessions', methods=['GET'])
def get_sessions():
    try:
        sessions = load_chat_sessions()
        return jsonify(sessions)
    except Exception as e:
        print(f"Error getting sessions: {e}")
        return jsonify({"status": "error", "message": "Erreur lors de la récupération des sessions."}), 500



@app.route('/api/self-learning/status', methods=['GET'])
def self_learning_status():
    """
    Route pour obtenir le statut actuel du système d'auto-apprentissage
    """
    try:
        status = get_learning_status()
        return jsonify(status)
    except Exception as e:
        print(f"Error getting self-learning status: {e}")
        return jsonify({"status": "error", "message": "Erreur lors de l'obtention du statut d'apprentissage."}), 500

@app.route('/api/self-learning/candidates', methods=['GET'])
def get_candidates():
    """
    Route pour obtenir les questions candidates pour l'intégration
    """
    try:
        # Récupérer les questions bien notées (limitées à 10)
        candidates = get_well_rated_questions(limit=10)
        print(f"Nombre de candidates récupérées: {len(candidates)}")
        print(f"Candidates:\n{candidates}")
        
        if candidates.empty:
            return jsonify({"status": "info", "message": "Aucune question bien notée n'est disponible pour l'intégration.", "candidates": []})
            
        # Charger les questions existantes pour vérifier les doublons
        questions, _, urls, _ = load_data()
        
        # Vérifier les doublons
        non_duplicate_indices = check_for_duplicates(candidates['question'].tolist(), questions)
        filtered_candidates = candidates.iloc[non_duplicate_indices].reset_index(drop=True)
        
        if filtered_candidates.empty:
            return jsonify({"status": "info", "message": "Toutes les questions bien notées sont déjà présentes dans la base de données.", "candidates": []})
            
        # Prédire les catégories pour chaque question
        categories = []
        confidences = []
        for question in filtered_candidates['question']:
            category, confidence = predict_category(question)
            categories.append(category)
            confidences.append(float(confidence))
            
        # Ajouter les catégories prédites et les URL (vides pour l'instant)
        filtered_candidates['category'] = categories
        filtered_candidates['confidence'] = confidences
        filtered_candidates['url'] = '/auto-learning'  # URL par défaut
        
        # Convertir à JSON et renvoyer
        candidates_json = filtered_candidates.to_dict(orient='records')
        return jsonify({
            "status": "success", 
            "candidates": candidates_json,
            "total": len(candidates_json)
        })
        
    except Exception as e:
        print(f"Error getting self-learning candidates: {e}")
        return jsonify({"status": "error", "message": f"Erreur lors de la récupération des candidats: {str(e)}"}), 500

@app.route('/api/self-learning/integrate', methods=['POST'])
def integrate_candidates_endpoint():
    try:
        # Récupérer les données du frontend
        data = request.get_json()
        print(f"Données reçues: {data}")  # Journal
        if not data or 'questions' not in data:
            return jsonify({"status": "error", "message": "Aucune donnée candidate fournie"}), 400

        # Créer un DataFrame
        candidates = pd.DataFrame(data['questions'])
        print(f"Candidates DataFrame:\n{candidates}")  # Journal
        if candidates.empty:
            return jsonify({"status": "info", "message": "Aucune candidate à intégrer"}), 200

        # Vérifier les colonnes requises
        required_columns = ['category', 'question', 'answer', 'url']
        if not all(col in candidates.columns for col in required_columns):
            return jsonify({"status": "error", "message": "Colonnes manquantes dans les candidates"}), 400

        # Intégrer les candidates
        integrate_candidates(candidates)

        # Extraire les catégories pour la mise à jour des modèles
        categories = candidates['category'].tolist()
        print(f"Catégories extraites: {categories}")  # Journal

        # Mettre à jour les modèles
        update_models(categories)

        return jsonify({"status": "success", "message": "Candidates intégrées avec succès"}), 200
    except Exception as e:
        print(f"Erreur lors de l'intégration: {e}")
        return jsonify({"status": "error", "message": f"Erreur: {str(e)}"}), 500
    
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)