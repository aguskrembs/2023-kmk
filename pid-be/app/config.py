import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, initialize_app

load_dotenv()

EMAIL_API_ROOT = os.getenv('EMAIL_API_ROOT', 'http://localhost:9000')

def initialize_firebase_app():
    credentials_to_use = credentials.Certificate(
        {
            "type": "service_account",
            "project_id": os.environ.get("PROJECT_ID"),
            "private_key_id": os.environ.get("PRIVATE_KEY_ID"),
            "private_key": os.environ.get("PRIVATE_KEY"),
            "client_email": os.environ.get("CLIENT_EMAIL"),
            "client_id": os.environ.get("CLIENT_ID"),
            "auth_uri": os.environ.get("AUTH_URI"),
            "token_uri": os.environ.get("TOKEN_URI"),
            "auth_provider_x509_cert_url": os.environ.get(
                "AUTH_PROVIDER_X509_CERT_URL"
            ),
            "client_x509_cert_url": os.environ.get("CLIENT_X509_CERT_URL"),
            "universe_domain": os.environ.get("UNIVERSE_DOMAIN"),
        }
    )
    if not firebase_admin._apps:
        initialize_app(credentials_to_use, {"storageBucket": "pid-kmk.appspot.com"})
