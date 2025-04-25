import json
import nltk
import string
import numpy as np
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from langdetect import detect
from whoosh.index import create_in
from whoosh.fields import Schema, TEXT
import os
from gensim.models import Word2Vec, FastText

nltk.download('punkt_tab', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

stemmer_fr = SnowballStemmer('french')
stemmer_en = SnowballStemmer('english')
stop_words_fr = set(stopwords.words('french'))
stop_words_en = set(stopwords.words('english'))

schema = Schema(question=TEXT(stored=True), answer=TEXT(stored=True), url=TEXT(stored=True))
if not os.path.exists("indexdir"):
    os.makedirs("indexdir")
ix = create_in("indexdir", schema)

def load_data():
    try:
        with open('data/data.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
        questions = []
        responses = []
        urls = []
        categories = []
        writer = ix.writer()
        for entry in data:
            writer.add_document(question=entry['question'], answer=entry['answer'], url=entry['url'])
            main_question = entry['question']
            variations = entry['question_variations']
            questions.extend([main_question] + variations)
            responses.extend([entry['answer']] * (len(variations) + 1))
            urls.extend([entry['url']] * (len(variations) + 1))
            categories.extend([entry['category']] * (len(variations) + 1))
        writer.commit()
        return questions, responses, urls, categories
    except FileNotFoundError:
        print("Error: data_v5.json not found.")
        return [], [], [], []
    except Exception as e:
        print(f"Error loading data: {e}")
        return [], [], [], []

questions, responses, urls, categories = load_data()

def preprocess_text(text):
    try:
        lang = detect(text)
    except:
        lang = 'fr'
    stemmer = stemmer_en if lang == 'en' else stemmer_fr
    stop_words = stop_words_en if lang == 'en' else stop_words_fr
    text = text.lower().translate(str.maketrans('', '', string.punctuation))
    tokens = [stemmer.stem(word) for word in word_tokenize(text) if word not in stop_words]
    return ' '.join(tokens)

# Tokenized texts for word embeddings
tokenized_questions = [preprocess_text(q).split() for q in questions]

# Vectorizer for TF-IDF
vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_df=0.9, min_df=2)
processed_questions = [preprocess_text(q) for q in questions]
tfidf_matrix = vectorizer.fit_transform(processed_questions)

# Train Word2Vec model
word2vec_model_path = 'models/word2vec.model'
if os.path.exists(word2vec_model_path):
    word2vec_model = Word2Vec.load(word2vec_model_path)
else:
    word2vec_model = Word2Vec(sentences=tokenized_questions, vector_size=100, window=5, min_count=1, workers=4)
    if not os.path.exists('models'):
        os.makedirs('models')
    word2vec_model.save(word2vec_model_path)

# Train FastText model
fasttext_model_path = 'models/fasttext.model'
if os.path.exists(fasttext_model_path):
    fasttext_model = FastText.load(fasttext_model_path)
else:
    fasttext_model = FastText(tokenized_questions, vector_size=100, window=5, min_count=1, workers=4)
    fasttext_model.save(fasttext_model_path)

def get_document_vector_w2v(doc, model):
    words = preprocess_text(doc).split()
    word_vectors = [model.wv[word] for word in words if word in model.wv]
    if len(word_vectors) == 0:
        return np.zeros(model.vector_size)
    return np.mean(word_vectors, axis=0)

def get_document_vector_fasttext(doc, model):
    words = preprocess_text(doc).split()
    word_vectors = [model.wv[word] for word in words if word in model.wv]
    if len(word_vectors) == 0:
        return np.zeros(model.vector_size)
    return np.mean(word_vectors, axis=0)

# Pre-calculate document vectors
w2v_question_vectors = np.array([get_document_vector_w2v(q, word2vec_model) for q in questions])
fasttext_question_vectors = np.array([get_document_vector_fasttext(q, fasttext_model) for q in questions])