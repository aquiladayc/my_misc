from flask import Flask, request
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)

# Returns a fixed JSON object
class Root(Resource):
    def get(self):
        
        data = {
            'status': 200,
            'message': 'Hello from Simple API',
            'usage': 'Give a JSON object to /asis, it will just return it'
        }
        
        return data

#Returns a given JSON obejct without modification
class Asis(Resource):
    def post(self):
        
        data = request.get_json()

        return data

api.add_resource(Root, '/')
api.add_resource(Asis, '/asis')


if __name__=="__main__":
    app.run(debug=True, host='0.0.0.0', port=5050)
