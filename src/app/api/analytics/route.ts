// src/app/api/analytics/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET(request) {
  try {
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30days'; // Por defecto 30 días
    
    // Convertir el rango de tiempo a un número de días
    let days = 30;
    switch (timeRange) {
      case '7days': days = 7; break;
      case '30days': days = 30; break;
      case '90days': days = 90; break;
      case 'year': days = 365; break;
      default: days = 30;
    }
    
    // Crear fecha para el inicio del período
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Obtener todas las consultas en paralelo
    const [
      salesDataResult,
      productDataResult,
      categoryDataResult,
      customerDataResult,
      summaryDataResult,
      comparisonDataResult
    ] = await Promise.all([
      getSalesData(startDateStr),
      getProductData(startDateStr),
      getCategoryData(startDateStr),
      getCustomerData(startDateStr),
      getSummaryData(startDateStr),
      getComparisonData(startDateStr, days)
    ]);
    
    // Preparar respuesta
    const response = {
      salesData: salesDataResult,
      productData: productDataResult,
      categoryData: categoryDataResult,
      customerData: customerDataResult,
      summary: {
        ...summaryDataResult,
        ...comparisonDataResult
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al obtener datos analíticos:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos analíticos', details: error.message },
      { status: 500 }
    );
  }
}

// Función para obtener datos de ventas diarias
async function getSalesData(startDate) {
  const query = `
    SELECT 
      DATE(o.created_at) as date,
      SUM(o.total) as sales,
      COUNT(o.id) as orders
    FROM 
      orders.orders o
    WHERE 
      o.created_at >= $1
      AND o.status_id IN (
        SELECT id FROM orders.order_statuses 
        WHERE LOWER(name) NOT IN ('cancelado', 'cancelled')
      )
    GROUP BY 
      DATE(o.created_at)
    ORDER BY 
      date ASC
  `;
  
  const result = await pool.query(query, [startDate]);
  return result.rows;
}

// Función para obtener datos de productos más vendidos
async function getProductData(startDate) {
  const query = `
    SELECT 
      p.name,
      SUM(oi.quantity) as quantity,
      SUM(oi.total) as sales
    FROM 
      orders.order_items oi
    JOIN 
      products.products p ON oi.product_id = p.id
    JOIN 
      orders.orders o ON oi.order_id = o.id
    WHERE 
      o.created_at >= $1
      AND o.status_id IN (
        SELECT id FROM orders.order_statuses 
        WHERE LOWER(name) NOT IN ('cancelado', 'cancelled')
      )
    GROUP BY 
      p.name
    ORDER BY 
      sales DESC
    LIMIT 10
  `;
  
  const result = await pool.query(query, [startDate]);
  
  // Calcular el porcentaje del total
  const total = result.rows.reduce((sum, product) => sum + parseFloat(product.sales), 0);
  
  return result.rows.map(product => ({
    name: product.name,
    value: Math.round((parseFloat(product.sales) / total) * 100),
    sales: parseFloat(product.sales),
    quantity: parseInt(product.quantity)
  }));
}

// Función para obtener datos de ventas por categoría
async function getCategoryData(startDate) {
  const query = `
    SELECT 
      c.name,
      SUM(oi.total) as sales
    FROM 
      orders.order_items oi
    JOIN 
      products.products p ON oi.product_id = p.id
    JOIN 
      products.categories c ON p.main_category_id = c.id
    JOIN 
      orders.orders o ON oi.order_id = o.id
    WHERE 
      o.created_at >= $1
      AND o.status_id IN (
        SELECT id FROM orders.order_statuses 
        WHERE LOWER(name) NOT IN ('cancelado', 'cancelled')
      )
    GROUP BY 
      c.name
    ORDER BY 
      sales DESC
  `;
  
  const result = await pool.query(query, [startDate]);
  
  // Calcular el porcentaje del total
  const total = result.rows.reduce((sum, category) => sum + parseFloat(category.sales), 0);
  
  return result.rows.map(category => ({
    name: category.name || 'Sin categoría',
    value: Math.round((parseFloat(category.sales) / total) * 100),
    sales: parseFloat(category.sales)
  }));
}

// Función para obtener datos de adquisición de clientes
// Nota: Esta es una implementación básica ya que probablemente no tengas datos específicos de adquisición
async function getCustomerData(startDate) {
  // Si tienes datos reales de adquisición, reemplaza esta consulta
  const query = `
    SELECT 
      COUNT(DISTINCT u.id) as total_customers
    FROM 
      auth.users u
    WHERE 
      u.created_at >= $1
  `;
  
  const result = await pool.query(query, [startDate]);
  
  // Como probablemente no tengas datos específicos de canales de adquisición,
  // crearemos datos ficticios basados en el total real de clientes
  const totalCustomers = parseInt(result.rows[0]?.total_customers || 0);
  
  return [
    { name: "Directo", value: Math.round(totalCustomers * 0.4) },
    { name: "Orgánico", value: Math.round(totalCustomers * 0.25) },
    { name: "Social", value: Math.round(totalCustomers * 0.2) },
    { name: "Email", value: Math.round(totalCustomers * 0.1) },
    { name: "Referidos", value: Math.round(totalCustomers * 0.05) }
  ];
}

// Función para obtener datos de resumen
async function getSummaryData(startDate) {
  const query = `
    SELECT 
      COUNT(o.id) as total_orders,
      SUM(o.total) as total_sales,
      COUNT(DISTINCT o.user_id) as total_customers,
      COALESCE(AVG(o.total), 0) as avg_order_value
    FROM 
      orders.orders o
    WHERE 
      o.created_at >= $1
      AND o.status_id IN (
        SELECT id FROM orders.order_statuses 
        WHERE LOWER(name) NOT IN ('cancelado', 'cancelled')
      )
  `;
  
  const result = await pool.query(query, [startDate]);
  
  // Calcular tasa de conversión (estimación básica)
  // Idealmente, esto debería comparar visitantes vs compradores
  const conversionRateQuery = `
    SELECT 
      COUNT(o.id) as orders_count,
      (SELECT COUNT(u.id) FROM auth.users u WHERE u.created_at >= $1) as users_count
    FROM 
      orders.orders o
    WHERE 
      o.created_at >= $1
  `;
  
  const conversionResult = await pool.query(conversionRateQuery, [startDate]);
  
  const ordersCount = parseInt(conversionResult.rows[0]?.orders_count || 0);
  const usersCount = parseInt(conversionResult.rows[0]?.users_count || 0);
  
  const conversionRate = usersCount > 0 ? (ordersCount / usersCount) * 100 : 0;
  
  return {
    totalOrders: parseInt(result.rows[0]?.total_orders || 0),
    totalSales: parseFloat(result.rows[0]?.total_sales || 0),
    totalCustomers: parseInt(result.rows[0]?.total_customers || 0),
    avgOrderValue: parseFloat(result.rows[0]?.avg_order_value || 0),
    conversionRate: parseFloat(conversionRate.toFixed(2))
  };
}

// Función para obtener datos de comparación con el período anterior
async function getComparisonData(startDate, days) {
  // Calcular el período anterior
  const endOfPreviousPeriod = new Date(startDate);
  const startOfPreviousPeriod = new Date(startDate);
  startOfPreviousPeriod.setDate(startOfPreviousPeriod.getDate() - days);
  
  const prevPeriodStartStr = startOfPreviousPeriod.toISOString().split('T')[0];
  const prevPeriodEndStr = endOfPreviousPeriod.toISOString().split('T')[0];
  
  const query = `
    SELECT 
      'current' as period,
      COUNT(o.id) as orders_count,
      SUM(o.total) as sales_total
    FROM 
      orders.orders o
    WHERE 
      o.created_at >= $1
      AND o.status_id IN (
        SELECT id FROM orders.order_statuses 
        WHERE LOWER(name) NOT IN ('cancelado', 'cancelled')
      )
    
    UNION ALL
    
    SELECT 
      'previous' as period,
      COUNT(o.id) as orders_count,
      SUM(o.total) as sales_total
    FROM 
      orders.orders o
    WHERE 
      o.created_at >= $2 AND o.created_at < $3
      AND o.status_id IN (
        SELECT id FROM orders.order_statuses 
        WHERE LOWER(name) NOT IN ('cancelado', 'cancelled')
      )
  `;
  
  const result = await pool.query(query, [startDate, prevPeriodStartStr, prevPeriodEndStr]);
  
  // Encontrar datos para el período actual y anterior
  const currentPeriod = result.rows.find(row => row.period === 'current');
  const previousPeriod = result.rows.find(row => row.period === 'previous');
  
  // Calcular crecimiento
  const currentSales = parseFloat(currentPeriod?.sales_total || 0);
  const previousSales = parseFloat(previousPeriod?.sales_total || 0);
  const salesGrowth = previousSales > 0 
    ? ((currentSales - previousSales) / previousSales) * 100 
    : 0;
  
  const currentOrders = parseInt(currentPeriod?.orders_count || 0);
  const previousOrders = parseInt(previousPeriod?.orders_count || 0);
  const ordersGrowth = previousOrders > 0 
    ? ((currentOrders - previousOrders) / previousOrders) * 100 
    : 0;
  
  return {
    salesGrowth: parseFloat(salesGrowth.toFixed(2)),
    ordersGrowth: parseFloat(ordersGrowth.toFixed(2))
  };
}