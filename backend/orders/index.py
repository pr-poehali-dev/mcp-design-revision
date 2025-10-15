import json
from typing import Dict, Any
from datetime import datetime

MOCK_ORDERS = [
    {
        'id': 1,
        'username': 'Иван Петров',
        'paymentType': 'Card',
        'comment': 'Срочный заказ',
        'loyaltyCardNumber': '1234567890',
        'totalAmount': 214980.00,
        'status': 'Completed',
        'createdOnUtc': '2024-10-10T14:30:00',
        'completedOnUtc': '2024-10-10T15:00:00',
        'products': [
            {
                'productId': 1,
                'productName': 'Samsung Galaxy S24',
                'quantity': 1,
                'unitPrice': 89990.00,
                'purchasePrice': 75000.00,
                'totalPrice': 89990.00,
                'totalPurchasePrice': 75000.00,
                'profit': 14990.00
            },
            {
                'productId': 2,
                'productName': 'iPhone 15 Pro',
                'quantity': 1,
                'unitPrice': 124990.00,
                'purchasePrice': 105000.00,
                'totalPrice': 124990.00,
                'totalPurchasePrice': 105000.00,
                'profit': 19990.00
            }
        ]
    },
    {
        'id': 2,
        'username': 'Мария Сидорова',
        'paymentType': 'Cash',
        'comment': '',
        'loyaltyCardNumber': None,
        'totalAmount': 28980.00,
        'status': 'Active',
        'createdOnUtc': '2024-10-12T10:15:00',
        'completedOnUtc': None,
        'products': [
            {
                'productId': 3,
                'productName': 'Nike Air Max 270',
                'quantity': 1,
                'unitPrice': 12990.00,
                'purchasePrice': 9000.00,
                'totalPrice': 12990.00,
                'totalPurchasePrice': 9000.00,
                'profit': 3990.00
            },
            {
                'productId': 4,
                'productName': 'Adidas Ultraboost 22',
                'quantity': 1,
                'unitPrice': 15990.00,
                'purchasePrice': 12000.00,
                'totalPrice': 15990.00,
                'totalPurchasePrice': 12000.00,
                'profit': 3990.00
            }
        ]
    },
    {
        'id': 3,
        'username': 'Алексей Иванов',
        'paymentType': 'Transfer',
        'comment': 'Оптовая закупка',
        'loyaltyCardNumber': '9876543210',
        'totalAmount': 4495.00,
        'status': 'Completed',
        'createdOnUtc': '2024-10-13T16:20:00',
        'completedOnUtc': '2024-10-13T17:00:00',
        'products': [
            {
                'productId': 5,
                'productName': 'Молоко 3.2%',
                'quantity': 50,
                'unitPrice': 89.90,
                'purchasePrice': 65.00,
                'totalPrice': 4495.00,
                'totalPurchasePrice': 3250.00,
                'profit': 1245.00
            }
        ]
    }
]

next_order_id = 4

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage warehouse orders - create, list, complete, cancel
    Args: event with httpMethod GET/POST, order data
    Returns: Order list or order creation confirmation
    '''
    global next_order_id
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
        page = int(params.get('page', 1))
        page_size = int(params.get('pageSize', 20))
        
        total = len(MOCK_ORDERS)
        start = (page - 1) * page_size
        end = start + page_size
        orders = MOCK_ORDERS[start:end]
        
        result = {
            'orders': orders,
            'total': total,
            'page': page,
            'pageSize': page_size,
            'totalPages': (total + page_size - 1) // page_size
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'complete':
            order_id = body['orderId']
            for order in MOCK_ORDERS:
                if order['id'] == order_id:
                    order['status'] = 'Completed'
                    order['completedOnUtc'] = datetime.utcnow().isoformat()
                    break
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'cancel':
            order_id = body['orderId']
            for order in MOCK_ORDERS:
                if order['id'] == order_id:
                    order['status'] = 'Cancelled'
                    break
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            total_amount = sum(p['unitPrice'] * p['quantity'] for p in body['products'])
            
            new_order = {
                'id': next_order_id,
                'username': body['username'],
                'paymentType': body.get('paymentType', 'Card'),
                'comment': body.get('comment', ''),
                'loyaltyCardNumber': body.get('loyaltyCardNumber'),
                'totalAmount': total_amount,
                'status': 'Active',
                'createdOnUtc': datetime.utcnow().isoformat(),
                'completedOnUtc': None,
                'products': []
            }
            
            for product in body['products']:
                total_price = product['unitPrice'] * product['quantity']
                total_purchase = product['purchasePrice'] * product['quantity']
                profit = total_price - total_purchase
                
                new_order['products'].append({
                    'productId': product['productId'],
                    'productName': product.get('productName', 'Товар'),
                    'quantity': product['quantity'],
                    'unitPrice': product['unitPrice'],
                    'purchasePrice': product['purchasePrice'],
                    'totalPrice': total_price,
                    'totalPurchasePrice': total_purchase,
                    'profit': profit
                })
            
            MOCK_ORDERS.insert(0, new_order)
            next_order_id += 1
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': new_order['id']}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
