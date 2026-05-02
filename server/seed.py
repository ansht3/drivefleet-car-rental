# now this is for adding mock data into my application
from datetime import date

from app import app
from models import Customer, Location, Rental, Vehicle, db

 # now this is march so every rental lands in one calendar month
SEED_YEAR = 2026
SEED_MONTH = 3 


def d(day: int, duration_days: int = 0) -> date:
    # now this builds the anchor date for march using our seed constants
    base = date(SEED_YEAR, SEED_MONTH, day)

    # now if there is no rental span we only need the pickup day
    if duration_days == 0:
        return base

    later_ordinal = base.toordinal() + duration_days
    return date.fromordinal(later_ordinal)


with app.app_context():
    db.drop_all()
    db.create_all()

    locations = [
        Location(name="Downtown Hub", address="101 Main St", city="Indianapolis"),
        Location(name="Airport Branch", address="5000 Airport Blvd", city="Indianapolis"),
        Location(name="West Side Depot", address="300 Commerce Dr", city="Lafayette"),
    ]
    # adding the locations to the db and then flushing
    db.session.add_all(locations)
    db.session.flush()

    customers = [
        Customer(first_name="Alice", last_name="Johnson", email="alice@example.com", driver_license="IN-A1001"),
        Customer(first_name="Bob", last_name="Martinez", email="bob@example.com", driver_license="IN-B2002"),
        Customer(first_name="Carol", last_name="Lee", email="carol@example.com", driver_license="IN-C3003"),
        Customer(first_name="David", last_name="Kim", email="david@example.com", driver_license="IN-D4004"),
        Customer(first_name="Eva", last_name="Patel", email="eva@example.com", driver_license="IN-E5005"),
    ]
    # adding the customers to the db and then flushing
    db.session.add_all(customers)
    db.session.flush()

    # getting the ids for the locations
    loc1, loc2, loc3 = locations[0], locations[1], locations[2]


    # adding the vehicles to the db and then flushing
    vehicles = [
        Vehicle(make="Toyota", model="Camry", year=2022, daily_rate=55.0, location_id=loc1.location_id),
        Vehicle(make="Honda", model="Accord", year=2023, daily_rate=60.0, location_id=loc1.location_id),
        Vehicle(make="Ford", model="Explorer", year=2021, daily_rate=75.0, location_id=loc1.location_id),
        Vehicle(make="Chevrolet", model="Malibu", year=2022, daily_rate=50.0, location_id=loc1.location_id),
        Vehicle(make="BMW", model="X5", year=2023, daily_rate=120.0, location_id=loc2.location_id),
        Vehicle(make="Mercedes", model="C-Class", year=2022, daily_rate=110.0, location_id=loc2.location_id),
        Vehicle(make="Audi", model="Q5", year=2023, daily_rate=115.0, location_id=loc2.location_id),
        Vehicle(make="Nissan", model="Altima", year=2021, daily_rate=48.0, location_id=loc3.location_id),
        Vehicle(make="Hyundai", model="Sonata", year=2022, daily_rate=45.0, location_id=loc3.location_id),
        Vehicle(make="Kia", model="Optima", year=2023, daily_rate=47.0, location_id=loc3.location_id),
    ]
    db.session.add_all(vehicles)
    db.session.flush()

    # this is for the actual rental space that i do have
    rental_specs = [
        (0, 0, 2, 3, "Returned"),
        (1, 1, 3, 5, "Returned"),
        (2, 2, 4, 2, "Returned"),
        (3, 3, 6, 4, "Returned"),
        (4, 0, 10, 3, "Booked"),
        (0, 2, 15, 2, "Booked"),
        (1, 3, 18, 3, "Active"),
        (2, 1, 20, 5, "Booked"),
        (4, 4, 1, 7, "Returned"),
        (0, 5, 8, 3, "Returned"),
        (1, 6, 9, 6, "Returned"),
        (3, 4, 16, 4, "Active"),
        (2, 5, 21, 4, "Booked"),
        (1, 7, 10, 4, "Returned"),
        (2, 8, 12, 3, "Returned"),
        (3, 9, 14, 5, "Active"),
        (4, 7, 17, 3, "Booked"),
        (0, 8, 19, 4, "Booked"),
        (1, 9, 22, 4, "Booked"),
        (2, 7, 24, 3, "Booked"),
    ]

    rentals = []
    # now i will do an iteration through each of the stamp dates and the actual dates and retur n date vheicle and rate
    for cust_i, veh_i, pickup_day, dur, status in rental_specs:
        pickup = d(pickup_day)
        ret = d(pickup_day, dur)
        v = vehicles[veh_i]

        cost = dur * v.daily_rate
        cost = round(cost, 2)

        rentals.append(
            Rental(
                customer_id=customers[cust_i].customer_id,
                vehicle_id=v.vehicle_id,
                pickup_location_id=v.location_id,
                pickup_date=pickup,
                return_date=ret,
                total_cost=cost,
                status=status,
            )
        )

    db.session.add_all(rentals)
    db.session.commit()

    # this is a quick sanity check i am doing to enusre that i have the total revelue properly 
    total_rev = 0
    for r in rentals:
        total_rev += r.total_cost
    print(f"Total revenue: ${total_rev:,.2f}")
    print(f"Each customer has rented {len(rentals)} times and for the locations of {len(locations)} and the cusotmers are total of {len(customers)}")
    print(f"The vehicles are total of {len(vehicles)} and the rentals are total of {len(rentals)}")
