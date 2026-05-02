# Drive Fleet

I have developed a car rental full-stack application with full database support.

The tech stack I have utilized is Flask, SQLAlchemy, and SQLite for the backend API and database, and React with Vite and Tailwind for the frontend.

My application supports rentals CRUD, rental reports filtered by location and date range, CSV export of those reports, and seed data for demo locations, customers, vehicles, and rentals.

To run it please follow the commands locally on your terminal which involve opening two terminals, and then in the first, from the project root:

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

In the second:

```bash
cd client
npm install
npm run dev
```

Then open **http://127.0.0.1:5173** in your browser. Optional demo data (from `server` with the venv active): `python seed.py`.
