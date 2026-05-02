from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# here i am going ahead and creating each of mu classes as well as the respective indexes

class Location(db.Model):
    __tablename__ = "location"

    location_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    city = db.Column(db.String, nullable=False)

    vehicles = db.relationship("Vehicle", back_populates="location", lazy=True)
    pickup_rentals = db.relationship("Rental", foreign_keys="Rental.pickup_location_id", back_populates="pickup_location", lazy=True)

    def converting_to_my_dict(self):
        return {
            "location_id": self.location_id,
            "name": self.name,
            "address": self.address,
            "city": self.city,
        }


class Customer(db.Model):
    __tablename__ = "customer"
    # i am creaeting an index for vehicle last name as each of the customer dropdown is sorted based on the last name
    __table_args__ = (
        db.Index("ix_customer_last_name", "last_name"),
    )

    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    driver_license = db.Column(db.String, unique=True, nullable=False)
    rentals = db.relationship("Rental", back_populates="customer", lazy=True)

    def converting_to_my_dict(self):
        return {
            "customer_id": self.customer_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "driver_license": self.driver_license,
        }


class Vehicle(db.Model):
    __tablename__ = "vehicle"
    # here i am creating two indexes as the veihcle list is sorted based on th emake and the actual location id  and the location id when doing the vehicle count for the report
    __table_args__ = (
        db.Index("ix_vehicle_location_id", "location_id"),
        db.Index("ix_vehicle_make", "make"),
    )

    vehicle_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    make = db.Column(db.String, nullable=False)
    model = db.Column(db.String, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    daily_rate = db.Column(db.Float, nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey("location.location_id"), nullable=False)

    location = db.relationship("Location", back_populates="vehicles")
    rentals = db.relationship("Rental", back_populates="vehicle", lazy=True)

    def converting_to_my_dict(self):
        return {
            "vehicle_id": self.vehicle_id,
            "make": self.make,
            "model": self.model,
            "year": self.year,
            "daily_rate": self.daily_rate,
            "location_id": self.location_id,
        }


class Rental(db.Model):
    __tablename__ = "rental"
    #now for the pickup date i also have an index when all the rows get sorted based on that, but also a composite index for the report and csv which is based on the actual
    __table_args__ = (
        db.Index("ix_rental_pickup_location_pickup_date", "pickup_location_id", "pickup_date"),
        db.Index("ix_rental_pickup_date", "pickup_date"),
    )

    rental_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customer.customer_id"), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicle.vehicle_id"), nullable=False)
    pickup_location_id = db.Column(db.Integer, db.ForeignKey("location.location_id"), nullable=False)
    pickup_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)
    status = db.Column(db.String, nullable=False, default="Booked")

    customer = db.relationship("Customer", back_populates="rentals")
    vehicle = db.relationship("Vehicle", back_populates="rentals")
    pickup_location = db.relationship("Location", foreign_keys=[pickup_location_id], back_populates="pickup_rentals", lazy=True)

    def converting_to_my_dict(self):
        return {
            "rental_id": self.rental_id,
            "customer_id": self.customer_id,
            "customer_name": f"{self.customer.first_name} {self.customer.last_name}",
            "vehicle_id": self.vehicle_id,
            "vehicle_label": f"{self.vehicle.year} {self.vehicle.make} {self.vehicle.model}",
            "pickup_location_id": self.pickup_location_id,
            "pickup_location_name": self.pickup_location.name,
            "pickup_date": self.pickup_date.isoformat(),
            "return_date": self.return_date.isoformat(),
            "total_cost": self.total_cost,
            "status": self.status,
        }
