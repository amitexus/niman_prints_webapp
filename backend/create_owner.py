
from datetime import datetime, timezone
from getpass import getpass

from bson import ObjectId

from app.database import connect_to_mongodb
from app.core.security import hash_password


def main():
    print("\n=== NIMAN PRINTS OWNER ACCOUNT SETUP ===\n")

    business_id = input("Enter your existing Business ID: ").strip()

    if not ObjectId.is_valid(business_id):
        print("Error: Invalid Business ID.")
        return

    db = connect_to_mongodb()

    business = db.businesses.find_one({
        "_id": ObjectId(business_id),
        "is_active": True,
    })

    if not business:
        print("Error: Active business not found.")
        return

    print(f"\nBusiness: {business['business_name']}")

    full_name = input("Owner full name: ").strip()
    email = input("Owner email: ").strip().lower()

    if len(full_name) < 2 or "@" not in email:
        print("Error: Enter a valid name and email.")
        return

    if db.users.find_one({"email": email}):
        print("Error: This email already has an account.")
        return

    password = getpass("Create password (minimum 8 characters): ")
    confirm_password = getpass("Confirm password: ")

    if len(password) < 8:
        print("Error: Password must contain at least 8 characters.")
        return

    if password != confirm_password:
        print("Error: Passwords do not match.")
        return

    user_document = {
        "business_id": str(business["_id"]),
        "full_name": full_name,
        "email": email,
        "password_hash": hash_password(password),
        "role": "owner",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = db.users.insert_one(user_document)

    print("\nOwner account created successfully!")
    print(f"User ID: {result.inserted_id}")
    print(f"Email: {email}")
    print("Role: owner")
    print("\nYou can now log in through the Authentication API.")


if __name__ == "__main__":
    main()
