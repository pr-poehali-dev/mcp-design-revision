CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    contact_info TEXT,
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    price DECIMAL(18,2) NOT NULL CHECK (price > 0),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id),
    sku VARCHAR(100),
    min_stock_level INTEGER NOT NULL DEFAULT 10,
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_products_category_manufacturer ON products(category_id, manufacturer_id);

CREATE TABLE IF NOT EXISTS outlets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    outlet_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outlets_name ON outlets(name);
CREATE INDEX IF NOT EXISTS idx_outlets_type ON outlets(outlet_type);
CREATE INDEX IF NOT EXISTS idx_outlets_active ON outlets(is_active);

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    outlet_id INTEGER NOT NULL REFERENCES outlets(id),
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_locations_outlet ON locations(outlet_id);

CREATE TABLE IF NOT EXISTS product_locations (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    location_id INTEGER NOT NULL REFERENCES locations(id),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_product_locations_product ON product_locations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_locations_location ON product_locations(location_id);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    order_type VARCHAR(50) NOT NULL,
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders(order_date, status);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id),
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(18,2) NOT NULL,
    total_price DECIMAL(18,2) NOT NULL,
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);

CREATE TABLE IF NOT EXISTS write_offs (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    location_id INTEGER NOT NULL REFERENCES locations(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason INTEGER NOT NULL,
    comment TEXT,
    username VARCHAR(100) NOT NULL,
    created_on_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_write_offs_product ON write_offs(product_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_location ON write_offs(location_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_username ON write_offs(username);
CREATE INDEX IF NOT EXISTS idx_write_offs_created ON write_offs(created_on_utc);
CREATE INDEX IF NOT EXISTS idx_write_offs_date_user ON write_offs(created_on_utc, username);

INSERT INTO categories (name, description) VALUES
('Электроника', 'Электронные устройства и гаджеты'),
('Одежда', 'Одежда и текстиль'),
('Продукты', 'Продукты питания'),
('Мебель', 'Мебель для дома и офиса'),
('Прочее', 'Разные товары');

INSERT INTO manufacturers (name, description, contact_info) VALUES
('HP Inc.', 'Производитель компьютеров и принтеров', 'support@hp.com'),
('Nike', 'Спортивная одежда и обувь', 'info@nike.com'),
('Lavazza', 'Производитель кофе', 'contact@lavazza.com'),
('IKEA', 'Мебель и товары для дома', 'service@ikea.com'),
('Logitech', 'Компьютерная периферия', 'support@logitech.com'),
('Levis', 'Джинсовая одежда', 'info@levis.com');

INSERT INTO outlets (name, address, phone, outlet_type, is_active) VALUES
('Главный склад', 'ул. Складская, 1', '+7 (495) 123-45-67', 'warehouse', true),
('Магазин №1', 'ул. Ленина, 10', '+7 (495) 123-45-68', 'retail', true),
('Магазин №2', 'ул. Пушкина, 25', '+7 (495) 123-45-69', 'retail', true),
('Магазин №3', 'пр. Мира, 50', '+7 (495) 123-45-70', 'retail', true);

INSERT INTO locations (name, description, outlet_id) VALUES
('Зона А1', 'Электроника', 1),
('Зона А2', 'Одежда', 1),
('Зона А3', 'Продукты', 1),
('Торговый зал', 'Основной зал', 2),
('Торговый зал', 'Основной зал', 3),
('Торговый зал', 'Основной зал', 4);

INSERT INTO products (id, name, description, price, category_id, manufacturer_id, sku, min_stock_level) VALUES
('PRD-0001', 'Ноутбук HP 15', 'Ноутбук с диагональю 15.6 дюймов', 45000.00, 1, 1, 'HP-LAP-001', 10),
('PRD-0002', 'Футболка Nike', 'Спортивная футболка из хлопка', 2500.00, 2, 2, 'NIKE-TSH-001', 50),
('PRD-0003', 'Кофе Lavazza', 'Молотый кофе 250г', 850.00, 3, 3, 'LAV-COF-001', 20),
('PRD-0004', 'Стул офисный', 'Эргономичный офисный стул', 7800.00, 4, 4, 'IKEA-CHR-001', 5),
('PRD-0005', 'Мышь Logitech', 'Беспроводная мышь', 1200.00, 1, 5, 'LOG-MOU-001', 15),
('PRD-0006', 'Джинсы Levis', 'Классические джинсы', 5500.00, 2, 6, 'LEV-JEA-001', 30);

INSERT INTO product_locations (product_id, location_id, quantity) VALUES
('PRD-0001', 1, 45),
('PRD-0002', 2, 120),
('PRD-0003', 3, 8),
('PRD-0004', 1, 15),
('PRD-0005', 1, 0),
('PRD-0006', 2, 65);

INSERT INTO customers (name, contact_person, phone, email, address) VALUES
('ООО "Ритейл Плюс"', 'Иванов Иван', '+7 (495) 111-22-33', 'ivanov@retail.ru', 'г. Москва, ул. Тверская, 1'),
('ИП Петров', 'Петров Петр', '+7 (495) 222-33-44', 'petrov@mail.ru', 'г. Москва, ул. Арбат, 10');

INSERT INTO orders (id, order_number, customer_id, order_date, status, total_amount, order_type) VALUES
('ORD-2024-0001', '#ORD-2401', 1, '2024-10-15 10:30:00', 'completed', 120000.00, 'incoming'),
('ORD-2024-0002', '#ORD-2402', 2, '2024-10-15 14:15:00', 'processing', 45000.00, 'outgoing'),
('ORD-2024-0003', '#ORD-2403', 1, '2024-10-14 09:20:00', 'completed', 250000.00, 'incoming'),
('ORD-2024-0004', '#ORD-2404', 2, '2024-10-14 16:45:00', 'completed', 35000.00, 'outgoing');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
('ORD-2024-0001', 'PRD-0001', 2, 45000.00, 90000.00),
('ORD-2024-0001', 'PRD-0002', 12, 2500.00, 30000.00),
('ORD-2024-0002', 'PRD-0001', 1, 45000.00, 45000.00),
('ORD-2024-0003', 'PRD-0004', 10, 7800.00, 78000.00),
('ORD-2024-0003', 'PRD-0006', 20, 5500.00, 110000.00),
('ORD-2024-0004', 'PRD-0003', 40, 850.00, 34000.00);
