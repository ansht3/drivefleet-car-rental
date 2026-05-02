-- now i have the schema for the database for reference to ensure i have tthe tables properly for the car rentals

PRAGMA foreign_keys = ON;

-- branches where cars are kept
CREATE TABLE IF NOT EXISTS location (
    location_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name        VARCHAR(100) NOT NULL,
    address     VARCHAR(200) NOT NULL,
    city        VARCHAR(100) NOT NULL
);

-- customers email and license are unique so no duplicates as well as the primary key
CREATE TABLE IF NOT EXISTS customer (
    customer_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name     VARCHAR(50)  NOT NULL,
    last_name      VARCHAR(50)  NOT NULL,
    email          VARCHAR(120) NOT NULL UNIQUE,
    driver_license VARCHAR(50)  NOT NULL UNIQUE
);

-- each vehicle belongs to one location daily rate used to calc cost acordingly
CREATE TABLE IF NOT EXISTS vehicle (
    vehicle_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    make        VARCHAR(50) NOT NULL,
    model       VARCHAR(50) NOT NULL,
    year        INTEGER     NOT NULL,
    daily_rate  REAL        NOT NULL,
    location_id INTEGER     NOT NULL,
    FOREIGN KEY (location_id) REFERENCES location(location_id)
);

-- main table for CRUD (req 1)
-- now the actual rental for all of the CRUD operations for the car, with the total cost as well ahte actual booked status
CREATE TABLE IF NOT EXISTS rental (
    rental_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id        INTEGER     NOT NULL,
    vehicle_id         INTEGER     NOT NULL,
    pickup_location_id INTEGER     NOT NULL,
    pickup_date        DATE        NOT NULL,
    return_date        DATE        NOT NULL,
    total_cost         REAL        NOT NULL,
    status             VARCHAR(20) NOT NULL DEFAULT 'Booked',
    FOREIGN KEY (customer_id)        REFERENCES customer(customer_id),
    FOREIGN KEY (vehicle_id)         REFERENCES vehicle(vehicle_id),
    FOREIGN KEY (pickup_location_id) REFERENCES location(location_id)
);


-- here i am defining my indexes based onthe endpoints that i have within my models.py file

-- for the actual get request for /api/customers as it sorts by last name
CREATE INDEX IF NOT EXISTS ix_customer_last_name
    ON customer(last_name);

-- getting the location for the /api/vehicles get request endpoint
CREATE INDEX IF NOT EXISTS ix_vehicle_location_id
    ON vehicle(location_id);

-- for the actual get request for /api/vehicles as it sorts by make
CREATE INDEX IF NOT EXISTS ix_vehicle_make
    ON vehicle(make);

-- for the actual get request for /api/rentals as it sorts by pickup location id and pickup date
CREATE INDEX IF NOT EXISTS ix_rental_pickup_location_pickup_date
    ON rental(pickup_location_id, pickup_date);

-- creating an index for the actual get request for /api/rentals as it sorts by pickup date
CREATE INDEX IF NOT EXISTS ix_rental_pickup_date
    ON rental(pickup_date);
