import pytest
import requests
from .config import *
from firebase_admin import auth, firestore

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


a_KMK_physician_information = {
    "role": "physician",
    "name": "Physician Test User Register",
    "last_name": "Test Last Name",
    "tuition": "777777",
    "specialty": specialties[0],
    "email": "testphysicianforgettingroles@kmk.com",
    "password": "verySecurePassword123",
}

a_KMK_patient_information = {
    "role": "patient",
    "name": "Patient Test User Register",
    "last_name": "Test Last Name",
    "email": "testpatientforgettingroles@kmk.com",
    "password": "verySecurePassword123",
    "birth_date": "9/1/2000",
    "gender": "m",
    "blood_type": "a",
}

initial_admin_information = {
    "email": "testinitialadminforgettingroles@kmk.com",
    "password": "verySecurePassword123",
}


@pytest.fixture(scope="session", autouse=True)
def clean_firestore():
    requests.delete(
        "http://localhost:8081/emulator/v1/projects/pid-kmk/databases/(default)/documents"
    )
    yield


@pytest.fixture(scope="session", autouse=True)
def load_and_delete_specialties(clean_firestore):
    for specialty in specialties:
        db.collection("specialties").document().set({"name": specialty})
    yield
    specilaties_doc = db.collection("specialties").list_documents()
    for specialty_doc in specilaties_doc:
        specialty_doc.delete()


@pytest.fixture(scope="session", autouse=True)
def create_patient_and_then_delete_him(load_and_delete_specialties):
    requests.post(
        "http://localhost:8080/users/register",
        json=a_KMK_patient_information,
    )
    yield
    created_test_patient_uid = auth.get_user_by_email(
        a_KMK_patient_information["email"]
    ).uid
    auth.delete_user(created_test_patient_uid)
    db.collection("patients").document(created_test_patient_uid).delete()


@pytest.fixture(scope="session", autouse=True)
def log_in_patient(create_patient_and_then_delete_him):
    pytest.patient_bearer = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_patient_information["email"],
            "password": a_KMK_patient_information["password"],
        },
    ).json()["token"]
    yield


@pytest.fixture(scope="session", autouse=True)
def create_physician_and_then_delete_him(log_in_patient):
    requests.post(
        "http://localhost:8080/users/register",
        json=a_KMK_physician_information,
    )
    yield
    try:
        created_test_physician_uid = auth.get_user_by_email(
            a_KMK_physician_information["email"]
        ).uid
        auth.delete_user(created_test_physician_uid)
        db.collection("physicians").document(created_test_physician_uid).delete()
    except:
        print("[+] Physisican has not been created")


@pytest.fixture(scope="session", autouse=True)
def log_in_physician(create_physician_and_then_delete_him):
    pytest.physician_bearer = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_physician_information["email"],
            "password": a_KMK_physician_information["password"],
        },
    ).json()["token"]
    yield


@pytest.fixture(scope="session", autouse=True)
def create_initial_admin_and_then_delete_him(log_in_physician):
    pytest.initial_admin_uid = auth.create_user(**initial_admin_information).uid
    db.collection("superusers").document(pytest.initial_admin_uid).set(
        initial_admin_information
    )
    yield
    auth.delete_user(pytest.initial_admin_uid)
    db.collection("superusers").document(pytest.initial_admin_uid).delete()


@pytest.fixture(scope="session", autouse=True)
def log_in_initial_admin_user(create_initial_admin_and_then_delete_him):
    pytest.initial_admin_bearer = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": initial_admin_information["email"],
            "password": initial_admin_information["password"],
        },
    ).json()["token"]
    yield


def test_role_retrieving_of_an_admin_returns_a_200_code():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    assert response_from_users_role_endpoint.status_code == 200


def test_role_retrieving_of_an_admin_returns_a_list_of_roles():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    assert type(response_from_users_role_endpoint.json()["roles"]) == list


def test_role_retrieving_of_an_admin_returns_only_admin_role():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    assert len(response_from_users_role_endpoint.json()["roles"]) == 1
    assert response_from_users_role_endpoint.json()["roles"][0] == "admin"


def test_role_retrieving_of_a_patient_returns_a_200_code():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.patient_bearer}"},
    )

    assert response_from_users_role_endpoint.status_code == 200


def test_role_retrieving_of_a_patient_returns_a_list_of_roles():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.patient_bearer}"},
    )

    assert type(response_from_users_role_endpoint.json()["roles"]) == list


def test_role_retrieving_of_a_patient_returns_only_patient_role():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.patient_bearer}"},
    )

    assert len(response_from_users_role_endpoint.json()["roles"]) == 1
    assert response_from_users_role_endpoint.json()["roles"][0] == "patient"


def test_role_retrieving_of_a_pending_physician_returns_a_403_code():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.physician_bearer}"},
    )

    assert response_from_users_role_endpoint.status_code == 403
    assert (
        response_from_users_role_endpoint.json()["detail"]
        == "Physician must be approved by admin"
    )


def test_role_retrieving_of_a_denied_physician_returns_a_403_code():
    physician_uid = auth.get_user_by_email(a_KMK_physician_information["email"]).uid
    db.collection("physicians").document(physician_uid).update({"approved": "denied"})
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.physician_bearer}"},
    )

    assert response_from_users_role_endpoint.status_code == 403
    assert (
        response_from_users_role_endpoint.json()["detail"]
        == "Physician must be approved by admin"
    )


def test_role_retrieving_of_an_approved_physician_returns_a_200_code():
    physician_uid = auth.get_user_by_email(a_KMK_physician_information["email"]).uid
    db.collection("physicians").document(physician_uid).update({"approved": "approved"})
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.physician_bearer}"},
    )

    assert response_from_users_role_endpoint.status_code == 200


def test_role_retrieving_of_an_approved_physician_returns_a_list_of_roles():
    physician_uid = auth.get_user_by_email(a_KMK_physician_information["email"]).uid
    db.collection("physicians").document(physician_uid).update({"approved": "approved"})
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.physician_bearer}"},
    )

    assert type(response_from_users_role_endpoint.json()["roles"]) == list


def test_role_retrieving_of_an_approved_physician_returns_only_physician_role():
    physician_uid = auth.get_user_by_email(a_KMK_physician_information["email"]).uid
    db.collection("physicians").document(physician_uid).update({"approved": "approved"})
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.physician_bearer}"},
    )

    assert len(response_from_users_role_endpoint.json()["roles"]) == 1
    assert response_from_users_role_endpoint.json()["roles"][0] == "physician"


def test_role_retrieving_of_a_user_that_has_multiple_roles_returns_a_list_with_the_roles():
    requests.post(
        "http://localhost:8080/users/register",
        json={
            "role": "patient",
            "name": a_KMK_physician_information["name"],
            "last_name": a_KMK_physician_information["last_name"],
            "email": a_KMK_physician_information["email"],
            "password": a_KMK_physician_information["password"],
            "birth_date": "9/1/2000",
            "gender": "m",
            "blood_type": "a",
        },
    )
    physician_uid = auth.get_user_by_email(a_KMK_physician_information["email"]).uid
    db.collection("physicians").document(physician_uid).update({"approved": "approved"})
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer {pytest.physician_bearer}"},
    )

    assert len(response_from_users_role_endpoint.json()["roles"]) == 2
    assert set(response_from_users_role_endpoint.json()["roles"]) == {
        "patient",
        "physician",
    }
    db.collection("patients").document(physician_uid).delete()


def test_get_roles_with_no_authorization_header_returns_401_code():
    response_from_users_role_endpoint = requests.get("http://localhost:8080/users/role")

    assert response_from_users_role_endpoint.status_code == 401
    assert (
        response_from_users_role_endpoint.json()["detail"] == "User must be logged in"
    )


def test_get_roles_with_empty_authorization_header_returns_401_code():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": ""},
    )

    assert response_from_users_role_endpoint.status_code == 401
    assert (
        response_from_users_role_endpoint.json()["detail"] == "User must be logged in"
    )


def test_get_roles_with_empty_bearer_token_returns_401_code():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": f"Bearer "},
    )

    assert response_from_users_role_endpoint.status_code == 401
    assert (
        response_from_users_role_endpoint.json()["detail"] == "User must be logged in"
    )


def test_get_roles_with_non_bearer_token_returns_401_code():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": pytest.initial_admin_bearer},
    )

    assert response_from_users_role_endpoint.status_code == 401
    assert (
        response_from_users_role_endpoint.json()["detail"] == "User must be logged in"
    )


def test_get_roles_with_invalid_bearer_token_returns_401_code():
    response_from_users_role_endpoint = requests.get(
        "http://localhost:8080/users/role",
        headers={"Authorization": "Bearer smth"},
    )

    assert response_from_users_role_endpoint.status_code == 401
    assert (
        response_from_users_role_endpoint.json()["detail"] == "User must be logged in"
    )