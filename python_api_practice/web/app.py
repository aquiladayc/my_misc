'''
Register a user (/register)
POST
(Username, password)

Store a sentence(/store)
POST
(Username, password, sentence)

Retrieve a sentence(/get)
GET
(Username, password)
'''
from flask import Flask, request
from flask_restful import Api, Resource

from pymongo import MongoClient

import bcrypt
app = Flask(__name__)
api = Api(app)

client = MongoClient("mongodb://db:27017")
db = client.SentencesDatabase
db_users = db["Users"]

class Register(Resource):
    def post(self):
        #get posted data
        data = request.get_json()
        #validation TODO
        username = data["username"]
        password = data["password"]

        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        #store username and password into db
        db_users.insert({
            "Username": username,
            "Password": hashed_pw,
            "Sentence": "",
            "RemainingToken": 10
            })

        retJson = {
            'Message': "Successfully signed up for the API!",
            'status': 200
        }
        return retJson
def verifyPw(username, password):
    #db value
    storedPw = db_users.find({"Username": username})[0]["Password"]
    #posted value
    hashedPw = bcrypt.hashpw(password.encode('utf-8'), storedPw)

    return storedPw == hashedPw

def countToken(username):
    return db_users.find({"Username": username})[0]["RemainingToken"]

class Store(Resource):
    def post(self):
        #get posted data
        data = request.get_json()
        #param validation TODO
        username = data["username"]
        password = data["password"]
        sentence = data["sentence"]

        #verify login authentication
        is_correct_pw = verifyPw(username, password)

        if not is_correct_pw:
            retJson = {
                "status": 302
            }
            return retJson

        #check Token 
        remein_token = countToken(username)
        if remein_token <= 0:
            retJson = {
                "status": 301
            }
            return retJson

        #Store the sentence
        db_users.update({
                "Username": username
            }, {
                "$set":{
                    "Sentence": sentence,
                    "RemainingToken": remein_token - 1
                }
            }
        )
        #return result
        retJson = {
            'Message': "Successfully saved your sentence!",
            'status': 200
        }
        return retJson

class Get(Resource):
    def post(self):
        #get posted data
        data = request.get_json()
        #param validation TODO
        username = data["username"]
        password = data["password"]

        #verify login authentication
        is_correct_pw = verifyPw(username, password)

        if not is_correct_pw:
            retJson = {
                "status": 302
            }
            return retJson

        #check Token 
        remein_token = countToken(username)
        if remein_token <= 0:
            retJson = {
                "status": 301
            }
            return retJson

        #Store the sentence
        db_users.update({
                "Username": username
            }, {
                "$set":{
                    "RemainingToken": remein_token - 1
                }
            }
        )

        sentence = db_users.find({"Username": username})[0]["Sentence"]
        #return result
        retJson = {
            'Sentence': sentence,
            'status': 200
        }
        return retJson


api.add_resource(Register, '/register')
api.add_resource(Store, '/store')
api.add_resource(Get, '/get')

if __name__=="__main__":
    app.run(debug=True, host='0.0.0.0', port=5050) 
