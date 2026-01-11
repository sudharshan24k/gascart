# API Documentation

Base URL: `http://localhost:3000/api/v1`

## Authentication

Authentication is handled via Supabase Auth. The client should send the JWT in the `Authorization` header.

Header: `Authorization: Bearer <token>`

## Products

### Get All Products
`GET /products`

Query Params:
- `category`: Filter by category ID
- `minPrice`: Filter by minimum price
- `maxPrice`: Filter by maximum price
- `sort`: `price_asc`, `price_desc`, `newest`
- `search`: Search by name

### Get Single Product
`GET /products/:id`

### Create Product (Admin)
`POST /products`

Body:
```json
{
  "name": "Product Name",
  "price": 100.00,
  "category_id": "uuid",
  "description": "..."
}
```

## Cart

### Get Cart
`GET /cart`

Headers:
- `x-session-id`: UUID (for guests)
- OR Bearer Token (for logged in users)

### Add to Cart
`POST /cart`

Body:
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

## Orders

### Create Order
`POST /orders`

Body:
```json
{
  "items": [...],
  "shippingAddress": {...},
  "totalAmount": 100.50
}
```

### Get My Orders
`GET /orders`
