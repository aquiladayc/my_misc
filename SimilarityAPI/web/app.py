from flask import Flask, request
from flask_restful import Api, Resource
from pymongo import MongoClient
import bcrypt
import spacy

######################
#Validation functions
######################

#Return True if username exists in db
def UserExist(username):
    if db_users.count_documents({"Username": username}) == 0:
        return False

    return True

#Return True if username and password is valid
def authentication(username, password):
    stored_pw = db_users.find({"Username": username})[0]["Password"]
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), stored_pw)

    return stored_pw == hashed_pw

######################
#Utility
######################
# get remaining token for this username
def countTokens(username):
    return db_users.find({"Username": username})[0]["Token"]

# generate retJson for status code
def getRetJson(statuscode):
    if statuscode == 200:
        retJson = {
            "status": 200, 
            "msg": "Succesfully registered"
        }
        return retJson

    if statuscode == 301:
        retJson = {
            "status": 301,
            "msg": "Invalid Username"
        }
        return retJson

    if statuscode == 302:
        retJson = {
            "status": 302,
            "msg": "Invalid Password"
        }
        return retJson

    if statuscode == 303:
        retJson = {
            "status": 303,
            "msg": "Out of Tokens, please refill"
        }
        return retJson


######################
# API Resources
######################
class Register(Resource):
    def post(self):
        data = request.get_json()

        username = data["username"]
        password = data["password"]

        #Check if username is already used
        if UserExist(username):
            return getRetJson(301)

        #Hash password
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        #register
        db_users.insert({
            "Username": username,
            "Password": hashed_pw,
            "Token": 10
            })

        return getRetJson(200)

class Detect(Resource):
    def post(self):
        #Extract data from http request 
        data = request.get_json()
        username = data["username"]
        password = data["password"]
        text1 = data["text1"]
        text2 = data["text2"]

        #Validation
        if not UserExist(username):
            return getRetJson(301)

        if not authentication(username, password):
            return getRetJson(302)

        remained_tokens = countTokens(username)
        if remained_tokens <= 0:
            return getRetJson(303)

        #get similarity using spacy
        nlp = spacy.load('en_core_web_sm')
        text1 = nlp(text1)
        text2 = nlp(text2)
        ratio = text1.similarity(text2)

        #Token is -1
        db_users.update({"Username": username},{
                "$set": {
                    "Token": remained_tokens - 1
                }
            })
        retJson = {
            "status": 200, 
            "ratio": ratio,
            "msg": "Similarity detection done!"
        }
        return retJson


class Refill(Resource):
    def post(self):
        #Extract data from http request 
        data = request.get_json()
        username = data["username"]
        password = data["admin_pw"]
        refill_amount = data["refill"]

        #Validations
        if not UserExist(username):
            return getRetJson(301)

        #Special check for admin user
        correct_pw = "admin"
        if not correct_pw == password:
            return getRetJson(302)

        #Refill
        remained_tokens = countTokens(username) + refill_amount
        db_users.update({"Username": username},{
                "$set": {
                    "Token": remained_tokens
                }
            })

        retJson = {
            "status": 200, 
            "msg": "Successfully refilled",
            "Remain": remained_tokens
        }
        return retJson

#Web API initialization
app = Flask(__name__)
api = Api(app)
api.add_resource(Register, '/register')
api.add_resource(Detect, '/detect')
api.add_resource(Refill, '/refill')

#DB client initialization
db_client = MongoClient("mongodb://db:27017")
db = db_client.SimilarityDB
db_users = db["Users"]

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5050) 






