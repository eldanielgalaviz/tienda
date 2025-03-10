-- Crear la base de datos
CREATE DATABASE fashion_treats;

-- Conectar a la base de datos
\c fashion_treats;

-- Esquema para tablas de usuarios y autenticación
CREATE SCHEMA auth;

-- Esquema para tablas relacionadas con productos
CREATE SCHEMA products;

-- Esquema para tablas relacionadas con pedidos
CREATE SCHEMA orders;

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabla de direcciones
CREATE TABLE auth.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'México',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE products.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES products.categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de marcas
CREATE TABLE products.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE products.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    brand_id UUID REFERENCES products.brands(id),
    main_category_id UUID NOT NULL REFERENCES products.categories(id),
    stock_quantity INTEGER DEFAULT 0,
    weight DECIMAL(10, 2),
    weight_unit VARCHAR(10) DEFAULT 'kg',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de relaciones producto-categoría (muchos a muchos)
CREATE TABLE products.product_categories (
    product_id UUID REFERENCES products.products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES products.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Tabla de imágenes de productos
CREATE TABLE products.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products.products(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de atributos (para especificar características como color, tamaño, material)
CREATE TABLE products.attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'select', 'color', 'text', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de valores de atributos
CREATE TABLE products.attribute_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attribute_id UUID NOT NULL REFERENCES products.attributes(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL,
    display_value VARCHAR(100) NOT NULL,
    color_hex VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de variantes de productos
CREATE TABLE products.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products.products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    price DECIMAL(10, 2),
    compare_at_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    weight DECIMAL(10, 2),
    weight_unit VARCHAR(10) DEFAULT 'kg',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relaciones variante-valor de atributo
CREATE TABLE products.variant_attribute_values (
    variant_id UUID NOT NULL REFERENCES products.product_variants(id) ON DELETE CASCADE,
    attribute_value_id UUID NOT NULL REFERENCES products.attribute_values(id) ON DELETE CASCADE,
    PRIMARY KEY (variant_id, attribute_value_id)
);

-- Tabla de imágenes de variantes
CREATE TABLE products.variant_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES products.product_variants(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para estado de pedidos
CREATE TABLE orders.order_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#000000',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- Tabla de pedidos
CREATE TABLE orders.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    status_id UUID NOT NULL REFERENCES orders.order_statuses(id),
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    shipping_address_id UUID REFERENCES auth.addresses(id),
    billing_address_id UUID REFERENCES auth.addresses(id),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    shipping_method VARCHAR(50),
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT
);

-- Tabla de items de pedido
CREATE TABLE orders.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products.products(id),
    variant_id UUID REFERENCES products.product_variants(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de métodos de pago
CREATE TABLE orders.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de métodos de envío
CREATE TABLE orders.shipping_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de transacciones
CREATE TABLE orders.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders.orders(id),
    transaction_type VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    gateway_reference VARCHAR(255),
    gateway_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de carritos de compra
CREATE TABLE orders.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de items de carrito
CREATE TABLE orders.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES orders.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products.products(id),
    variant_id UUID REFERENCES products.product_variants(id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cupones
CREATE TABLE orders.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- percentage, fixed_amount
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reseñas de productos
CREATE TABLE products.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    order_id UUID REFERENCES orders.orders(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    content TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de wishlist
CREATE TABLE products.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'Default',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de items de wishlist
CREATE TABLE products.wishlist_items (
    wishlist_id UUID NOT NULL REFERENCES products.wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products.products(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (wishlist_id, product_id)
);

-- Tabla de suscripciones a newsletter
CREATE TABLE auth.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Insertar valores iniciales para estados de pedido
INSERT INTO orders.order_statuses (name, description, color, sort_order) VALUES
('Pendiente', 'Pedido recibido, esperando confirmación de pago', '#FFA500', 1),
('Procesando', 'Pago confirmado, preparando pedido', '#0000FF', 2),
('Enviado', 'Pedido enviado al cliente', '#00BFFF', 3),
('Entregado', 'Pedido entregado correctamente', '#008000', 4),
('Cancelado', 'Pedido cancelado', '#FF0000', 5),
('Devuelto', 'Pedido devuelto por el cliente', '#800080', 6);

-- Insertar atributos comunes para productos de moda
INSERT INTO products.attributes (name, display_name, type) VALUES
('color', 'Color', 'color'),
('size', 'Talla', 'select'),
('material', 'Material', 'select'),
('style', 'Estilo', 'select'),
('season', 'Temporada', 'select');

-- Insertar valores para el atributo color
INSERT INTO products.attribute_values (attribute_id, value, display_value, color_hex) VALUES
((SELECT id FROM products.attributes WHERE name = 'color'), 'black', 'Negro', '#000000'),
((SELECT id FROM products.attributes WHERE name = 'color'), 'white', 'Blanco', '#FFFFFF'),
((SELECT id FROM products.attributes WHERE name = 'color'), 'red', 'Rojo', '#FF0000'),
((SELECT id FROM products.attributes WHERE name = 'color'), 'blue', 'Azul', '#0000FF'),
((SELECT id FROM products.attributes WHERE name = 'color'), 'green', 'Verde', '#008000'),
((SELECT id FROM products.attributes WHERE name = 'color'), 'yellow', 'Amarillo', '#FFFF00'),
((SELECT id FROM products.attributes WHERE name = 'color'), 'brown', 'Marrón', '#A52A2A'),
((SELECT id FROM products.attributes WHERE name = 'color'), 'grey', 'Gris', '#808080'),
((SELECT id FROM products.attributes WHERE name = 'color'), 'pink', 'Rosa', '#FFC0CB'),
((SELECT id FROM products.attributes WHERE name = 'color'), 'purple', 'Morado', '#800080');

-- Insertar valores para el atributo talla
INSERT INTO products.attribute_values (attribute_id, value, display_value) VALUES
((SELECT id FROM products.attributes WHERE name = 'size'), 'xs', 'XS'),
((SELECT id FROM products.attributes WHERE name = 'size'), 's', 'S'),
((SELECT id FROM products.attributes WHERE name = 'size'), 'm', 'M'),
((SELECT id FROM products.attributes WHERE name = 'size'), 'l', 'L'),
((SELECT id FROM products.attributes WHERE name = 'size'), 'xl', 'XL'),
((SELECT id FROM products.attributes WHERE name = 'size'), 'xxl', 'XXL'),
((SELECT id FROM products.attributes WHERE name = 'size'), '35', '35'),
((SELECT id FROM products.attributes WHERE name = 'size'), '36', '36'),
((SELECT id FROM products.attributes WHERE name = 'size'), '37', '37'),
((SELECT id FROM products.attributes WHERE name = 'size'), '38', '38'),
((SELECT id FROM products.attributes WHERE name = 'size'), '39', '39'),
((SELECT id FROM products.attributes WHERE name = 'size'), '40', '40'),
((SELECT id FROM products.attributes WHERE name = 'size'), '41', '41'),
((SELECT id FROM products.attributes WHERE name = 'size'), '42', '42'),
((SELECT id FROM products.attributes WHERE name = 'size'), '43', '43'),
((SELECT id FROM products.attributes WHERE name = 'size'), '44', '44'),
((SELECT id FROM products.attributes WHERE name = 'size'), '45', '45');

-- Insertar categorías principales
INSERT INTO products.categories (name, slug, description) VALUES
('Calzado', 'calzado', 'Todo tipo de calzado deportivo y casual'),
('Ropa', 'ropa', 'Prendas de vestir para todas las temporadas'),
('Accesorios', 'accesorios', 'Complementos para tus outfits');

-- Insertar subcategorías de calzado
INSERT INTO products.categories (name, slug, description, parent_id) VALUES
('Sneakers', 'sneakers', 'Zapatillas deportivas y casuales', (SELECT id FROM products.categories WHERE slug = 'calzado')),
('Botas', 'botas', 'Botas para diferentes estilos', (SELECT id FROM products.categories WHERE slug = 'calzado')),
('Sandalias', 'sandalias', 'Calzado fresco para el verano', (SELECT id FROM products.categories WHERE slug = 'calzado'));

-- Insertar subcategorías de ropa
INSERT INTO products.categories (name, slug, description, parent_id) VALUES
('Camisetas', 'camisetas', 'Camisetas y polos', (SELECT id FROM products.categories WHERE slug = 'ropa')),
('Sudaderas', 'sudaderas', 'Sudaderas y hoodies', (SELECT id FROM products.categories WHERE slug = 'ropa')),
('Pantalones', 'pantalones', 'Pantalones y jeans', (SELECT id FROM products.categories WHERE slug = 'ropa')),
('Chamarras', 'chamarras', 'Chamarras y chaquetas', (SELECT id FROM products.categories WHERE slug = 'ropa'));

-- Insertar subcategorías de accesorios
INSERT INTO products.categories (name, slug, description, parent_id) VALUES
('Gorras', 'gorras', 'Gorras y sombreros', (SELECT id FROM products.categories WHERE slug = 'accesorios')),
('Mochilas', 'mochilas', 'Mochilas y bolsos', (SELECT id FROM products.categories WHERE slug = 'accesorios')),
('Calcetines', 'calcetines', 'Calcetines para diversos estilos', (SELECT id FROM products.categories WHERE slug = 'accesorios'));

-- Insertar marcas populares
INSERT INTO products.brands (name, slug, description) VALUES
('Nike', 'nike', 'Marca líder en ropa y calzado deportivo'),
('Adidas', 'adidas', 'Marca alemana de ropa deportiva y casual'),
('Puma', 'puma', 'Marca de ropa deportiva con estilo urbano'),
('Vans', 'vans', 'Marca de calzado y ropa de estilo skater'),
('Converse', 'converse', 'Marca icónica de zapatillas de lona'),
('New Balance', 'new-balance', 'Marca especializada en zapatillas deportivas'),
('Champion', 'champion', 'Marca de ropa deportiva con historia'),
('Under Armour', 'under-armour', 'Marca de equipamiento deportivo de alto rendimiento');

-- Crear un usuario administrador
INSERT INTO auth.users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    is_admin
) VALUES (
    'admin@example.com',
    '$2a$10$rDX5IXB2rFJCwKMKD3DUCOrOMAJkxL.JZfsLUJrrGWumhlWfllMjG', -- contraseña: admin123
    'Admin',
    'User',
    TRUE
);

-- Crear funciones para facilitar la gestión

-- Función para actualizar el timestamp "updated_at"
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar automáticamente los campos updated_at
CREATE TRIGGER update_auth_users_timestamp BEFORE UPDATE ON auth.users
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_auth_addresses_timestamp BEFORE UPDATE ON auth.addresses
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_products_categories_timestamp BEFORE UPDATE ON products.categories
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_products_brands_timestamp BEFORE UPDATE ON products.brands
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_products_products_timestamp BEFORE UPDATE ON products.products
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_products_product_variants_timestamp BEFORE UPDATE ON products.product_variants
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_orders_orders_timestamp BEFORE UPDATE ON orders.orders
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_orders_carts_timestamp BEFORE UPDATE ON orders.carts
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_orders_cart_items_timestamp BEFORE UPDATE ON orders.cart_items
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_orders_coupons_timestamp BEFORE UPDATE ON orders.coupons
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_products_reviews_timestamp BEFORE UPDATE ON products.reviews
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_products_wishlists_timestamp BEFORE UPDATE ON products.wishlists
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Función para calcular totales de pedido
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
   -- Recalcular total
   UPDATE orders.orders
   SET total = subtotal + tax + shipping_cost - discount
   WHERE id = NEW.id;
   
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automáticamente los totales de pedido
CREATE TRIGGER calculate_order_totals_trigger AFTER UPDATE OF subtotal, tax, shipping_cost, discount ON orders.orders
FOR EACH ROW EXECUTE PROCEDURE calculate_order_totals();