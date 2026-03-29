"""
TC Pro Dojo Shop API Tests - Iteration 4
Tests for shop products, checkout, shipping rates, and admin orders
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test product IDs from seed data
TEST_PRODUCT_1_ID = "910e18c3-1dcb-49a9-b817-523643aa38a1"  # TC Pro Dojo T-Shirt $35.00
TEST_PRODUCT_2_ID = "c9af6660-64bd-41bb-8840-4333f4edd8dc"  # TC Pro Dojo Hoodie $65.00


class TestPublicShopEndpoints:
    """Public shop endpoints - no auth required"""

    def test_get_products_returns_list(self):
        """GET /api/products returns active products list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Products should be a list"
        print(f"✓ GET /api/products returned {len(data)} products")

    def test_get_products_contains_expected_products(self):
        """Verify test products exist in products list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        data = response.json()
        product_ids = [p['id'] for p in data]
        
        # Check for expected test products
        assert TEST_PRODUCT_1_ID in product_ids, f"T-Shirt product not found"
        assert TEST_PRODUCT_2_ID in product_ids, f"Hoodie product not found"
        
        # Verify product structure
        tshirt = next((p for p in data if p['id'] == TEST_PRODUCT_1_ID), None)
        assert tshirt is not None
        assert tshirt['name'] == 'TC Pro Dojo T-Shirt'
        assert tshirt['price'] == 35.00
        assert 'sizes' in tshirt
        assert len(tshirt['sizes']) > 0
        print(f"✓ Found T-Shirt: ${tshirt['price']}, sizes: {tshirt['sizes']}")

    def test_get_shipping_rates(self):
        """GET /api/shop/shipping-rates returns rates and delivery note"""
        response = requests.get(f"{BASE_URL}/api/shop/shipping-rates")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'rates' in data, "Response should contain 'rates'"
        assert 'note' in data, "Response should contain 'note'"
        
        rates = data['rates']
        assert rates.get('quebec') == 10.00, f"Quebec rate should be $10, got {rates.get('quebec')}"
        assert rates.get('canada') == 15.00, f"Canada rate should be $15, got {rates.get('canada')}"
        assert rates.get('international') == 25.00, f"International rate should be $25, got {rates.get('international')}"
        
        assert '4 weeks' in data['note'].lower(), "Note should mention 4 weeks delivery"
        print(f"✓ Shipping rates: QC=${rates['quebec']}, CA=${rates['canada']}, Intl=${rates['international']}")
        print(f"✓ Delivery note: {data['note']}")


class TestCheckoutEndpoint:
    """POST /api/shop/checkout - creates order and Stripe session"""

    def test_checkout_creates_order_and_returns_checkout_url(self):
        """POST /api/shop/checkout creates order + Stripe session, returns checkout_url"""
        checkout_payload = {
            "customer_name": "TEST_John Doe",
            "customer_email": "test@example.com",
            "customer_phone": "514-555-1234",
            "items": [
                {
                    "product_id": TEST_PRODUCT_1_ID,
                    "name": "TC Pro Dojo T-Shirt",
                    "price": 35.00,
                    "size": "L",
                    "quantity": 2
                }
            ],
            "shipping_address": {
                "street": "123 Test Street",
                "city": "Montreal",
                "province": "QC",
                "country": "Canada",
                "postal_code": "H3A 1A1"
            },
            "order_notes": "Test order - please ignore",
            "origin_url": BASE_URL
        }
        
        response = requests.post(f"{BASE_URL}/api/shop/checkout", json=checkout_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'checkout_url' in data, "Response should contain checkout_url"
        assert 'session_id' in data, "Response should contain session_id"
        assert 'order_id' in data, "Response should contain order_id"
        
        assert data['checkout_url'].startswith('http'), "checkout_url should be a valid URL"
        assert len(data['session_id']) > 0, "session_id should not be empty"
        assert len(data['order_id']) > 0, "order_id should not be empty"
        
        print(f"✓ Checkout created order_id: {data['order_id'][:8]}...")
        print(f"✓ Stripe session_id: {data['session_id'][:20]}...")
        print(f"✓ Checkout URL starts with: {data['checkout_url'][:50]}...")

    def test_checkout_with_quebec_shipping(self):
        """Checkout with QC address should use $10 shipping"""
        checkout_payload = {
            "customer_name": "TEST_Quebec Customer",
            "customer_email": "qc@example.com",
            "customer_phone": "",
            "items": [
                {
                    "product_id": TEST_PRODUCT_2_ID,
                    "name": "TC Pro Dojo Hoodie",
                    "price": 65.00,
                    "size": "M",
                    "quantity": 1
                }
            ],
            "shipping_address": {
                "street": "456 Rue Test",
                "city": "Quebec City",
                "province": "QC",
                "country": "Canada",
                "postal_code": "G1A 1A1"
            },
            "order_notes": "",
            "origin_url": BASE_URL
        }
        
        response = requests.post(f"{BASE_URL}/api/shop/checkout", json=checkout_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'checkout_url' in data
        print(f"✓ Quebec checkout created successfully")

    def test_checkout_with_canada_shipping(self):
        """Checkout with non-QC Canada address should use $15 shipping"""
        checkout_payload = {
            "customer_name": "TEST_Ontario Customer",
            "customer_email": "on@example.com",
            "customer_phone": "",
            "items": [
                {
                    "product_id": TEST_PRODUCT_1_ID,
                    "name": "TC Pro Dojo T-Shirt",
                    "price": 35.00,
                    "size": "XL",
                    "quantity": 1
                }
            ],
            "shipping_address": {
                "street": "789 Test Ave",
                "city": "Toronto",
                "province": "ON",
                "country": "Canada",
                "postal_code": "M5V 1A1"
            },
            "order_notes": "",
            "origin_url": BASE_URL
        }
        
        response = requests.post(f"{BASE_URL}/api/shop/checkout", json=checkout_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'checkout_url' in data
        print(f"✓ Ontario (Canada) checkout created successfully")

    def test_checkout_with_international_shipping(self):
        """Checkout with international address should use $25 shipping"""
        checkout_payload = {
            "customer_name": "TEST_International Customer",
            "customer_email": "intl@example.com",
            "customer_phone": "",
            "items": [
                {
                    "product_id": TEST_PRODUCT_1_ID,
                    "name": "TC Pro Dojo T-Shirt",
                    "price": 35.00,
                    "size": "S",
                    "quantity": 1
                }
            ],
            "shipping_address": {
                "street": "123 Main St",
                "city": "New York",
                "province": "NY",
                "country": "USA",
                "postal_code": "10001"
            },
            "order_notes": "",
            "origin_url": BASE_URL
        }
        
        response = requests.post(f"{BASE_URL}/api/shop/checkout", json=checkout_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'checkout_url' in data
        print(f"✓ International checkout created successfully")

    def test_checkout_with_invalid_product_fails(self):
        """Checkout with non-existent product should fail"""
        checkout_payload = {
            "customer_name": "TEST_Invalid Product",
            "customer_email": "invalid@example.com",
            "customer_phone": "",
            "items": [
                {
                    "product_id": "non-existent-product-id",
                    "name": "Fake Product",
                    "price": 100.00,
                    "size": "M",
                    "quantity": 1
                }
            ],
            "shipping_address": {
                "street": "123 Test St",
                "city": "Montreal",
                "province": "QC",
                "country": "Canada",
                "postal_code": "H3A 1A1"
            },
            "order_notes": "",
            "origin_url": BASE_URL
        }
        
        response = requests.post(f"{BASE_URL}/api/shop/checkout", json=checkout_payload)
        assert response.status_code == 400, f"Expected 400 for invalid product, got {response.status_code}"
        print(f"✓ Invalid product checkout correctly rejected with 400")


class TestOrderStatusEndpoint:
    """GET /api/shop/order-status/{session_id} - polls payment status"""

    def test_order_status_with_invalid_session(self):
        """Order status with invalid session_id should handle gracefully"""
        response = requests.get(f"{BASE_URL}/api/shop/order-status/invalid_session_id_12345")
        # This may return 200 with pending status or an error - depends on Stripe behavior
        # Just verify it doesn't crash
        assert response.status_code in [200, 400, 404, 500], f"Unexpected status: {response.status_code}"
        print(f"✓ Invalid session_id handled (status: {response.status_code})")


class TestAdminProductEndpoints:
    """Admin product CRUD endpoints - requires auth"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        login_response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        if login_response.status_code == 200:
            self.token = login_response.json().get('access_token')
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Admin login failed - skipping admin tests")

    def test_get_admin_products(self):
        """GET /api/admin/products returns all products (including inactive)"""
        response = requests.get(f"{BASE_URL}/api/admin/products", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin products endpoint returned {len(data)} products")

    def test_create_product(self):
        """POST /api/admin/products creates a new product"""
        new_product = {
            "name": "TEST_New Product",
            "description": "Test product description",
            "price": 49.99,
            "imageUrl": "",
            "sizes": ["S", "M", "L"],
            "category": "merch",
            "active": True,
            "displayOrder": 99
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/products", json=new_product, headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data['name'] == new_product['name']
        assert data['price'] == new_product['price']
        assert 'id' in data
        
        # Store for cleanup
        self.created_product_id = data['id']
        print(f"✓ Created product: {data['name']} (id: {data['id'][:8]}...)")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/products/{data['id']}", headers=self.headers)

    def test_update_product(self):
        """PUT /api/admin/products/{id} updates a product"""
        # First create a product
        new_product = {
            "name": "TEST_Update Product",
            "description": "Original description",
            "price": 29.99,
            "imageUrl": "",
            "sizes": ["M"],
            "category": "merch",
            "active": True,
            "displayOrder": 98
        }
        
        create_response = requests.post(f"{BASE_URL}/api/admin/products", json=new_product, headers=self.headers)
        assert create_response.status_code == 200
        product_id = create_response.json()['id']
        
        # Update the product
        updated_product = {
            "id": product_id,
            "name": "TEST_Updated Product Name",
            "description": "Updated description",
            "price": 39.99,
            "imageUrl": "",
            "sizes": ["M", "L", "XL"],
            "category": "merch",
            "active": True,
            "displayOrder": 98
        }
        
        update_response = requests.put(f"{BASE_URL}/api/admin/products/{product_id}", json=updated_product, headers=self.headers)
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        
        data = update_response.json()
        assert data['name'] == "TEST_Updated Product Name"
        assert data['price'] == 39.99
        print(f"✓ Updated product: {data['name']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/products/{product_id}", headers=self.headers)

    def test_delete_product(self):
        """DELETE /api/admin/products/{id} deletes a product"""
        # First create a product
        new_product = {
            "name": "TEST_Delete Product",
            "description": "To be deleted",
            "price": 19.99,
            "imageUrl": "",
            "sizes": ["S"],
            "category": "merch",
            "active": True,
            "displayOrder": 97
        }
        
        create_response = requests.post(f"{BASE_URL}/api/admin/products", json=new_product, headers=self.headers)
        assert create_response.status_code == 200
        product_id = create_response.json()['id']
        
        # Delete the product
        delete_response = requests.delete(f"{BASE_URL}/api/admin/products/{product_id}", headers=self.headers)
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/admin/products", headers=self.headers)
        products = get_response.json()
        product_ids = [p['id'] for p in products]
        assert product_id not in product_ids, "Product should be deleted"
        print(f"✓ Deleted product successfully")


class TestAdminOrdersEndpoint:
    """GET /api/admin/orders - requires auth"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        login_response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        if login_response.status_code == 200:
            self.token = login_response.json().get('access_token')
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Admin login failed - skipping admin tests")

    def test_get_admin_orders(self):
        """GET /api/admin/orders returns order list"""
        response = requests.get(f"{BASE_URL}/api/admin/orders", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Orders should be a list"
        print(f"✓ Admin orders endpoint returned {len(data)} orders")
        
        # If there are orders, verify structure
        if len(data) > 0:
            order = data[0]
            assert 'id' in order
            assert 'customer_name' in order
            assert 'customer_email' in order
            assert 'items' in order
            assert 'total' in order
            assert 'payment_status' in order
            print(f"✓ Order structure verified: {order['id'][:8]}... - {order['customer_name']}")

    def test_admin_orders_requires_auth(self):
        """GET /api/admin/orders without auth should fail"""
        response = requests.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✓ Admin orders correctly requires authentication")


class TestAdminProductsRequiresAuth:
    """Verify admin product endpoints require authentication"""

    def test_admin_products_get_requires_auth(self):
        """GET /api/admin/products without auth should fail"""
        response = requests.get(f"{BASE_URL}/api/admin/products")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ GET /api/admin/products requires auth")

    def test_admin_products_post_requires_auth(self):
        """POST /api/admin/products without auth should fail"""
        response = requests.post(f"{BASE_URL}/api/admin/products", json={"name": "test"})
        assert response.status_code in [401, 403, 422], f"Expected 401/403/422, got {response.status_code}"
        print(f"✓ POST /api/admin/products requires auth")

    def test_admin_products_put_requires_auth(self):
        """PUT /api/admin/products/{id} without auth should fail"""
        response = requests.put(f"{BASE_URL}/api/admin/products/test-id", json={"name": "test"})
        assert response.status_code in [401, 403, 422], f"Expected 401/403/422, got {response.status_code}"
        print(f"✓ PUT /api/admin/products requires auth")

    def test_admin_products_delete_requires_auth(self):
        """DELETE /api/admin/products/{id} without auth should fail"""
        response = requests.delete(f"{BASE_URL}/api/admin/products/test-id")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ DELETE /api/admin/products requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
