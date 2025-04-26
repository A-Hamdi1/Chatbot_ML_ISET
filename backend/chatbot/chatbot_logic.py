import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from whoosh.qparser import QueryParser
from chatbot.data_processing import ix, responses, urls, preprocess_text, vectorizer, tfidf_matrix
from chatbot.models import nb_classifier, knn_classifier
from chatbot.config import shortcuts, shortcut_urls
from chatbot.embeddings_utils import get_best_match_with_word2vec, get_best_match_with_fasttext, ensemble_similarity
import os
from langdetect import detect, DetectorFactory

# Assurer la reproductibilité de la détection de langue
DetectorFactory.seed = 0

def search_in_index(query):
    try:
        with ix.searcher() as searcher:
            query_obj = QueryParser("question", ix.schema).parse(query)
            results = searcher.search(query_obj, limit=1)
            return {"answer": results[0]['answer'], "url": results[0]['url']} if results else None
    except Exception as e:
        print(f"Error searching in index: {e}")
        return None

def get_shortcut_url(shortcut):
    path = shortcut_urls.get(shortcut)
    return f"https://isetsf.rnu.tn{path}" if path else None

def get_suggestions(user_input):
    """Generate proactive suggestions based on the context of the input."""
    suggestions = []
    processed_input = preprocess_text(user_input).lower()
    if 'horaire' in processed_input or 'ouverture' in processed_input:
        suggestions.append({"text": "/horaires", "label": "🕒 Horaires"})
    if 'contact' in processed_input or 'administration' in processed_input:
        suggestions.append({"text": "/contact", "label": "📞 Contact"})
    if 'inscription' in processed_input or 'nouvelle année' in processed_input:
        suggestions.append({"text": "/inscription", "label": "📝 Inscription"})
    if 'bibliothèque' in processed_input or 'livre' in processed_input:
        suggestions.append({"text": "/bibliotheque", "label": "📚 Bibliothèque"})
    if 'examen' in processed_input or 'résultat' in processed_input:
        suggestions.append({"text": "/examens", "label": "📖 Examens"})
    return suggestions

def get_response(user_input):
    # Détecter automatiquement la langue
    try:
        language = detect(user_input)
        if language not in ['fr', 'en']:
            language = 'fr'  # Par défaut français si la détection échoue
    except Exception:
        language = 'fr'  # Secours si langdetect échoue

    # Check for shortcuts
    if user_input.startswith('/'):
        if user_input in shortcuts:
            return {
                "answer": shortcuts[user_input],
                "url": get_shortcut_url(user_input),
                "similarity": 1.0,
                "category": "shortcut",
                "is_shortcut": True,
                "suggestions": []
            }
        return {
            "answer": "Commande inconnue. Tapez /help pour la liste.",
            "url": None,
            "similarity": 0.0,
            "category": "shortcut",
            "is_shortcut": True,
            "suggestions": []
        }

    processed_input = preprocess_text(user_input, language)
    input_tfidf = vectorizer.transform([processed_input])
    
    # Try TF-IDF (threshold: 0.65, adjust if too strict)
    similarities = cosine_similarity(input_tfidf, tfidf_matrix)
    best_match_idx = similarities.argmax()
    max_similarity = similarities[0, best_match_idx]
    
    # Category prediction using Naive Bayes and KNN
    category_tfidf = nb_classifier.predict(input_tfidf)[0]
    input_dense = input_tfidf.toarray()
    category_knn = knn_classifier.predict(input_dense)[0]
    
    # Generate suggestions for non-shortcut inputs
    suggestions = get_suggestions(user_input)
    
    if max_similarity > 0.65:
        return {
            "answer": responses[best_match_idx],
            "url": f"https://isetsf.rnu.tn{urls[best_match_idx]}",
            "similarity": float(max_similarity),
            "category": category_tfidf,
            "is_shortcut": False,
            "method": "tfidf",
            "suggestions": suggestions
        }
    
    # Try Word2Vec (threshold: 0.8, adjust if needed)
    w2v_idx, w2v_sim = get_best_match_with_word2vec(user_input, language=language)
    if w2v_sim > 0.8:
        return {
            "answer": responses[w2v_idx],
            "url": f"https://isetsf.rnu.tn{urls[w2v_idx]}",
            "similarity": float(w2v_sim),
            "category": category_tfidf,
            "is_shortcut": False,
            "method": "word2vec",
            "suggestions": suggestions
        }
    
    # Try FastText (threshold: 0.8)
    ft_idx, ft_sim = get_best_match_with_fasttext(user_input, language=language)
    if ft_sim > 0.8:
        return {
            "answer": responses[ft_idx],
            "url": f"https://isetsf.rnu.tn{urls[ft_idx]}",
            "similarity": float(ft_sim),
            "category": category_tfidf,
            "is_shortcut": False,
            "method": "fasttext",
            "suggestions": suggestions
        }
    
    # Try ensemble (threshold: 0.7)
    ens_idx, ens_sim = ensemble_similarity(user_input, language=language)
    if ens_sim > 0.7:
        return {
            "answer": responses[ens_idx],
            "url": f"https://isetsf.rnu.tn{urls[ens_idx]}",
            "similarity": float(ens_sim),
            "category": category_tfidf,
            "is_shortcut": False,
            "method": "ensemble",
            "suggestions": suggestions
        }
    
    # Fall back to KNN (distance threshold: 0.7)
    distances, indices = knn_classifier.kneighbors(input_dense, n_neighbors=1)
    if distances[0][0] < 0.7:
        idx = indices[0][0]
        return {
            "answer": responses[idx],
            "url": f"https://isetsf.rnu.tn{urls[idx]}",
            "similarity": 1.0 - distances[0][0],
            "category": category_knn,
            "is_shortcut": False,
            "method": "knn",
            "suggestions": suggestions
        }
    
    # Last resort: Whoosh search
    search_result = search_in_index(user_input)
    if search_result:
        return {
            "answer": search_result['answer'],
            "url": f"https://isetsf.rnu.tn{search_result['url']}",
            "similarity": 0.5,
            "category": category_knn,
            "is_shortcut": False,
            "method": "index_search",
            "suggestions": suggestions
        }
    
    # No match found
    return {
        "answer": "Désolé, je n'ai pas compris.",
        "url": None,
        "similarity": 0.0,
        "category": None,
        "is_shortcut": False,
        "method": "no_match",
        "suggestions": suggestions
    }

def save_new_question(user_input, response, rating=None):
    try:
        if not os.path.exists("data"):
            os.makedirs("data")
        new_entry = {
            "question": user_input,
            "response": response,
            "rating": rating,
            "timestamp": pd.Timestamp.now().isoformat()
        }
        # Charger le fichier existant ou créer un nouveau DataFrame
        if os.path.exists('data/new_questions.csv'):
            df = pd.read_csv('data/new_questions.csv', encoding='utf-8')
            df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)
        else:
            df = pd.DataFrame([new_entry])
        df.to_csv('data/new_questions.csv', index=False, encoding='utf-8')
    except Exception as e:
        print(f"Error saving new question: {e}")