from firebase_admin import firestore

db = firestore.client()


class Admin:
    name: str
    last_name: str
    email: str
    id: str

    def __init__(self, name: str, last_name: str, email: str, id: str):
        self.name = name
        self.last_name = last_name
        self.email = email
        self.id = id

    @staticmethod
    def get_by_id(id):
        return db.collection("superusers").document(id).get().to_dict()

    @staticmethod
    def is_admin(id):
        if db.collection("superusers").document(id).get().to_dict():
            return True
        return False

    def create(self):
        db.collection("superusers").document(self.id).set(
            {
                "id": self.id,
                "first_name": self.name,
                "last_name": self.last_name,
                "email": self.email,
            }
        )
        return self.id
