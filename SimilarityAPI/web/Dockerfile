FROM python:3
WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN pip install ./en_core_web_sm-2.2.5.tar.gz

RUN pip install ddtrace

CMD [ "ddtrace-run", "python", "app.py" ]
