# 使用腾讯云推荐的 Python 基础镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 设置时区为上海
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone

# 复制依赖文件
COPY requirements.txt .

# 安装依赖 (使用国内镜像源加速)
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.cloud.tencent.com/pypi/simple

# 复制所有源代码
COPY . .

# 暴露端口 (云托管默认 80 或 8080)
EXPOSE 8080

# 启动命令
# 使用 gunicorn 生产级服务器，而不是 flask run
CMD ["python", "app.py"]

