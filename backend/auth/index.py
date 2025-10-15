import json
import os
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any

SECRET_KEY = os.environ.get('JWT_SECRET', 'warehouse-secret-key-2024')
ALGORITHM = 'HS256'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: JWT authentication for warehouse system
    Args: event with httpMethod POST, body with username/password
    Returns: JWT access token
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    username = body_data.get('username', '')
    password = body_data.get('password', '')
    
    if username == 'admin' and password == 'admin123':
        payload = {
            'sub': username,
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'access_token': token}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 401,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid credentials'}),
        'isBase64Encoded': False
    }
