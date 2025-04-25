import os
import pickle
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
from chatbot.data_processing import processed_questions, categories, vectorizer, tfidf_matrix

X_train, X_test, y_train, y_test = train_test_split(processed_questions, categories, test_size=0.2, random_state=42)
X_train_tfidf = vectorizer.transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

nb_classifier = MultinomialNB(alpha=0.1)
nb_classifier.fit(X_train_tfidf, y_train)
nb_predictions = nb_classifier.predict(X_test_tfidf)
nb_score = accuracy_score(y_test, nb_predictions)
nb_f1 = f1_score(y_test, nb_predictions, average='weighted')

X_train_dense = X_train_tfidf.toarray()
X_test_dense = X_test_tfidf.toarray()
best_knn_score = 0
best_knn_f1 = 0
best_n_neighbors = 1
knn_classifier = None
for n in range(3, 8):
    knn = KNeighborsClassifier(n_neighbors=n, metric='cosine')
    knn.fit(X_train_dense, y_train)
    knn_predictions = knn.predict(X_test_dense)
    knn_score = accuracy_score(y_test, knn_predictions)
    knn_f1 = f1_score(y_test, knn_predictions, average='weighted')
    if knn_f1 > best_knn_f1:
        best_knn_f1 = knn_f1
        best_knn_score = knn_score
        best_n_neighbors = n
        knn_classifier = knn

if not os.path.exists("models"):
    os.makedirs("models")
with open('models/nb_classifier.pkl', 'wb') as f:
    pickle.dump(nb_classifier, f)
with open('models/knn_classifier.pkl', 'wb') as f:
    pickle.dump(knn_classifier, f)
with open('models/vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)