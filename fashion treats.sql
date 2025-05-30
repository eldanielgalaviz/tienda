
CREATE SCHEMA analytics;


ALTER SCHEMA analytics OWNER TO postgres;


CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;



CREATE SCHEMA "auth,products,orders";


ALTER SCHEMA "auth,products,orders" OWNER TO postgres;

CREATE SCHEMA orders;


ALTER SCHEMA orders OWNER TO postgres;

CREATE SCHEMA products;


ALTER SCHEMA products OWNER TO postgres;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


CREATE FUNCTION public.calculate_order_totals() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   -- Recalcular total
   UPDATE orders.orders
   SET total = subtotal + tax + shipping_cost - discount
   WHERE id = NEW.id;
   
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.calculate_order_totals() OWNER TO postgres;

CREATE FUNCTION public.update_daily_sales() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    sale_date DATE;
    daily_orders INTEGER;
    daily_total DECIMAL(10, 2);
BEGIN
    sale_date := DATE(NEW.created_at);
    
    -- Obtener estadísticas actuales del día
    SELECT COUNT(*), COALESCE(SUM(total), 0)
    INTO daily_orders, daily_total
    FROM orders.orders
    WHERE DATE(created_at) = sale_date;
    
    -- Actualizar o insertar registro diario
    INSERT INTO analytics.daily_sales (date, total_sales, orders_count, average_order_value)
    VALUES (
        sale_date,
        daily_total,
        daily_orders,
        CASE WHEN daily_orders > 0 THEN daily_total / daily_orders ELSE 0 END
    )
    ON CONFLICT (date) 
    DO UPDATE SET 
        total_sales = daily_total,
        orders_count = daily_orders,
        average_order_value = CASE WHEN daily_orders > 0 THEN daily_total / daily_orders ELSE 0 END;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_daily_sales() OWNER TO postgres;

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE analytics.brand_sales (
    brand_id uuid NOT NULL,
    total_sales numeric(10,2) DEFAULT 0 NOT NULL,
    products_sold integer DEFAULT 0 NOT NULL,
    last_sale_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE analytics.brand_sales OWNER TO postgres;

CREATE TABLE analytics.category_sales (
    category_id uuid NOT NULL,
    total_sales numeric(10,2) DEFAULT 0 NOT NULL,
    products_sold integer DEFAULT 0 NOT NULL,
    last_sale_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE analytics.category_sales OWNER TO postgres;


CREATE TABLE analytics.daily_sales (
    date date NOT NULL,
    total_sales numeric(10,2) DEFAULT 0 NOT NULL,
    orders_count integer DEFAULT 0 NOT NULL,
    average_order_value numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE analytics.daily_sales OWNER TO postgres;


CREATE TABLE analytics.product_sales (
    product_id uuid NOT NULL,
    total_sales numeric(10,2) DEFAULT 0 NOT NULL,
    total_quantity integer DEFAULT 0 NOT NULL,
    last_sale_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE analytics.product_sales OWNER TO postgres;

CREATE TABLE analytics.purchase_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    products_count integer NOT NULL,
    products_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE analytics.purchase_events OWNER TO postgres;

CREATE TABLE auth.addresses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    postal_code character varying(20) NOT NULL,
    country character varying(100) DEFAULT 'M‚xico'::character varying,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE auth.addresses OWNER TO postgres;

CREATE TABLE auth.sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE auth.sessions OWNER TO postgres;

CREATE TABLE auth.subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    subscribed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at timestamp with time zone
);


ALTER TABLE auth.subscriptions OWNER TO postgres;

CREATE TABLE auth.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp with time zone,
    is_admin boolean DEFAULT false,
    is_active boolean DEFAULT true
);


ALTER TABLE auth.users OWNER TO postgres;

CREATE TABLE orders.cart_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    quantity integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE orders.cart_items OWNER TO postgres;

CREATE TABLE orders.carts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    session_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone
);


ALTER TABLE orders.carts OWNER TO postgres;

CREATE TABLE orders.coupons (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    minimum_order_amount numeric(10,2) DEFAULT 0,
    usage_limit integer,
    usage_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    starts_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE orders.coupons OWNER TO postgres;

CREATE TABLE orders.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE orders.order_items OWNER TO postgres;

CREATE TABLE orders.order_statuses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#000000'::character varying,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0
);


ALTER TABLE orders.order_statuses OWNER TO postgres;

CREATE TABLE orders.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying(50) NOT NULL,
    user_id uuid,
    status_id uuid NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax numeric(10,2) NOT NULL,
    shipping_cost numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    shipping_address_id uuid,
    billing_address_id uuid,
    payment_method character varying(50),
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    shipping_method character varying(50),
    tracking_number character varying(100),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text
);


ALTER TABLE orders.orders OWNER TO postgres;

CREATE TABLE orders.payment_methods (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE orders.payment_methods OWNER TO postgres;

CREATE TABLE orders.shipping_methods (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE orders.shipping_methods OWNER TO postgres;

CREATE TABLE orders.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    transaction_type character varying(50) NOT NULL,
    payment_method character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    status character varying(50) NOT NULL,
    gateway_reference character varying(255),
    gateway_response text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE orders.transactions OWNER TO postgres;

CREATE TABLE products.attribute_values (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    attribute_id uuid NOT NULL,
    value character varying(100) NOT NULL,
    display_value character varying(100) NOT NULL,
    color_hex character varying(7),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE products.attribute_values OWNER TO postgres;

CREATE TABLE products.attributes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE products.attributes OWNER TO postgres;

CREATE TABLE products.brands (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    logo_url character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE products.brands OWNER TO postgres;

CREATE TABLE products.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    parent_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE products.categories OWNER TO postgres;

CREATE TABLE products.product_categories (
    product_id uuid NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE products.product_categories OWNER TO postgres;


CREATE TABLE products.product_images (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid NOT NULL,
    image_url character varying(255) NOT NULL,
    alt_text character varying(255),
    is_primary boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE products.product_images OWNER TO postgres;

CREATE TABLE products.product_variants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid NOT NULL,
    sku character varying(100),
    barcode character varying(100),
    price numeric(10,2),
    compare_at_price numeric(10,2),
    cost_price numeric(10,2),
    stock_quantity integer DEFAULT 0,
    weight numeric(10,2),
    weight_unit character varying(10) DEFAULT 'kg'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE products.product_variants OWNER TO postgres;
-

CREATE TABLE products.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    compare_at_price numeric(10,2),
    cost_price numeric(10,2),
    sku character varying(100),
    barcode character varying(100),
    brand_id uuid,
    main_category_id uuid NOT NULL,
    stock_quantity integer DEFAULT 0,
    weight numeric(10,2),
    weight_unit character varying(10) DEFAULT 'kg'::character varying,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    meta_title character varying(255),
    meta_description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    published_at timestamp with time zone
);


ALTER TABLE products.products OWNER TO postgres;
CREATE TABLE products.reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid,
    rating integer NOT NULL,
    title character varying(255),
    content text,
    is_approved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE products.reviews OWNER TO postgres;
CREATE TABLE products.variant_attribute_values (
    variant_id uuid NOT NULL,
    attribute_value_id uuid NOT NULL
);


ALTER TABLE products.variant_attribute_values OWNER TO postgres;

CREATE TABLE products.variant_images (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    variant_id uuid NOT NULL,
    image_url character varying(255) NOT NULL,
    alt_text character varying(255),
    is_primary boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE products.variant_images OWNER TO postgres;

CREATE TABLE products.wishlist_items (
    wishlist_id uuid NOT NULL,
    product_id uuid NOT NULL,
    added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE products.wishlist_items OWNER TO postgres;


CREATE TABLE products.wishlists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(100) DEFAULT 'Default'::character varying,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE products.wishlists OWNER TO postgres;
