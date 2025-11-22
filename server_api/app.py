import os
import json
import datetime
import requests
from flask import Flask, request, jsonify, redirect, url_for
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_admin.form import rules
from flask_admin.model import typefmt
from markupsafe import Markup
from wtforms import TextAreaField
from models import db, User, Task, Product, Record, Route

app = Flask(__name__)

# --- 配置区域 ---
DB_URI = os.getenv('DATABASE_URL', 'sqlite:///wechat_app.db')
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key'

# 静态文件配置 (用于显示上传的图片)
app.config['STATIC_FOLDER'] = 'static'

WX_APP_ID = os.getenv('WX_APP_ID', '')
WX_APP_SECRET = os.getenv('WX_APP_SECRET', '')

db.init_app(app)

# --- 高级 Admin 视图定制 ---

# 1. 自定义首页仪表盘
class DashboardView(AdminIndexView):
    @expose('/')
    def index(self):
        # 统计数据
        stats = {
            'user_count': User.query.count(),
            'today_checkin': Record.query.filter(db.func.date(Record.created_at) == datetime.date.today()).count(),
            'total_points_consumed': 0, # 暂时没存消费记录表，先置0
            'low_stock_count': Product.query.filter(Product.stock < 10).count(),
            'recent_users': User.query.order_by(User.joined_at.desc()).limit(5).all()
        }
        return self.render('admin/index.html', stats=stats)

# 2. 用户管理视图 (带头像显示、搜索)
class UserView(ModelView):
    can_create = False # 不允许后台直接创建用户
    can_delete = False # 防止误删
    column_list = ('nickname', 'avatar_url', 'points', 'level', 'joined_at')
    column_searchable_list = ['nickname', 'openid']
    column_filters = ['level', 'points']
    column_default_sort = ('joined_at', True)
    
    def _format_avatar(view, context, model, name):
        if model.avatar_url:
            return Markup(f'<img src="{model.avatar_url}" width="30" style="border-radius:50%">')
        return ''
    
    column_formatters = {
        'avatar_url': _format_avatar
    }

# 3. 商品管理视图 (带图片预览、库存预警)
class ProductView(ModelView):
    column_list = ('name', 'image', 'price', 'stock')
    column_editable_list = ['price', 'stock'] # 列表页直接编辑价格库存
    
    def _format_image(view, context, model, name):
        if model.image:
            return Markup(f'<img src="{model.image}" width="50">')
        return '无图'
        
    column_formatters = {
        'image': _format_image
    }
    
    # 样式优化：库存少于10显示红色
    def _stock_formatter(view, context, model, name):
        if model.stock < 10:
            return Markup(f'<span style="color:red;font-weight:bold">{model.stock} (缺货)</span>')
        return model.stock
        
    column_formatters['stock'] = _stock_formatter

# 4. 路线管理视图 (JSON 美化)
class RouteView(ModelView):
    column_list = ('name', 'key', 'points_preview')
    
    def _format_points(view, context, model, name):
        try:
            data = json.loads(model.points_json)
            count = len(data)
            return f'{count} 个坐标点'
        except:
            return '格式错误'
            
    column_formatters = { 'points_preview': _format_points }
    
    # 编辑表单自定义
    form_extra_fields = {
        'points_json': TextAreaField('坐标点 JSON', render_kw={"rows": 10, "class": "form-control", "style": "font-family:monospace"})
    }

# 初始化 Admin，使用 Bootstrap3 风格
admin = Admin(app, name='WeChat App Console', index_view=DashboardView(), template_mode='bootstrap3')

admin.add_view(UserView(User, db.session, name='用户管理', category='运营'))
admin.add_view(ModelView(Record, db.session, name='打卡流水', category='运营'))
admin.add_view(ProductView(Product, db.session, name='商品库', category='资源'))
admin.add_view(ModelView(Task, db.session, name='任务库', category='资源'))
admin.add_view(RouteView(Route, db.session, name='路线配置', category='系统'))

# --- 数据库初始化 (同前) ---
def init_data():
    if not Task.query.first():
        db.session.add(Task(id=1, title='每日登录', reward=10, type='daily'))
        db.session.add(Task(id=2, title='地图定点打卡', reward=50, type='daily'))
    if not Product.query.first():
        # 使用外部链接示例图片
        db.session.add(Product(id=1, name='咖啡券', price=100, image='https://img.icons8.com/color/96/coffee-to-go.png'))
        db.session.add(Product(id=2, name='明信片', price=50, image='https://img.icons8.com/color/96/post-card.png'))
    if not Route.query.first():
        food_points = json.dumps([{"lat": 30.572, "lng": 104.066, "name": "春熙路火锅"}], ensure_ascii=False)
        db.session.add(Route(key='food', name='美食路线', points_json=food_points))
        db.session.add(Route(key='shopping', name='购物路线', points_json='[]'))
        db.session.add(Route(key='nature', name='踏青路线', points_json='[]'))
    db.session.commit()

with app.app_context():
    db.create_all()
    init_data()

# --- API 接口 (保持不变，稍微精简) ---
@app.route('/')
def index():
    return redirect('/admin')

# 1. 真实登录
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    code = data.get('code')
    user_info = data.get('userInfo', {})
    
    openid = None
    if code == 'test_code' or not WX_APP_ID:
        openid = 'test_openid_real_123'
    else:
        url = f"https://api.weixin.qq.com/sns/jscode2session?appid={WX_APP_ID}&secret={WX_APP_SECRET}&js_code={code}&grant_type=authorization_code"
        res = requests.get(url).json()
        if 'openid' in res:
            openid = res['openid']
        else:
            return jsonify({'code': 400, 'msg': '微信登录失败', 'wx_res': res})
            
    user = User.query.get(openid)
    if not user:
        # 保存头像
        avatar = user_info.get('avatarUrl', '')
        user = User(openid=openid, nickname=user_info.get('nickName', '微信用户'), avatar_url=avatar)
        db.session.add(user)
    else:
        if user_info.get('nickName'): user.nickname = user_info.get('nickName')
        if user_info.get('avatarUrl'): user.avatar_url = user_info.get('avatarUrl')
    
    db.session.commit()
    return jsonify({'code': 0, 'data': {'openid': openid}})

# 2. 用户信息
@app.route('/api/user/info', methods=['GET'])
def get_user_info():
    openid = request.args.get('openid')
    user = User.query.get(openid)
    return jsonify({'code': 0, 'data': user.to_dict()}) if user else jsonify({'code': 404})

# 3. 任务列表
@app.route('/api/tasks', methods=['GET'])
def get_tasks_api():
    openid = request.args.get('openid')
    tasks = Task.query.all()
    today = datetime.date.today()
    res = []
    for t in tasks:
        td = t.to_dict()
        record = Record.query.filter(Record.openid==openid, Record.task_id==t.id, db.func.date(Record.created_at)==today).first()
        td['is_completed'] = bool(record)
        res.append(td)
    return jsonify({'code': 0, 'data': res})

# 4. 打卡
@app.route('/api/task/complete', methods=['POST'])
def complete_task_api():
    data = request.json
    openid = data.get('openid')
    task_id = data.get('taskId')
    task = Task.query.get(task_id)
    if not task: return jsonify({'code': 404})
    
    today = datetime.date.today()
    if Record.query.filter(Record.openid==openid, Record.task_id==task_id, db.func.date(Record.created_at)==today).first():
        return jsonify({'code': 1, 'msg': '今日已完成'})
        
    user = User.query.get(openid)
    user.points += task.reward
    db.session.add(Record(openid=openid, task_id=task_id))
    db.session.commit()
    return jsonify({'code': 0, 'msg': '打卡成功', 'data': {'current_points': user.points}})

# 5. 商品
@app.route('/api/products', methods=['GET'])
def get_products_api():
    return jsonify({'code': 0, 'data': [p.to_dict() for p in Product.query.all()]})

# 6. 兑换
@app.route('/api/shop/exchange', methods=['POST'])
def exchange_api():
    data = request.json
    openid = data.get('openid')
    product_id = data.get('productId')
    user = User.query.get(openid)
    product = Product.query.get(product_id)
    
    if not user or not product: return jsonify({'code': 404})
    if product.stock <= 0: return jsonify({'code': 1, 'msg': '库存不足'})
    if user.points < product.price: return jsonify({'code': 1, 'msg': '积分不足'})
    
    user.points -= product.price
    product.stock -= 1
    db.session.commit()
    return jsonify({'code': 0, 'msg': '兑换成功', 'data': {'current_points': user.points}})

# 7. 路线
@app.route('/api/routes', methods=['GET'])
def get_routes_api():
    routes = Route.query.all()
    data = {}
    for r in routes: data[r.key] = r.to_dict()
    return jsonify({'code': 0, 'data': data})
    
# 8. 社区 (Mock)
@app.route('/api/community/posts', methods=['GET'])
def get_posts_api(): return jsonify({'code': 0, 'data': []})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
