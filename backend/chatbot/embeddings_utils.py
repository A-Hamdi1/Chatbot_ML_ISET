import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from chatbot.data_processing import word2vec_model, fasttext_model, w2v_question_vectors, fasttext_question_vectors, preprocess_text

def get_best_match_with_word2vec(query, language='fr'):
    query_vector = np.array([get_document_vector_w2v(query, word2vec_model, language)])
    similarities = cosine_similarity(query_vector, w2v_question_vectors)
    best_match_idx = similarities.argmax()
    max_similarity = similarities[0, best_match_idx]
    return best_match_idx, max_similarity

def get_best_match_with_fasttext(query, language='fr'):
    query_vector = np.array([get_document_vector_fasttext(query, fasttext_model, language)])
    similarities = cosine_similarity(query_vector, fasttext_question_vectors)
    best_match_idx = similarities.argmax()
    max_similarity = similarities[0, best_match_idx]
    return best_match_idx, max_similarity

def ensemble_similarity(query, language='fr'):
    w2v_idx, w2v_sim = get_best_match_with_word2vec(query, language)
    ft_idx, ft_sim = get_best_match_with_fasttext(query, language)
    
    # Weighted average of similarities (equal weights for simplicity)
    weights = [0.5, 0.5]
    if w2v_idx == ft_idx:
        combined_similarity = (w2v_sim * weights[0] + ft_sim * weights[1])
        return w2v_idx, combined_similarity
    else:
        # Choose the one with higher similarity
        if w2v_sim > ft_sim:
            return w2v_idx, w2v_sim
        else:
            return ft_idx, ft_sim

def get_document_vector_w2v(doc, model, language='fr'):
    words = preprocess_text(doc, language).split()
    word_vectors = [model.wv[word] for word in words if word in model.wv]
    if len(word_vectors) == 0:
        return np.zeros(model.vector_size)
    return np.mean(word_vectors, axis=0)

def get_document_vector_fasttext(doc, model, language='fr'):
    words = preprocess_text(doc, language).split()
    word_vectors = [model.wv[word] for word in words if word in model.wv]
    if len(word_vectors) == 0:
        return np.zeros(model.vector_size)
    return np.mean(word_vectors, axis=0)