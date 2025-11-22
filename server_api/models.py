from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    openid = db.Column(db.String(64), primary_key=True)
    nickname = db.Column(db.String(64))
    avatar_url = db.Column(db.String(255))
    points = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    joined_at = db.Column(db.DateTime, default=datetime.now)
    
    def to_dict(self):
        return {
            'openid': self.openid,
            'nickname': self.nickname,
            'points': self.points,
            'level': self.level,
            'joined_at': self.joined_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    reward = db.Column(db.Integer)
    type = db.Column(db.String(20)) # daily, weekly
    target_lat = db.Column(db.Float, nullable=True)
    target_lng = db.Column(db.Float, nullable=True)
    radius = db.Column(db.Integer, default=50)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'reward': self.reward,
            'type': self.type,
            'lat': self.target_lat,
            'lng': self.target_lng
        }

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    price = db.Column(db.Integer)
    image = db.Column(db.String(255))
    stock = db.Column(db.Integer, default=999)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'image': self.image
        }

class Route(db.Model):
    __tablename__ = 'routes'
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True) # food, shopping
    name = db.Column(db.String(50))
    points_json = db.Column(db.Text) # 存储 JSON 字符串 [{"lat":.., "lng":..}]

    def to_dict(self):
        import json
        try:
            points = json.loads(self.points_json)
        except:
            points = []
        return {
            'key': self.key,
            'name': self.name,
            'points': points
        }

class Record(db.Model):
    __tablename__ = 'records'
    id = db.Column(db.Integer, primary_key=True)
    openid = db.Column(db.String(64), db.ForeignKey('users.openid'))
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'))
    created_at = db.Column(db.DateTime, default=datetime.now)

