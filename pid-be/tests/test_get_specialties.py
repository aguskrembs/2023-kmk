import pytest
import requests
from .config import *
from firebase_admin import firestore, auth

db = firestore.client()

specialties = [
    "pediatrics",
    "dermatology",
    "gastroenterology",
    "radiology",
    "urology",
    "ophtalmology",
    "endocrynology",
    "neurology",
    "cardiology",
    "family medicine",
    "psychiatry",
]

a_KMK_user_information = {
    "display_name": "KMK Test User",
    "email": "getSpecialtiesTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}


@pytest.fixture(scope="session", autouse=True)
def create_test_user():
    created_user = auth.create_user(**a_KMK_user_information)
    a_KMK_user_information["uid"] = created_user.uid
    yield
    auth.delete_user(a_KMK_user_information["uid"])


@pytest.fixture(scope="session", autouse=True)
def load_and_delete_specialties():
    for specialty in specialties:
        db.collection("specialties").document().set({"name": specialty})
    yield
    specilaties_doc = db.collection("specialties").list_documents()
    for specialty_doc in specilaties_doc:
        specialty_doc.delete()


def test_get_specialties_endpoint_returns_a_200_code():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_from_get_specialties_endpoint = requests.get(
        "http://localhost:8080/specialties",
        headers={
            "Authorization": f"Bearer {response_from_login_endpoint.json()['token']}"
        },
    )

    assert response_from_get_specialties_endpoint.status_code == 200


def test_get_specialties_endpoint_returns_a_list():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_from_get_specialties_endpoint = requests.get(
        "http://localhost:8080/specialties",
        headers={
            "Authorization": f"Bearer {response_from_login_endpoint.json()['token']}"
        },
    )

    assert type(response_from_get_specialties_endpoint.json()["specialties"]) == list


def test_get_specialties_endpoint_returns_the_list_of_all_specialties():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_from_get_specialties_endpoint = requests.get(
        "http://localhost:8080/specialties",
        headers={
            "Authorization": f"Bearer {response_from_login_endpoint.json()['token']}"
        },
    )

    assert set(response_from_get_specialties_endpoint.json()["specialties"]) == set(
        specialties
    )


def test_get_specialties_with_no_authorization_header_returns_401_code():
    response_to_get_specialties_endpoint = requests.get(
        "http://localhost:8080/specialties"
    )

    assert response_to_get_specialties_endpoint.status_code == 401
    assert (
        response_to_get_specialties_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_specialties_with_empty_authorization_header_returns_401_code():
    response_to_get_specialties_endpoint = requests.get(
        "http://localhost:8080/specialties",
        headers={"Authorization": ""},
    )

    assert response_to_get_specialties_endpoint.status_code == 401
    assert (
        response_to_get_specialties_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_specialties_with_empty_bearer_token_returns_401_code():
    response_to_get_specialties_endpoint = requests.get(
        "http://localhost:8080/specialties",
        headers={"Authorization": f"Bearer "},
    )

    assert response_to_get_specialties_endpoint.status_code == 401
    assert (
        response_to_get_specialties_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_specialties_with_non_bearer_token_returns_401_code():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_to_get_specialties_endpoint = requests.get(
        "http://localhost:8080/specialties",
        headers={"Authorization": response_from_login_endpoint.json()["token"]},
    )

    assert response_to_get_specialties_endpoint.status_code == 401
    assert (
        response_to_get_specialties_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_specialties_with_invalid_bearer_token_returns_401_code():
    response_to_get_specialties_endpoint = requests.get(
        "http://localhost:8080/specialties",
        headers={"Authorization": "Bearer smth"},
    )

    assert response_to_get_specialties_endpoint.status_code == 401
    assert (
        response_to_get_specialties_endpoint.json()["detail"]
        == "User must be logged in"
    )
