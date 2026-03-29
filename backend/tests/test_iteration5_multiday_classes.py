"""
Iteration 5 Tests: Multi-day/Multi-time Class Scheduling, Product CRUD, Shop Checkout
Focus: Testing the new schedule array feature for recurring classes with multiple day/time entries
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "tcprodojo2025"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token"""
    response = api_client.post(f"{BASE_URL}/api/admin/login", json={
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    token = response.json().get("access_token")
    assert token, "No access_token in login response"
    return token


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ==================== ADMIN LOGIN TESTS ====================

class TestAdminLogin:
    """Admin authentication tests"""
    
    def test_admin_login_success(self, api_client):
        """POST /api/admin/login with valid credentials returns token"""
        response = api_client.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        print(f"✓ Admin login successful, token received")
    
    def test_admin_login_invalid_credentials(self, api_client):
        """POST /api/admin/login with invalid credentials returns 401"""
        response = api_client.post(f"{BASE_URL}/api/admin/login", json={
            "username": "wronguser",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print(f"✓ Invalid credentials correctly rejected with 401")


# ==================== PUBLIC CLASSES API TESTS ====================

class TestPublicClassesAPI:
    """Public classes endpoint tests"""
    
    def test_get_classes_returns_list(self, api_client):
        """GET /api/classes returns list of classes"""
        response = api_client.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/classes returned {len(data)} classes")
        
        # Check structure of first class if exists
        if len(data) > 0:
            first_class = data[0]
            assert "id" in first_class
            assert "title" in first_class
            assert "instructor" in first_class
            print(f"✓ Class structure validated: {first_class.get('title')}")


# ==================== ADMIN CLASS CRUD TESTS ====================

class TestAdminClassCRUD:
    """Admin class management with multi-day/multi-time schedule array"""
    
    test_class_id = None
    
    def test_create_class_with_schedule_array(self, authenticated_client):
        """POST /api/admin/classes creates class with schedule array [{day, time}]"""
        unique_title = f"TEST_MultiDay_Class_{uuid.uuid4().hex[:8]}"
        
        payload = {
            "title": unique_title,
            "instructor": "Test Instructor",
            "level": "Beginner",
            "spots": 15,
            "type": "Wrestling",
            "description": "Test class with multiple schedule entries",
            "is_one_time": False,
            "one_time_date": "",
            # Multi-day/multi-time schedule array
            "schedule": [
                {"day": "Monday", "time": "6:00 PM"},
                {"day": "Wednesday", "time": "7:00 PM"},
                {"day": "Friday", "time": "5:30 PM"}
            ],
            # Legacy fields for backward compat
            "day": "Monday",
            "days": ["Monday", "Wednesday", "Friday"],
            "time": "6:00 PM"
        }
        
        response = authenticated_client.post(f"{BASE_URL}/api/admin/classes", json=payload)
        assert response.status_code == 200, f"Create class failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["title"] == unique_title
        assert data["schedule"] == payload["schedule"]
        assert len(data["schedule"]) == 3
        
        TestAdminClassCRUD.test_class_id = data["id"]
        print(f"✓ Created class with 3 schedule entries: {data['id']}")
    
    def test_get_created_class_in_public_list(self, api_client):
        """GET /api/classes should include the newly created class"""
        assert TestAdminClassCRUD.test_class_id, "No test class ID - create test must run first"
        
        response = api_client.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        
        classes = response.json()
        found = next((c for c in classes if c["id"] == TestAdminClassCRUD.test_class_id), None)
        assert found, f"Created class {TestAdminClassCRUD.test_class_id} not found in public list"
        
        # Verify schedule array is present
        assert "schedule" in found
        assert len(found["schedule"]) == 3
        assert found["schedule"][0]["day"] == "Monday"
        assert found["schedule"][0]["time"] == "6:00 PM"
        print(f"✓ Class found in public list with correct schedule array")
    
    def test_update_class_schedule(self, authenticated_client):
        """PUT /api/admin/classes/{id} updates class schedule"""
        assert TestAdminClassCRUD.test_class_id, "No test class ID"
        
        # IMPORTANT: Must include the original ID to prevent new ID generation
        updated_payload = {
            "id": TestAdminClassCRUD.test_class_id,  # Preserve original ID
            "title": f"TEST_Updated_MultiDay_{uuid.uuid4().hex[:8]}",
            "instructor": "Updated Instructor",
            "level": "Intermediate",
            "spots": 20,
            "type": "Boxing",
            "description": "Updated description",
            "is_one_time": False,
            "one_time_date": "",
            "schedule": [
                {"day": "Tuesday", "time": "7:00 PM"},
                {"day": "Thursday", "time": "8:00 PM"}
            ],
            "day": "Tuesday",
            "days": ["Tuesday", "Thursday"],
            "time": "7:00 PM"
        }
        
        response = authenticated_client.put(
            f"{BASE_URL}/api/admin/classes/{TestAdminClassCRUD.test_class_id}",
            json=updated_payload
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        data = response.json()
        assert data["level"] == "Intermediate"
        assert len(data["schedule"]) == 2
        assert data["schedule"][0]["day"] == "Tuesday"
        print(f"✓ Class updated with new schedule (2 entries)")
    
    def test_verify_update_persisted(self, api_client):
        """GET /api/classes should show updated class data"""
        assert TestAdminClassCRUD.test_class_id, "No test class ID"
        
        response = api_client.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        
        classes = response.json()
        found = next((c for c in classes if c["id"] == TestAdminClassCRUD.test_class_id), None)
        assert found, "Updated class not found"
        assert found["level"] == "Intermediate"
        assert len(found["schedule"]) == 2
        print(f"✓ Update persisted correctly")
    
    def test_delete_class(self, authenticated_client):
        """DELETE /api/admin/classes/{id} removes class"""
        assert TestAdminClassCRUD.test_class_id, "No test class ID"
        
        response = authenticated_client.delete(
            f"{BASE_URL}/api/admin/classes/{TestAdminClassCRUD.test_class_id}"
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        print(f"✓ Class deleted successfully")
    
    def test_verify_delete_persisted(self, api_client):
        """GET /api/classes should not include deleted class"""
        assert TestAdminClassCRUD.test_class_id, "No test class ID"
        
        response = api_client.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        
        classes = response.json()
        found = next((c for c in classes if c["id"] == TestAdminClassCRUD.test_class_id), None)
        assert found is None, "Deleted class still appears in list"
        print(f"✓ Delete persisted - class no longer in list")


# ==================== PRODUCT CRUD TESTS ====================

class TestProductCRUD:
    """Product management tests"""
    
    test_product_id = None
    
    def test_get_public_products(self, api_client):
        """GET /api/products returns active products"""
        response = api_client.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/products returned {len(data)} active products")
        
        # Verify all returned products are active
        for product in data:
            assert product.get("active", True) == True, f"Inactive product in public list: {product.get('name')}"
    
    def test_create_product(self, authenticated_client):
        """POST /api/admin/products creates new product"""
        unique_name = f"TEST_Product_{uuid.uuid4().hex[:8]}"
        
        payload = {
            "name": unique_name,
            "description": "Test product description",
            "price": 49.99,
            "imageUrl": "https://example.com/test-product.jpg",
            "sizes": ["S", "M", "L", "XL"],
            "category": "merch",
            "active": True,
            "displayOrder": 100
        }
        
        response = authenticated_client.post(f"{BASE_URL}/api/admin/products", json=payload)
        assert response.status_code == 200, f"Create product failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["name"] == unique_name
        assert data["price"] == 49.99
        assert data["sizes"] == ["S", "M", "L", "XL"]
        
        TestProductCRUD.test_product_id = data["id"]
        print(f"✓ Created product: {data['id']}")
    
    def test_get_created_product_in_public_list(self, api_client):
        """GET /api/products should include newly created active product"""
        assert TestProductCRUD.test_product_id, "No test product ID"
        
        response = api_client.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        products = response.json()
        found = next((p for p in products if p["id"] == TestProductCRUD.test_product_id), None)
        assert found, f"Created product not found in public list"
        assert found["price"] == 49.99
        print(f"✓ Product found in public list")
    
    def test_update_product(self, authenticated_client):
        """PUT /api/admin/products/{id} updates product"""
        assert TestProductCRUD.test_product_id, "No test product ID"
        
        # IMPORTANT: Must include the original ID to prevent new ID generation
        updated_payload = {
            "id": TestProductCRUD.test_product_id,  # Preserve original ID
            "name": f"TEST_Updated_Product_{uuid.uuid4().hex[:8]}",
            "description": "Updated description",
            "price": 59.99,
            "imageUrl": "https://example.com/updated-product.jpg",
            "sizes": ["M", "L", "XL", "2XL"],
            "category": "merch",
            "active": True,
            "displayOrder": 101
        }
        
        response = authenticated_client.put(
            f"{BASE_URL}/api/admin/products/{TestProductCRUD.test_product_id}",
            json=updated_payload
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        data = response.json()
        assert data["price"] == 59.99
        assert "2XL" in data["sizes"]
        print(f"✓ Product updated successfully")
    
    def test_verify_product_update_persisted(self, api_client):
        """GET /api/products should show updated product data"""
        assert TestProductCRUD.test_product_id, "No test product ID"
        
        response = api_client.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        products = response.json()
        found = next((p for p in products if p["id"] == TestProductCRUD.test_product_id), None)
        assert found, "Updated product not found"
        assert found["price"] == 59.99
        print(f"✓ Product update persisted")
    
    def test_delete_product(self, authenticated_client):
        """DELETE /api/admin/products/{id} removes product"""
        assert TestProductCRUD.test_product_id, "No test product ID"
        
        response = authenticated_client.delete(
            f"{BASE_URL}/api/admin/products/{TestProductCRUD.test_product_id}"
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        print(f"✓ Product deleted successfully")
    
    def test_verify_product_delete_persisted(self, api_client):
        """GET /api/products should not include deleted product"""
        assert TestProductCRUD.test_product_id, "No test product ID"
        
        response = api_client.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        products = response.json()
        found = next((p for p in products if p["id"] == TestProductCRUD.test_product_id), None)
        assert found is None, "Deleted product still appears in list"
        print(f"✓ Product delete persisted")


# ==================== ADMIN ORDERS TESTS ====================

class TestAdminOrders:
    """Admin orders endpoint tests"""
    
    def test_get_admin_orders(self, authenticated_client):
        """GET /api/admin/orders returns orders list"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/admin/orders returned {len(data)} orders")


# ==================== SHOP CHECKOUT TESTS ====================

class TestShopCheckout:
    """Shop checkout flow tests"""
    
    def test_get_shipping_rates(self, api_client):
        """GET /api/shop/shipping-rates returns rates"""
        response = api_client.get(f"{BASE_URL}/api/shop/shipping-rates")
        assert response.status_code == 200
        data = response.json()
        assert "rates" in data
        assert "note" in data
        
        rates = data["rates"]
        assert "quebec" in rates
        assert "canada" in rates
        assert "international" in rates
        print(f"✓ Shipping rates: QC=${rates['quebec']}, Canada=${rates['canada']}, Intl=${rates['international']}")
    
    def test_checkout_with_valid_product(self, api_client):
        """POST /api/shop/checkout creates Stripe session"""
        # First get an existing product
        products_response = api_client.get(f"{BASE_URL}/api/products")
        assert products_response.status_code == 200
        products = products_response.json()
        
        if len(products) == 0:
            pytest.skip("No products available for checkout test")
        
        product = products[0]
        product_id = product["id"]
        product_name = product["name"]
        product_price = product["price"]
        product_size = product.get("sizes", ["M"])[0] if product.get("sizes") else "M"
        
        checkout_payload = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "514-555-1234",
            "items": [
                {
                    "product_id": product_id,
                    "name": product_name,
                    "price": product_price,
                    "size": product_size,
                    "quantity": 1
                }
            ],
            "shipping_address": {
                "street": "123 Test Street",
                "city": "Montreal",
                "province": "QC",
                "country": "Canada",
                "postal_code": "H2X 1Y4"
            },
            "order_notes": "Test order",
            "origin_url": "https://tc-pro-classes.preview.emergentagent.com"
        }
        
        response = api_client.post(f"{BASE_URL}/api/shop/checkout", json=checkout_payload)
        assert response.status_code == 200, f"Checkout failed: {response.text}"
        
        data = response.json()
        assert "checkout_url" in data
        assert "session_id" in data
        assert "order_id" in data
        assert data["checkout_url"].startswith("https://checkout.stripe.com")
        print(f"✓ Checkout created Stripe session: {data['session_id'][:20]}...")
    
    def test_checkout_with_invalid_product(self, api_client):
        """POST /api/shop/checkout with invalid product returns 400"""
        checkout_payload = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "514-555-1234",
            "items": [
                {
                    "product_id": "invalid-product-id-12345",
                    "name": "Invalid Product",
                    "price": 10.00,
                    "size": "M",
                    "quantity": 1
                }
            ],
            "shipping_address": {
                "street": "123 Test Street",
                "city": "Montreal",
                "province": "QC",
                "country": "Canada",
                "postal_code": "H2X 1Y4"
            },
            "order_notes": "",
            "origin_url": "https://tc-pro-classes.preview.emergentagent.com"
        }
        
        response = api_client.post(f"{BASE_URL}/api/shop/checkout", json=checkout_payload)
        assert response.status_code == 400
        print(f"✓ Invalid product correctly rejected with 400")


# ==================== SITE SETTINGS TESTS ====================

class TestSiteSettings:
    """Site settings endpoint tests"""
    
    def test_get_site_settings(self, api_client):
        """GET /api/site-settings returns settings as key-value dict"""
        response = api_client.get(f"{BASE_URL}/api/site-settings")
        assert response.status_code == 200
        data = response.json()
        # Site settings returns a dict (key-value pairs), not a list
        assert isinstance(data, dict)
        print(f"✓ GET /api/site-settings returned {len(data)} settings")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
