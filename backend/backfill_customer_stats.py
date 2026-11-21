
from app.database import connect_to_mongodb, close_mongodb_connection
from app.services.customer_stats_service import recalculate_customer_stats


def main():
    db = connect_to_mongodb()

    try:
        customers = list(db.customers.find({}))

        print("\n========== CUSTOMER STATISTICS BACKFILL ==========")
        print(f"Customers to update: {len(customers)}")

        for customer in customers:
            print(
                f"- {customer.get('name', 'Unknown')} "
                f"({customer['_id']})"
            )

        confirmation = input(
            "\nType APPLY to recalculate customer statistics: "
        )

        if confirmation != "APPLY":
            print("\nBackfill cancelled. No records modified.")
            return

        updated = 0

        for customer in customers:
            recalculate_customer_stats(
                db=db,
                business_id=str(customer["business_id"]),
                customer_id=str(customer["_id"]),
            )

            updated += 1

            print(
                f"Updated: {customer.get('name', 'Unknown')}"
            )

        print("\n========== BACKFILL COMPLETED ==========")
        print(f"Customers processed: {updated}")
        print("Customer statistics recalculated successfully.")

    finally:
        close_mongodb_connection()


if __name__ == "__main__":
    main()
