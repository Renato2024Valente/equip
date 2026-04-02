from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://Vercel-Admin-equipamentos:N4aM0GaVQPNstwfz@equipamentos.rkrbnap.mongodb.net/?retryWrites=true&w=majority")
DB_NAME = os.getenv("MONGODB_DB", "controle_notebooks")

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
collection = db["notebooks"]

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/notebooks", methods=["GET"])
def listar():
    data = []
    for item in collection.find():
        item["_id"] = str(item["_id"])
        data.append(item)
    return jsonify(data)

@app.route("/api/notebooks", methods=["POST"])
def salvar():
    dados = request.json
    collection.insert_one(dados)
    return jsonify({"msg": "Salvo com sucesso"})

@app.route("/api/notebooks/<id>", methods=["DELETE"])
def deletar(id):
    from bson import ObjectId
    collection.delete_one({"_id": ObjectId(id)})
    return jsonify({"msg": "Deletado"})

if __name__ == "__main__":
    app.run(debug=True)
