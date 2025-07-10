FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc

COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

ENV PORT=8000
EXPOSE $PORT

CMD ["sh", "-c", "exec gunicorn -w 4 -b 0.0.0.0:$PORT 'app:create_app()'"]
