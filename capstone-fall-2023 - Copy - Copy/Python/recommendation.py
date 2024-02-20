from flask import Flask, request, jsonify
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from flask_cors import CORS
from bson import ObjectId



app = Flask(__name__)
CORS(app, origins='http://localhost:3000')

mongo_uri = 'mongodb+srv://admin:pAsSw0rd23@cluster0.tpbeblo.mongodb.net/?retryWrites=true&w=majority'


try:
    # Create a MongoClient object
    client = MongoClient(mongo_uri)
    

    # Check the connection status by retrieving server information
    server_info = client.server_info()
    
    # If the connection is successful, print server information
    print("Connected to MongoDB successfully!")
    print(server_info)
    
    db = client['test']
    users_collection = db['users']
    connections_collection = db['connections']


except Exception as e:
    # Handle connection errors
    print(f"Failed to connect to MongoDB. Error: {e}")

# Load the model and other necessary components
tfidf_vectorizer = joblib.load('./User Recommendation/tfidf_vectorizer.joblib')
cosine_sim = joblib.load('./User Recommendation/cosine_similarity_matrix.joblib')


# Assuming 'userId', 'industry', and 'skills' are fields in your MongoDB collection
profiles = list(users_collection.find({}, {'_id': 1, 'industry': 1, 'skills': 1}))

# Extract userIds and profiles from MongoDB documents
user_ids = [str(profile['_id']) for profile in profiles]  # Convert ObjectId to string

# Combine 'industry' and 'skills' to create the 'profile'
user_profiles = [f"{profile['industry']} {' '.join(profile.get('skills', []))}" for profile in profiles]



    # Transform user profiles into TF-IDF features
tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(user_profiles)
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)



def get_top_recommendations(user_index, top_k=5):
    sim_scores = list(enumerate(cosine_sim[user_index]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    user_id = user_ids[user_index]

    user_id_object = ObjectId(user_id)

    existing_connections=connections_collection.find({'userAId': user_id_object})
    connect=set()
    for conn in existing_connections:
        connect.add(str(conn['userBId']))
    top_recommendations = [i for i, _ in sim_scores if i != user_index and user_ids[i] not in connect][:top_k]

    return top_recommendations

@app.route('/api/predict', methods=['POST'])
def predict():
    user_id = request.json.get('userId')
    try:
        user_index = user_ids.index(user_id)
    except ValueError:
        return jsonify({"error": f"User with ID {user_id} not found in the database"})

    # Get top recommendations for the target user
    top_recommendations = get_top_recommendations(user_index, top_k=3)

    # Respond with the recommendation
    if top_recommendations:
        recommendations = [{"userId": user_ids[i]} for i in top_recommendations]
        response = {"userId": user_id, "recommendations": recommendations}
        #recommended_user_id = user_ids[top_recommendations[0]]
        #response = {"user_id": user_id, "recommendation": recommended_user_id}
    else:
        response = {"user_id": user_id, "recommendation": "No recommendation"}

    return jsonify(response)
    


    

if __name__ == '__main__':
    app.run(port=5300)
