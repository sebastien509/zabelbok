FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc

COPY . .

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc libpq-dev ffmpeg && \
    apt-get clean

RUN pip install --upgrade pip
RUN pip install -r requirements.txt


EXPOSE 8000  

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "wsgi:app"]
