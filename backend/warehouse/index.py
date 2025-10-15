'''
Business: API для работы с данными системы управления складом
Args: event - dict с httpMethod, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response с данными продуктов, заказов и статистики
'''

import json
import os
from typing import Dict, Any
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'dashboard')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            if action == 'dashboard':
                cur.execute('''
                    SELECT 
                        (SELECT COUNT(*) FROM products) as total_products,
                        (SELECT COUNT(*) FROM orders WHERE status != 'completed') as active_orders,
                        (SELECT COUNT(*) FROM outlets WHERE is_active = true) as active_outlets,
                        (SELECT COUNT(*) FROM write_offs WHERE created_on_utc >= NOW() - INTERVAL '7 days') as recent_write_offs
                ''')
                stats = cur.fetchone()
                
                cur.execute('''
                    SELECT 
                        TO_CHAR(order_date, 'Mon') as month,
                        SUM(total_amount) as sales,
                        COUNT(*) as orders
                    FROM orders
                    WHERE order_date >= NOW() - INTERVAL '6 months'
                    GROUP BY DATE_TRUNC('month', order_date), TO_CHAR(order_date, 'Mon')
                    ORDER BY DATE_TRUNC('month', order_date)
                ''')
                sales_data = cur.fetchall()
                
                cur.execute('''
                    SELECT 
                        c.name,
                        COUNT(p.id) as value
                    FROM categories c
                    LEFT JOIN products p ON c.id = p.category_id
                    GROUP BY c.name
                    ORDER BY value DESC
                ''')
                category_data = cur.fetchall()
                
                result = {
                    'stats': dict(stats),
                    'salesData': [dict(row) for row in sales_data],
                    'categoryData': [dict(row) for row in category_data]
                }
                
            elif action == 'products':
                search = params.get('search', '')
                query = '''
                    SELECT 
                        p.id,
                        p.name,
                        c.name as category,
                        COALESCE(SUM(pl.quantity), 0) as stock,
                        p.price,
                        CASE 
                            WHEN COALESCE(SUM(pl.quantity), 0) = 0 THEN 'Нет'
                            WHEN COALESCE(SUM(pl.quantity), 0) <= p.min_stock_level THEN 'Мало'
                            ELSE 'В наличии'
                        END as status
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN product_locations pl ON p.id = pl.product_id
                    WHERE p.name ILIKE %s
                    GROUP BY p.id, p.name, c.name, p.price, p.min_stock_level
                    ORDER BY p.name
                '''
                cur.execute(query, (f'%{search}%',))
                products = cur.fetchall()
                result = {'products': [dict(row) for row in products]}
                
            elif action == 'orders':
                cur.execute('''
                    SELECT 
                        o.id,
                        o.order_number as id_display,
                        COALESCE(c.name, 'Склад') as outlet,
                        o.order_type as type,
                        COUNT(oi.id) as items,
                        TO_CHAR(o.order_date, 'DD.MM.YYYY') as date,
                        CASE 
                            WHEN o.status = 'completed' THEN 'Выполнен'
                            WHEN o.status = 'processing' THEN 'В обработке'
                            ELSE 'Ожидает'
                        END as status
                    FROM orders o
                    LEFT JOIN customers c ON o.customer_id = c.id
                    LEFT JOIN order_items oi ON o.id = oi.order_id
                    GROUP BY o.id, o.order_number, c.name, o.order_type, o.order_date, o.status
                    ORDER BY o.order_date DESC
                    LIMIT 10
                ''')
                orders = cur.fetchall()
                result = {'orders': [dict(row) for row in orders]}
            
            else:
                result = {'error': 'Unknown action'}
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, ensure_ascii=False, cls=DecimalEncoder),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            if cur:
                cur.close()
            if conn:
                conn.close()
            
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}, ensure_ascii=False),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }