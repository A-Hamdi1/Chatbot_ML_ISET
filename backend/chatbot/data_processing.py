import pandas as pd
import nltk
import string
import numpy as np
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from whoosh.index import create_in
from whoosh.fields import Schema, TEXT
import os
from gensim.models import Word2Vec, FastText

nltk.download('punkt_tab', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

stemmer_fr = SnowballStemmer('french')
stop_words_fr = set(stopwords.words('french'))
# Common filler words in French for voice input
filler_words_fr = {'euh', 'hum', 'ben', 'tu sais', 'genre', 'comme', 'voilà'}

schema = Schema(question=TEXT(stored=True), answer=TEXT(stored=True), url=TEXT(stored=True))
if not os.path.exists("indexdir"):
    os.makedirs("indexdir")
ix = create_in("indexdir", schema)

def load_data():
    try:
        data = pd.read_csv('data/data_option1.csv', encoding='utf-8')
        questions = []
        responses = []
        urls = []
        categories = []
        writer = ix.writer()
        
        for _, row in data.iterrows():
            question = row['question']
            answer = row['answer']
            category = row['category']
            url = row['url']
            writer.add_document(question=question, answer=answer, url=url)
            questions.append(question)
            responses.append(answer)
            urls.append(url)
            categories.append(category)
        
        writer.commit()
        return questions, responses, urls, categories
    except FileNotFoundError:
        print("Error: data_option1.csv not found.")
        return [], [], [], []
    except Exception as e:
        print(f"Error loading data: {e}")
        return [], [], [], []

questions, responses, urls, categories = load_data()

def preprocess_text(text, language='fr', is_voice=False):
    stemmer = stemmer_fr
    stop_words = stop_words_fr
    text = text.lower().translate(str.maketrans('', '', string.punctuation))
    if is_voice:
        # Remove filler words for voice input
        words = word_tokenize(text)
        words = [word for word in words if word not in filler_words_fr]
        text = ' '.join(words)
    tokens = [stemmer.stem(word) for word in word_tokenize(text) if word not in stop_words]
    return ' '.join(tokens)

tokenized_questions = [preprocess_text(q, 'fr').split() for q in questions]

vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_df=0.9, min_df=2)
processed_questions = [preprocess_text(q, 'fr') for q in questions]
tfidf_matrix = vectorizer.fit_transform(processed_questions)

word2vec_model_path = 'models/word2vec.model'
if os.path.exists(word2vec_model_path):
    word2vec_model = Word2Vec.load(word2vec_model_path)
else:
    word2vec_model = Word2Vec(sentences=tokenized_questions, vector_size=100, window=5, min_count=1, workers=4)
    if not os.path.exists('models'):
        os.makedirs('models')
    word2vec_model.save(word2vec_model_path)

fasttext_model_path = 'models/fasttext.model'
if os.path.exists(fasttext_model_path):
    fasttext_model = FastText.load(fasttext_model_path)
else:
    fasttext_model = FastText(tokenized_questions, vector_size=100, window=5, min_count=1, workers=4)
    fasttext_model.save(fasttext_model_path)

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

w2v_question_vectors = np.array([get_document_vector_w2v(q, word2vec_model, 'fr') for q in questions])
fasttext_question_vectors = np.array([get_document_vector_fasttext(q, fasttext_model, 'fr') for q in questions])