from flask import Flask, request
from flask_restful import Api, Resource
from pymongo import MongoClient
import bcrypt
import spacy

app = Flask(__name__)
api = Api(app)

db_client = MongoClient("mongodb://db:27017")
db = db_client.SimilarityDB
db_users = db["Users"]

def UserExist(username):
    if db_users.find({"Username": username}).count() == 0:
        return False

    return True

class Register(Resource):
    def post(self):
        data = request.get_json()

        username = data["username"]
        password = data["password"]

        if UserExist(username):
            retJson = {
                "status": 301,
                "msg": "Invalid Username"
            }
            return retJson

        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        db_users.insert({
            "Username": username,
            "Password": hashed_pw,
            "Token": 10
            })

        retJson = {
            "status": 200, 
            "msg": "Succesfully registered"
        }
        return retJson


def authentication(username, password):
    stored_pw = db_users.find({"Username": username})[0]["Password"]
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), stored_pw)

    return stored_pw == hashed_pw

def countTokens(username):
    return db_users.find({"Username": username})[0]["Token"]


class Detect(Resource):
    def post(self):
        data = request.get_json()

        username = data["username"]
        password = data["password"]
        text1 = data["text1"]
        text2 = data["text2"]
        #check1
        if not UserExist(username):
            retJson = {
                "status": 301,
                "msg": "Invalid Username"
            }
            return retJson

        #check2
        if not authentication(username, password):
            retJson = {
                "status": 302,
                "msg": "Invalid Password"
            }
            return retJson

        #check3
        remained_tokens = countTokens(username)
        if remained_tokens <= 0:
            retJson = {
                "status": 303,
                "msg": "Out of Tokens"
            }
            return retJson

        nlp = spacy.load('en_core_web_sm')
        text1 = nlp(text1)
        text2 = nlp(text2)

        ratio = text1.similarity(text2)
        db_users.update({"Username": username},{
                "$set": {
                    "Token": remained_tokens - 1
                }
            })

        retJson = {
                "status": 200,
                "ratio": ratio,
                "msg": "Similarity calculation is successfully done!"
            }

        return retJson


class Refill(Resource):
    def post(self):
        data = request.get_json()

        username = data["username"]
        password = data["admin_pw"]
        refill_amount = data["refill"]
        #check1
        if not UserExist(username):
            retJson = {
                "status": 301,
                "msg": "Invalid Username"
            }
            return retJson

        #check2
        correct_pw = "admin"
        if not correct_pw == password:
            retJson = {
                "status": 302,
                "msg": "Invalid Admin Password"
            }
            return retJson

        remained_tokens = countTokens(username)
        db_users.update({"Username": username},{
                "$set": {
                    "Token": remained_tokens + refill_amount
                }
            })

        retJson = {
                "status": 200,
                "msg": "Refilled!"
            }

        return retJson

api.add_resource(Register, '/register')
api.add_resource(Detect, '/detect')
api.add_resource(Refill, '/refill')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5050) 






