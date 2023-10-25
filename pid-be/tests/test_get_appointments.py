import pytest
import time
from datetime import datetime, timedelta
import requests
from .config import *
from firebase_admin import auth, firestore

db = firestore.client()

today_date = datetime.fromtimestamp(round(time.time()))
number_of_day_of_week = int(today_date.date().strftime("%w"))
next_week_day = today_date + timedelta(days=7)
next_week_day_first_block = next_week_day.replace(hour=9)
next_week_day_second_block = next_week_day.replace(hour=10)
next_week_day_third_block = next_week_day.replace(hour=11)

a_KMK_user_information = {
    "display_name": "KMK Test User",
    "email": "getApppointmentTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

another_KMK_user_information = {
    "display_name": "Second KMK Test User",
    "email": "getApppointmentSecondTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

other_KMK_user_information = {
    "display_name": "Third KMK Test User",
    "email": "getApppointmentThirdTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

a_KMK_physician_information = {
    "display_name": "Doc Docson",
    "email": "getApppointmentDocDocson@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

another_KMK_physician_information = {
    "display_name": "Doc Docson the Second",
    "email": "getApppointmentDocDocsonSecond@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

an_appointment_data = {
    "date": round(next_week_day_first_block.timestamp()),
}

another_appointment_data = {
    "date": round(next_week_day_second_block.timestamp()),
}

other_appointment_data = {
    "date": round(next_week_day_third_block.timestamp()),
}


@pytest.fixture(scope="session", autouse=True)
def clean_firestore():
    requests.delete(
        "http://localhost:8081/emulator/v1/projects/pid-kmk/databases/(default)/documents"
    )


@pytest.fixture(scope="session", autouse=True)
def create_test_users(clean_firestore):
    first_created_user = auth.create_user(**a_KMK_user_information)
    second_created_user = auth.create_user(**another_KMK_user_information)
    third_created_user = auth.create_user(**other_KMK_user_information)
    a_KMK_user_information["uid"] = first_created_user.uid
    another_KMK_user_information["uid"] = second_created_user.uid
    other_KMK_user_information["uid"] = third_created_user.uid

    db.collection("patients").document(a_KMK_user_information["uid"]).set(
        {"id": a_KMK_user_information["uid"], "first_name": "KMK", "last_name": "First"}
    )
    db.collection("patients").document(another_KMK_user_information["uid"]).set(
        {
            "id": another_KMK_user_information["uid"],
            "first_name": "KMK",
            "last_name": "Second",
        }
    )
    db.collection("patients").document(other_KMK_user_information["uid"]).set(
        {
            "id": other_KMK_user_information["uid"],
            "first_name": "KMK",
            "last_name": "Third",
        }
    )
    yield
    auth.delete_user(a_KMK_user_information["uid"])
    auth.delete_user(another_KMK_user_information["uid"])
    auth.delete_user(other_KMK_user_information["uid"])
    db.collection("patients").document(a_KMK_user_information["uid"]).delete()
    db.collection("patients").document(another_KMK_user_information["uid"]).delete()
    db.collection("patients").document(other_KMK_user_information["uid"]).delete()


@pytest.fixture(scope="session", autouse=True)
def create_test_physicians(create_test_users):
    first_created_physician = auth.create_user(**a_KMK_physician_information)
    second_created_physician = auth.create_user(**another_KMK_physician_information)
    a_KMK_physician_information["uid"] = first_created_physician.uid
    another_KMK_physician_information["uid"] = second_created_physician.uid

    db.collection("physicians").document(a_KMK_physician_information["uid"]).set(
        {
            "id": a_KMK_physician_information["uid"],
            "first_name": "Doc",
            "last_name": "Docson",
            "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
            "specialty": "surgeon",
            "approved": "approved",
        }
    )
    db.collection("physicians").document(another_KMK_physician_information["uid"]).set(
        {
            "id": another_KMK_physician_information["uid"],
            "first_name": "Doc",
            "last_name": "Docson the Second",
            "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
            "specialty": "surgeon",
            "approved": "approved",
        }
    )
    yield
    auth.delete_user(a_KMK_physician_information["uid"])
    auth.delete_user(another_KMK_physician_information["uid"])
    db.collection("physicians").document(a_KMK_physician_information["uid"]).delete()
    db.collection("physicians").document(
        another_KMK_physician_information["uid"]
    ).delete()


@pytest.fixture(scope="session", autouse=True)
def create_login_tokens(create_test_physicians):
    response_from_login_endpoint_for_first_user = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )

    pytest.first_bearer = response_from_login_endpoint_for_first_user.json()["token"]

    response_from_login_endpoint_for_second_user = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": another_KMK_user_information["email"],
            "password": another_KMK_user_information["password"],
        },
    )

    pytest.second_bearer = response_from_login_endpoint_for_second_user.json()["token"]

    response_from_login_endpoint_for_third_user = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": other_KMK_user_information["email"],
            "password": other_KMK_user_information["password"],
        },
    )

    pytest.third_bearer = response_from_login_endpoint_for_third_user.json()["token"]

    response_from_login_endpoint_for_first_physician = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_physician_information["email"],
            "password": a_KMK_physician_information["password"],
        },
    )

    pytest.first_physician_bearer = (
        response_from_login_endpoint_for_first_physician.json()["token"]
    )

    response_from_login_endpoint_for_second_physician = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": another_KMK_physician_information["email"],
            "password": another_KMK_physician_information["password"],
        },
    )

    pytest.second_physician_bearer = (
        response_from_login_endpoint_for_second_physician.json()["token"]
    )


@pytest.fixture(scope="session", autouse=True)
def create_test_appointments(create_login_tokens):
    an_appointment_data["physician_id"] = a_KMK_physician_information["uid"]
    another_appointment_data["physician_id"] = another_KMK_physician_information["uid"]
    other_appointment_data["physician_id"] = another_KMK_physician_information["uid"]

    first_appointment_creation_response = requests.post(
        "http://localhost:8080/appointments",
        json=an_appointment_data,
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    an_appointment_data["id"] = first_appointment_creation_response.json()[
        "appointment_id"
    ]

    second_appointment_creation_response = requests.post(
        "http://localhost:8080/appointments",
        json=another_appointment_data,
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    another_appointment_data["id"] = second_appointment_creation_response.json()[
        "appointment_id"
    ]

    third_appointment_creation_response = requests.post(
        "http://localhost:8080/appointments",
        json=other_appointment_data,
        headers={"Authorization": f"Bearer {pytest.second_bearer}"},
    )

    other_appointment_data["id"] = third_appointment_creation_response.json()[
        "appointment_id"
    ]


def test_valid_request_to_get_endpoint_returns_200_code():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert response_to_get_endpoint.status_code == 200


def test_valid_request_to_get_endpoint_returns_a_list_of_two_elements_for_the_first_user():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert type(response_to_get_endpoint.json()["appointments"]) == list
    assert len(response_to_get_endpoint.json()["appointments"]) == 2


def test_valid_request_to_get_endpoint_returns_a_list_of_one_element_for_the_second_user():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.second_bearer}"},
    )

    assert type(response_to_get_endpoint.json()["appointments"]) == list
    assert len(response_to_get_endpoint.json()["appointments"]) == 1


def test_valid_request_to_get_endpoint_returns_an_empty_list_for_the_second_user():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.third_bearer}"},
    )

    assert type(response_to_get_endpoint.json()["appointments"]) == list
    assert len(response_to_get_endpoint.json()["appointments"]) == 0


def test_valid_request_to_get_endpoint_returns_populated_appointment_objects():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    appointments = response_to_get_endpoint.json()["appointments"]
    first_appointment_to_validate = appointments[0]
    second_appointment_to_validate = appointments[1]

    assert first_appointment_to_validate["id"] == an_appointment_data["id"]
    assert first_appointment_to_validate["date"] == an_appointment_data["date"]
    assert first_appointment_to_validate.get("physician_id") == None
    assert first_appointment_to_validate.get("patient_id") == None
    assert first_appointment_to_validate["physician"] == {
        "id": a_KMK_physician_information["uid"],
        "first_name": "Doc",
        "last_name": "Docson",
        "specialty": "surgeon",
        "agenda": {
            "working_days": [number_of_day_of_week],
            "working_hours": [
                {
                    "day_of_week": number_of_day_of_week,
                    "start_time": 8,
                    "finish_time": 18.5,
                }
            ],
            "appointments": [an_appointment_data["date"]],
        },
    }
    assert first_appointment_to_validate["patient"] == {
        "id": a_KMK_user_information["uid"],
        "first_name": "KMK",
        "last_name": "First",
    }
    assert type(first_appointment_to_validate["created_at"]) == int

    assert second_appointment_to_validate["id"] == another_appointment_data["id"]
    assert second_appointment_to_validate["date"] == another_appointment_data["date"]
    assert second_appointment_to_validate.get("physician_id") == None
    assert second_appointment_to_validate.get("patient_id") == None
    second_appointment_to_validate["physician"]["agenda"]["appointments"] = set(
        second_appointment_to_validate["physician"]["agenda"]["appointments"]
    )
    assert second_appointment_to_validate["physician"] == {
        "id": another_KMK_physician_information["uid"],
        "first_name": "Doc",
        "last_name": "Docson the Second",
        "specialty": "surgeon",
        "agenda": {
            "working_days": [number_of_day_of_week],
            "working_hours": [
                {
                    "day_of_week": number_of_day_of_week,
                    "start_time": 8,
                    "finish_time": 18.5,
                }
            ],
            "appointments": {
                other_appointment_data["date"],
                another_appointment_data["date"],
            },
        },
    }
    assert second_appointment_to_validate["patient"] == {
        "id": a_KMK_user_information["uid"],
        "first_name": "KMK",
        "last_name": "First",
    }
    assert type(second_appointment_to_validate["created_at"]) == int


def test_get_appointments_with_no_authorization_header_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments"
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointments_with_empty_authorization_header_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": ""},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointments_with_empty_bearer_token_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer "},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointments_with_non_bearer_token_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": pytest.first_bearer},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointments_with_invalid_bearer_token_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": "Bearer smth"},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointments_for_second_physician_return_a_200_code():
    response_to_appointment_get_endpoint = requests.get(
        f"http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.second_physician_bearer}"},
    )

    assert response_to_appointment_get_endpoint.status_code == 200


def test_get_appointments_for_second_physician_returns_a_list():
    response_to_appointment_get_endpoint = requests.get(
        f"http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.second_physician_bearer}"},
    )

    assert type(response_to_appointment_get_endpoint.json()["appointments"]) == list


def test_get_appointments_for_second_physician_returns_a_list_of_two_elements():
    response_to_appointment_get_endpoint = requests.get(
        f"http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.second_physician_bearer}"},
    )

    assert len(response_to_appointment_get_endpoint.json()["appointments"]) == 2


def test_valid_request_to_get_endpoint_returns_populated_appointment_objects_for_physician():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.second_physician_bearer}"},
    )

    appointments = response_to_get_endpoint.json()["appointments"]
    first_appointment_to_validate = appointments[0]
    second_appointment_to_validate = appointments[1]

    assert first_appointment_to_validate["id"] == another_appointment_data["id"]
    assert first_appointment_to_validate["date"] == another_appointment_data["date"]
    assert first_appointment_to_validate.get("physician_id") == None
    assert first_appointment_to_validate.get("patient_id") == None
    first_appointment_to_validate["physician"]["agenda"]["appointments"] = set(
        first_appointment_to_validate["physician"]["agenda"]["appointments"]
    )
    assert first_appointment_to_validate["physician"] == {
        "id": another_KMK_physician_information["uid"],
        "first_name": "Doc",
        "last_name": "Docson the Second",
        "specialty": "surgeon",
        "agenda": {
            "working_days": [number_of_day_of_week],
            "working_hours": [
                {
                    "day_of_week": number_of_day_of_week,
                    "start_time": 8,
                    "finish_time": 18.5,
                }
            ],
            "appointments": {
                other_appointment_data["date"],
                another_appointment_data["date"],
            },
        },
    }
    assert first_appointment_to_validate["patient"] == {
        "id": a_KMK_user_information["uid"],
        "first_name": "KMK",
        "last_name": "First",
    }
    assert type(first_appointment_to_validate["created_at"]) == int

    assert second_appointment_to_validate["id"] == other_appointment_data["id"]
    assert second_appointment_to_validate["date"] == other_appointment_data["date"]
    assert second_appointment_to_validate.get("physician_id") == None
    assert second_appointment_to_validate.get("patient_id") == None
    second_appointment_to_validate["physician"]["agenda"]["appointments"] = set(
        second_appointment_to_validate["physician"]["agenda"]["appointments"]
    )
    assert second_appointment_to_validate["physician"] == {
        "id": another_KMK_physician_information["uid"],
        "first_name": "Doc",
        "last_name": "Docson the Second",
        "specialty": "surgeon",
        "agenda": {
            "working_days": [number_of_day_of_week],
            "working_hours": [
                {
                    "day_of_week": number_of_day_of_week,
                    "start_time": 8,
                    "finish_time": 18.5,
                }
            ],
            "appointments": {
                other_appointment_data["date"],
                another_appointment_data["date"],
            },
        },
    }
    assert second_appointment_to_validate["patient"] == {
        "id": another_KMK_user_information["uid"],
        "first_name": "KMK",
        "last_name": "Second",
    }
    assert type(second_appointment_to_validate["created_at"]) == int