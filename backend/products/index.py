import json
from typing import Dict, Any
from datetime import datetime

MOCK_PRODUCTS = [
    {
        'id': 1,
        'vendorCode': 'SM-001',
        'name': 'Samsung Galaxy S24',
        'description': 'Флагманский смартфон',
        'imageUrl': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300',
        'priceTypeValue': 89990.00,
        'currencyCode': 'RUB',
        'minStock': 5,
        'isArchive': False,
        'createdOnUtc': '2024-01-15T10:00:00',
        'modifiedOnUtc': '2024-10-01T15:30:00',
        'categoryName': 'Электроника',
        'manufacturerName': 'Samsung',
        'totalQuantity': 15,
        'isLowStock': False,
        'barcodes': ['8801643716486'],
        'locations': [
            {'locationId': 1, 'quantity': 10, 'locationName': 'Основной склад', 'lastUpdatedUtc': '2024-10-10T12:00:00'},
            {'locationId': 2, 'quantity': 5, 'locationName': 'Склад А', 'lastUpdatedUtc': '2024-10-10T12:00:00'}
        ]
    },
    {
        'id': 2,
        'vendorCode': 'AP-002',
        'name': 'iPhone 15 Pro',
        'description': 'Премиум смартфон Apple',
        'imageUrl': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300',
        'priceTypeValue': 124990.00,
        'currencyCode': 'RUB',
        'minStock': 3,
        'isArchive': False,
        'createdOnUtc': '2024-02-10T10:00:00',
        'modifiedOnUtc': '2024-10-05T14:20:00',
        'categoryName': 'Электроника',
        'manufacturerName': 'Apple',
        'totalQuantity': 8,
        'isLowStock': False,
        'barcodes': ['194253409090'],
        'locations': [
            {'locationId': 1, 'quantity': 8, 'locationName': 'Основной склад', 'lastUpdatedUtc': '2024-10-12T09:00:00'}
        ]
    },
    {
        'id': 3,
        'vendorCode': 'NK-003',
        'name': 'Nike Air Max 270',
        'description': 'Спортивные кроссовки',
        'imageUrl': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
        'priceTypeValue': 12990.00,
        'currencyCode': 'RUB',
        'minStock': 10,
        'isArchive': False,
        'createdOnUtc': '2024-03-20T10:00:00',
        'modifiedOnUtc': '2024-10-08T11:15:00',
        'categoryName': 'Одежда',
        'manufacturerName': 'Nike',
        'totalQuantity': 7,
        'isLowStock': True,
        'barcodes': ['193151796721'],
        'locations': [
            {'locationId': 2, 'quantity': 7, 'locationName': 'Склад А', 'lastUpdatedUtc': '2024-10-13T16:30:00'}
        ]
    },
    {
        'id': 4,
        'vendorCode': 'AD-004',
        'name': 'Adidas Ultraboost 22',
        'description': 'Беговые кроссовки',
        'imageUrl': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300',
        'priceTypeValue': 15990.00,
        'currencyCode': 'RUB',
        'minStock': 8,
        'isArchive': False,
        'createdOnUtc': '2024-04-05T10:00:00',
        'modifiedOnUtc': '2024-10-10T13:45:00',
        'categoryName': 'Одежда',
        'manufacturerName': 'Adidas',
        'totalQuantity': 12,
        'isLowStock': False,
        'barcodes': ['4066748674022'],
        'locations': [
            {'locationId': 1, 'quantity': 6, 'locationName': 'Основной склад', 'lastUpdatedUtc': '2024-10-11T10:20:00'},
            {'locationId': 3, 'quantity': 6, 'locationName': 'Склад Б', 'lastUpdatedUtc': '2024-10-11T10:20:00'}
        ]
    },
    {
        'id': 5,
        'vendorCode': 'PF-005',
        'name': 'Молоко 3.2%',
        'description': 'Свежее молоко пастеризованное',
        'imageUrl': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300',
        'priceTypeValue': 89.90,
        'currencyCode': 'RUB',
        'minStock': 50,
        'isArchive': False,
        'createdOnUtc': '2024-05-12T10:00:00',
        'modifiedOnUtc': '2024-10-14T08:00:00',
        'categoryName': 'Продукты питания',
        'manufacturerName': 'Общий производитель',
        'totalQuantity': 120,
        'isLowStock': False,
        'barcodes': ['4607034370015'],
        'locations': [
            {'locationId': 1, 'quantity': 120, 'locationName': 'Основной склад', 'lastUpdatedUtc': '2024-10-15T07:00:00'}
        ]
    },
    {
        'id': 6,
        'vendorCode': 'ST-006',
        'name': 'Тетрадь 48 листов',
        'description': 'Тетрадь в клетку',
        'imageUrl': 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300',
        'priceTypeValue': 49.90,
        'currencyCode': 'RUB',
        'minStock': 30,
        'isArchive': False,
        'createdOnUtc': '2024-06-18T10:00:00',
        'modifiedOnUtc': '2024-10-12T16:00:00',
        'categoryName': 'Канцелярия',
        'manufacturerName': 'Общий производитель',
        'totalQuantity': 25,
        'isLowStock': True,
        'barcodes': ['4680018987654'],
        'locations': [
            {'locationId': 2, 'quantity': 25, 'locationName': 'Склад А', 'lastUpdatedUtc': '2024-10-13T12:00:00'}
        ]
    }
]

next_product_id = 7

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: CRUD operations for warehouse products
    Args: event with httpMethod GET/POST/PUT/PATCH, product data
    Returns: Product list or single product data
    '''
    global next_product_id
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        search = params.get('search', '').lower()
        page = int(params.get('page', 1))
        page_size = int(params.get('pageSize', 20))
        
        filtered = [p for p in MOCK_PRODUCTS if not p['isArchive']]
        
        if search:
            filtered = [p for p in filtered if search in p['name'].lower() or search in p['vendorCode'].lower()]
        
        total = len(filtered)
        start = (page - 1) * page_size
        end = start + page_size
        products = filtered[start:end]
        
        result = {
            'products': products,
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
        
        new_product = {
            'id': next_product_id,
            'vendorCode': body['vendorCode'],
            'name': body['name'],
            'description': body.get('description', ''),
            'imageUrl': body.get('imageUrl'),
            'priceTypeValue': body['priceTypeValue'],
            'currencyCode': body.get('currencyCode', 'RUB'),
            'minStock': body.get('minStock', 10),
            'isArchive': False,
            'createdOnUtc': datetime.utcnow().isoformat(),
            'modifiedOnUtc': datetime.utcnow().isoformat(),
            'categoryName': body.get('categoryName', 'Прочее'),
            'manufacturerName': body.get('manufacturerName', 'Общий производитель'),
            'totalQuantity': 0,
            'isLowStock': True,
            'barcodes': body.get('barcodes', []),
            'locations': []
        }
        
        MOCK_PRODUCTS.append(new_product)
        next_product_id += 1
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': new_product['id']}),
            'isBase64Encoded': False
        }
    
    elif method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        product_id = body['id']
        
        for i, p in enumerate(MOCK_PRODUCTS):
            if p['id'] == product_id:
                MOCK_PRODUCTS[i].update({
                    'vendorCode': body['vendorCode'],
                    'name': body['name'],
                    'description': body.get('description', ''),
                    'imageUrl': body.get('imageUrl'),
                    'priceTypeValue': body['priceTypeValue'],
                    'currencyCode': body.get('currencyCode', 'RUB'),
                    'minStock': body.get('minStock', 10),
                    'modifiedOnUtc': datetime.utcnow().isoformat()
                })
                break
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    elif method == 'PATCH':
        body = json.loads(event.get('body', '{}'))
        product_id = body['id']
        
        for p in MOCK_PRODUCTS:
            if p['id'] == product_id:
                p['isArchive'] = True
                break
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }