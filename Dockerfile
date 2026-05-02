# build react / vite static assets
FROM node:22-alpine AS frontend

WORKDIR /frontend

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build


# run flask api + vite build from one cloud run container
FROM python:3.12-slim-bookworm AS runtime

WORKDIR /app/server

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY server/ ./

# keep the same layout your app expects:
# /app/server contains flask code
# /app/client/dist contains vite production assets
COPY --from=frontend /frontend/dist /app/client/dist

EXPOSE 8080

CMD python -c "from app import create_app; from models import db; app = create_app(); ctx = app.app_context(); ctx.push(); db.create_all(); ctx.pop()" \
    && exec gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 1 --threads 4 "app:create_app()"