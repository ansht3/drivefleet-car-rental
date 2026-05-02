from flask import Flask, Response, jsonify, request, send_from_directory
from flask_cors import CORS
from models import db, Customer, Location, Rental, Vehicle
from datetime import datetime
import os, io, csv

# ──────────────────────────────────────────────────────────────────
# STAGE 3 — SQL INJECTION PROTECTION (overview)
#
# every database query uses the SQLAlchemy ORM; values are bound as parameters,
# not concatenated into SQL. there is no raw SQL, f-string SQL, or db.text().
# ──────────────────────────────────────────────────────────────────

# within here i have each of the database querys that i need, and i have ensured that i am utilzie sqlalchemy
# as that already has prepared functions built in to protect against sql injection

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "client", "dist"))
ASSETS_DIR = os.path.join(STATIC_DIR, "assets")


def my_resolving_database_uri():
    db_path = os.path.abspath(os.path.join(BASE_DIR, "app.db"))
    return "sqlite:///%s" % db_path.replace("\\", "/")


# below i have written out functions to clean out the object data that i am passing and ensuring it is valid for the actual database that i have
def my_checking_dates(value, label):
    if value is None or (isinstance(value, str) and value.strip() == ""):
        raise ValueError("%s is required" % label)
    try:
        return datetime.strptime(str(value).strip(), "%Y-%m-%d").date()
    except Exception as e:
        raise ValueError("%s needs to look like YYYY-MM-DD" % label) from e


# here i am going ahead and checking the id
def checking_my_id(val, label):
    if isinstance(val, bool):
        raise ValueError("%s should be a positive whole number id" % label)
    if isinstance(val, int) and val > 0:
        return val
    if isinstance(val, str) and val.isdigit():
        my_temp = int(val)
        if my_temp > 0:
            return my_temp
    raise ValueError("%s should be a positive whole number id" % label)


def my_checking_report_get_params():
    location_id = request.args.get("location_id", type=int)
    start_raw = request.args.get("start_date", type=str)
    end_raw = request.args.get("end_date", type=str)

    if location_id is None or not start_raw or not end_raw:
        raise ValueError("need location_id, start_date, and end_date")

    if db.session.get(Location, location_id) is None:
        raise ValueError("location_id does not exist")

    start_date = my_checking_dates(start_raw, "start_date")
    end_date = my_checking_dates(end_raw, "end_date")

    if end_date < start_date:
        raise ValueError("end_date cant be before start_date")

    return location_id, start_date, end_date, start_raw, end_raw


def fetching_report_rentals_only(location_id, start_date, end_date):
    return Rental.query.filter(Rental.pickup_location_id == location_id, Rental.pickup_date >= start_date, Rental.pickup_date <= end_date).order_by(Rental.pickup_date).all()


def my_updating_return(rental, data):
    if "return_date" not in data:
        raise ValueError("return_date is required")
    new_return = my_checking_dates(data["return_date"], "return_date")
    if new_return <= rental.pickup_date:
        raise ValueError("return_date must be after pickup_date")
    rental.return_date = new_return
    my_temp = (new_return - rental.pickup_date).days
    rental.total_cost = round(my_temp * rental.vehicle.daily_rate, 2)


def creating_checked_body(data):
    for key in ("customer_id", "vehicle_id", "pickup_location_id", "pickup_date", "return_date"):
        if key not in data or data[key] is None or (isinstance(data[key], str) and data[key].strip() == ""):
            raise ValueError("missing a required field somewhere")

    customer_id = checking_my_id(data["customer_id"], "customer_id")
    vehicle_id = checking_my_id(data["vehicle_id"], "vehicle_id")
    pickup_location_id = checking_my_id(data["pickup_location_id"], "pickup_location_id")
    pickup = my_checking_dates(data["pickup_date"], "pickup_date")
    ret = my_checking_dates(data["return_date"], "return_date")
    status = data.get("status", "Booked")
    return customer_id, vehicle_id, pickup_location_id, pickup, ret, status


# now i will go ahead and create the actual app, with setting the default
def create_app(test_config=None):
    app = Flask(__name__, static_folder=None)

    if test_config:
        app.config.update(test_config)
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = my_resolving_database_uri()

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "wemby-mvp")

    CORS(app)
    db.init_app(app)

    # serving the frontend and the assets of the application accordingly 
    @app.route("/", methods=["GET"])
    def serve_frontend():
        return send_from_directory(STATIC_DIR, "index.html")

    @app.route("/assets/<path:filename>", methods=["GET"])
    def serve_frontend_assets(filename):
        return send_from_directory(ASSETS_DIR, filename)

    # now going ahead nad propely properly getting all of the apis for each of the endpoitns i need based on the columns within the databse accordingly 
    @app.route("/api/locations", methods=["GET"])
    def api_locations():
        rows = Location.query.all()
        my_array = []
        for each_value in rows:
            my_array.append({"location_id": each_value.location_id, "name": each_value.name})
        return jsonify(my_array)

    @app.route("/api/rentals", methods=["GET"])
    def api_rentals_list():
        rentals = Rental.query.order_by(Rental.pickup_date.desc()).all()
        my_array = []
        for each_value in rentals:
            my_array.append(each_value.converting_to_my_dict())
        return jsonify(my_array)

    @app.route("/api/rentals", methods=["POST"])
    def api_rentals_create():
        data = request.get_json(silent=True) or {}
        try:
            (customer_id, vehicle_id, pickup_location_id, pickup, ret, status) = creating_checked_body(data)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        if ret <= pickup:
            return jsonify({"error": "failed for create rental because return date is not after pickup date"}), 400

        if status not in ("Booked", "Active", "Returned"):
            return jsonify({"error": "failed for create rental because status must be Booked Active or Returned"}), 400

        vehicle = db.session.get(Vehicle, vehicle_id)
        if not vehicle:
            return jsonify({"error": "failed for create rental because that vehicle was not found"}), 404

        customer = db.session.get(Customer, customer_id)
        if not customer:
            return jsonify({"error": "failed for create rental because that customer was not found"}), 404

        location = db.session.get(Location, pickup_location_id)
        if not location:
            return jsonify({"error": "failed for create rental because that pickup location was not found"}), 404

        my_temp = (ret - pickup).days
        total_cost = round(my_temp * vehicle.daily_rate, 2)

        rental = Rental(customer_id=customer_id, vehicle_id=vehicle_id, pickup_location_id=pickup_location_id, pickup_date=pickup, return_date=ret, total_cost=total_cost, status=status)

        try:
            db.session.add(rental)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return jsonify({"error": "failed for create rental because the save did not go through try again"}), 500

        return jsonify(rental.converting_to_my_dict()), 201

    @app.route("/api/rentals/<int:rental_id>", methods=["PUT"])
    def api_rentals_update(rental_id):
        rental = db.session.get(Rental, rental_id)
        if not rental:
            return jsonify({"error": "failed for update rental because that rental id does not exist"}), 404

        data = request.get_json(silent=True) or {}
        try:
            my_updating_return(rental, data)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return jsonify({"error": "failed for update rental because the save did not go through try again"}), 500

        return jsonify(rental.converting_to_my_dict())

    @app.route("/api/rentals/<int:rental_id>", methods=["DELETE"])
    def api_rentals_delete(rental_id):
        rental = db.session.get(Rental, rental_id)
        if not rental:
            return jsonify({"error": "failed for delete rental because that rental id does not exist"}), 404

        try:
            db.session.delete(rental)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return jsonify({"error": "failed for delete rental because the delete did not go through try again"}), 500

        return jsonify({"message": "rental %s was deleted ok" % rental_id})

    @app.route("/api/reports/rentals", methods=["GET"])
    def api_report_rentals():
        try:
            location_id, start_date, end_date, start_raw, end_raw = my_checking_report_get_params()
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        rentals = fetching_report_rentals_only(location_id, start_date, end_date)

        total_rental_days = 0
        my_values = []
        for each_value in rentals:
            total_rental_days += (each_value.return_date - each_value.pickup_date).days
            my_values.append(each_value.total_cost)

        if my_values:
            average_revenue = round(sum(my_values) / len(my_values), 2)
        else:
            average_revenue = 0

        range_days = (end_date - start_date).days or 1
        vehicle_count = Vehicle.query.filter_by(location_id=location_id).count()
        denominator = range_days * vehicle_count
        if denominator:
            utilization = round((total_rental_days / denominator * 100), 2)
        else:
            utilization = 0

        my_array = []
        for each_value in rentals:
            my_array.append(each_value.converting_to_my_dict())

        return jsonify({"location_id": location_id, "start_date": start_raw, "end_date": end_raw, "total_rental_days": total_rental_days, "average_revenue": average_revenue, "utilization_rate_percentage": utilization, "rentals": my_array})


    @app.route("/api/reports/rentals/csv", methods=["GET"])
    def api_report_csv():
        try:
            location_id, start_date, end_date, start_raw, end_raw = my_checking_report_get_params()
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        rentals = fetching_report_rentals_only(location_id, start_date, end_date)

        buf = io.StringIO()
        writer = csv.writer(buf)
        my_header = ["Rental ID", "Customer", "Vehicle", "Location", "Pickup Date", "Return Date", "Total Cost", "Status"]
        writer.writerow(my_header)
        for each_value in rentals:
            my_temp = each_value.converting_to_my_dict()
            writer.writerow([my_temp["rental_id"], my_temp["customer_name"], my_temp["vehicle_label"], my_temp["pickup_location_name"], my_temp["pickup_date"], my_temp["return_date"], "%.2f" % my_temp["total_cost"], my_temp["status"]])

        filename = "rental_report_%s_%s.csv" % (start_raw, end_raw)
        headers = {"Content-Disposition": "attachment; filename=%s" % filename}
        return Response(buf.getvalue(), mimetype="text/csv; charset=utf-8", headers=headers)

    @app.route("/api/customers", methods=["GET"])
    def api_customers():
        rows = Customer.query.order_by(Customer.last_name).all()
        my_array = []
        for each_value in rows:
            my_array.append({"customer_id": each_value.customer_id, "name": "%s %s" % (each_value.first_name, each_value.last_name)})
        return jsonify(my_array)

    @app.route("/api/vehicles", methods=["GET"])
    def api_vehicles():
        rows = Vehicle.query.order_by(Vehicle.make).all()
        my_array = []
        for each_value in rows:
            my_array.append({"vehicle_id": each_value.vehicle_id, "label": "%s %s %s ($%.2f/day)" % (each_value.year, each_value.make, each_value.model, each_value.daily_rate), "location_id": each_value.location_id, "daily_rate": each_value.daily_rate})
        return jsonify(my_array)

    return app


app = create_app()


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="127.0.0.1", port=5000, debug=True)
