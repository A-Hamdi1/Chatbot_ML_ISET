import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from chatbot.data_processing import (
    word2vec_model, fasttext_model, 
    get_document_vector_w2v, get_document_vector_fasttext,
    w2v_question_vectors, fasttext_question_vectors
)

def get_best_match_with_word2vec(user_input):
    """Find the best matching question using Word2Vec embeddings"""
    input_vector = get_document_vector_w2v(user_input, word2vec_model)
    # Reshape to 2D array for sklearn
    input_vector_2d = input_vector.reshape(1, -1)
    similarities = cosine_similarity(input_vector_2d, w2v_question_vectors)
    best_match_idx = similarities.argmax()
    return best_match_idx, float(similarities[0, best_match_idx])

def get_best_match_with_fasttext(user_input):
    """Find the best matching question using FastText embeddings"""
    input_vector = get_document_vector_fasttext(user_input, fasttext_model)
    # Reshape to 2D array for sklearn
    input_vector_2d = input_vector.reshape(1, -1)
    similarities = cosine_similarity(input_vector_2d, fasttext_question_vectors)
    best_match_idx = similarities.argmax()
    return best_match_idx, float(similarities[0, best_match_idx])

def ensemble_similarity(user_input):
    """Combine similarity scores from different models"""
    # Get results from different approaches
    w2v_idx, w2v_sim = get_best_match_with_word2vec(user_input)
    ft_idx, ft_sim = get_best_match_with_fasttext(user_input)
    
    # Simple ensemble - take best match with highest similarity
    if w2v_sim > ft_sim:
        return w2v_idx, w2v_sim
    return ft_idx, ft_sim