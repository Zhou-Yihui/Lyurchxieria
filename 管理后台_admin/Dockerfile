# 管理后台 Flask 容器 / Admin Flask Container
FROM python:3.11-slim
WORKDIR /opt/admin
COPY requirements.txt ./requirements.txt
RUN pip install -r requirements.txt
COPY . /opt/admin
EXPOSE 8000
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]
