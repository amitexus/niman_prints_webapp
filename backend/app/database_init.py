from pymongo import ASCENDING, DESCENDING
from pymongo.database import Database


COLLECTIONS = [
    "businesses",
    "users",
    "products",
    "customers",
    "orders",
    "production_jobs",
    "inventory",
    "stock_movements",
    "suppliers",
    "purchases",
    "transactions",
    "campaigns",
    "leads",
    "notifications",
    "files",
    "audit_logs",
]


def initialize_database(db: Database):
    """Create application collections and their initial indexes."""

    existing_collections = set(db.list_collection_names())

    # Create any missing collections.
    for collection_name in COLLECTIONS:
        if collection_name not in existing_collections:
            db.create_collection(collection_name)
            print(f"Created collection: {collection_name}")

    # Index definitions.
    indexes = {
        "businesses": [
            ([("created_at", DESCENDING)], {}),
        ],
        "users": [
            ([("business_id", ASCENDING), ("email", ASCENDING)],
             {"unique": True}),
        ],
        "products": [
            ([("business_id", ASCENDING), ("sku", ASCENDING)],
             {"unique": True, "sparse": True}),
        ],
        "customers": [
            ([("business_id", ASCENDING), ("phone", ASCENDING)], {}),
        ],
        "orders": [
            ([("business_id", ASCENDING), ("order_number", ASCENDING)],
             {"unique": True}),
            ([("business_id", ASCENDING), ("created_at", DESCENDING)], {}),
        ],
        "production_jobs": [
            ([("business_id", ASCENDING), ("status", ASCENDING)], {}),
        ],
        "inventory": [
            ([("business_id", ASCENDING), ("sku", ASCENDING)],
             {"unique": True, "sparse": True}),
        ],
        "stock_movements": [
            ([("business_id", ASCENDING), ("created_at", DESCENDING)], {}),
        ],
        "suppliers": [
            ([("business_id", ASCENDING), ("name", ASCENDING)], {}),
        ],
        "purchases": [
            ([("business_id", ASCENDING), ("purchase_number", ASCENDING)],
             {"unique": True}),
        ],
        "transactions": [
            ([("business_id", ASCENDING), ("transaction_date", DESCENDING)], {}),
        ],
        "campaigns": [
            ([("business_id", ASCENDING), ("status", ASCENDING)], {}),
        ],
        "leads": [
            ([("business_id", ASCENDING), ("status", ASCENDING)], {}),
        ],
        "notifications": [
            ([("business_id", ASCENDING), ("created_at", DESCENDING)], {}),
        ],
        "files": [
            ([("business_id", ASCENDING), ("created_at", DESCENDING)], {}),
        ],
        "audit_logs": [
            ([("business_id", ASCENDING), ("created_at", DESCENDING)], {}),
        ],
    }

    for collection_name, collection_indexes in indexes.items():
        collection = db[collection_name]

        for fields, options in collection_indexes:
            collection.create_index(fields, **options)

    print("Niman Prints database initialized successfully.")

    return {
        "database": db.name,
        "collections": COLLECTIONS,
        "collection_count": len(COLLECTIONS),
        "status": "initialized",
    }