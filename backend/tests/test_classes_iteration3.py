"""
Test suite for TC Pro Dojo Classes functionality - Iteration 3
Tests: Multi-day schedule, class cancel/reschedule, email preview
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestClassesAPI:
    """Test class schedule API endpoints"""
    
    def test_get_classes(self):
        """Test GET /api/classes returns classes with schedule array"""
        response = requests.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        classes = response.json()
        assert isinstance(classes, list)
        
        # Check that classes have schedule field
        for cls in classes:
            assert "id" in cls
            assert "title" in cls
            # Schedule field should exist (may be empty for legacy classes)
            # But new multi-day classes should have schedule array
            
        print(f"✓ GET /api/classes returned {len(classes)} classes")
        return classes
    
    def test_multi_day_classes_have_schedule(self):
        """Verify multi-day classes have proper schedule array"""
        response = requests.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        classes = response.json()
        
        # Find classes with multi-day schedule
        multi_day = [c for c in classes if c.get('schedule') and len(c.get('schedule', [])) > 1]
        print(f"Found {len(multi_day)} multi-day classes")
        
        for cls in multi_day:
            print(f"  - {cls['title']}: {len(cls['schedule'])} days")
            for entry in cls['schedule']:
                assert 'day' in entry, f"Schedule entry missing 'day' for {cls['title']}"
                assert 'time' in entry, f"Schedule entry missing 'time' for {cls['title']}"
                print(f"    * {entry['day']} @ {entry['time']}")
        
        # Verify specific expected classes
        class_names = [c['title'] for c in classes]
        assert any('Beginner Pro Wrestling' in n for n in class_names), "Beginner Pro Wrestling class not found"
        
    def test_cancelled_classes_endpoint(self):
        """Test GET /api/classes/cancelled returns cancelled class instances"""
        response = requests.get(f"{BASE_URL}/api/classes/cancelled")
        assert response.status_code == 200
        cancelled = response.json()
        assert isinstance(cancelled, list)
        print(f"✓ GET /api/classes/cancelled returned {len(cancelled)} cancelled instances")


class TestAdminAuth:
    """Test admin authentication"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        token = response.json().get("access_token")
        assert token, "No access token returned"
        return token
    
    def test_admin_login(self):
        """Test admin login works"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        print("✓ Admin login successful")
        return data["access_token"]


class TestCancelClassEndpoint:
    """Test class cancel/reschedule functionality"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    @pytest.fixture
    def test_class_id(self):
        """Get a class ID for testing"""
        response = requests.get(f"{BASE_URL}/api/classes")
        classes = response.json()
        if classes:
            return classes[0]['id']
        return None
    
    def test_cancel_class_instance(self, admin_token, test_class_id):
        """Test POST /api/admin/classes/cancel works"""
        if not test_class_id:
            pytest.skip("No classes available for testing")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Cancel a class instance
        cancel_data = {
            "class_id": test_class_id,
            "cancelled_date": "2026-03-10",
            "status": "cancelled",
            "reason": "TEST_CANCELLATION - Testing cancel endpoint"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/classes/cancel",
            json=cancel_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Cancel failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["class_id"] == test_class_id
        assert data["status"] == "cancelled"
        print(f"✓ Class instance cancelled: {data['id']}")
        
        # Clean up - delete the cancellation
        cancel_id = data["id"]
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/classes/cancel/{cancel_id}",
            headers=headers
        )
        assert delete_response.status_code == 200
        print(f"✓ Cancellation cleaned up")
    
    def test_reschedule_class_instance(self, admin_token, test_class_id):
        """Test rescheduling a class instance"""
        if not test_class_id:
            pytest.skip("No classes available for testing")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Reschedule a class instance
        reschedule_data = {
            "class_id": test_class_id,
            "cancelled_date": "2026-03-11",
            "status": "rescheduled",
            "rescheduled_time": "8:00 PM - 10:00 PM",
            "reason": "TEST_RESCHEDULE - Testing reschedule endpoint"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/classes/cancel",
            json=reschedule_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Reschedule failed: {response.text}"
        data = response.json()
        assert data["status"] == "rescheduled"
        assert data["rescheduled_time"] == "8:00 PM - 10:00 PM"
        print(f"✓ Class instance rescheduled: {data['id']}")
        
        # Clean up
        cancel_id = data["id"]
        requests.delete(f"{BASE_URL}/api/admin/classes/cancel/{cancel_id}", headers=headers)
        print(f"✓ Reschedule cleaned up")


class TestEmailPreviewEndpoint:
    """Test email preview functionality"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        return response.json().get("access_token")
    
    @pytest.fixture
    def test_class_id(self):
        """Get a class ID for testing"""
        response = requests.get(f"{BASE_URL}/api/classes")
        classes = response.json()
        if classes:
            return classes[0]['id']
        return ""
    
    def test_email_preview_cancelled(self, admin_token, test_class_id):
        """Test email preview for cancelled class"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        preview_data = {
            "class_id": test_class_id,
            "status": "cancelled",
            "date": "Monday, March 10, 2026",
            "reason": "Coach unavailable"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/classes/email-preview",
            json=preview_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Email preview failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "html" in data, "Response missing 'html' field"
        assert "student_count" in data, "Response missing 'student_count' field"
        assert "subject" in data, "Response missing 'subject' field"
        
        # Verify HTML contains key elements
        html = data["html"]
        assert "TC PRO DOJO" in html, "Email missing TC PRO DOJO branding"
        assert "CANCELLED" in html, "Email missing CANCELLED label"
        assert "Coach unavailable" in html, "Email missing reason"
        
        print(f"✓ Cancellation email preview generated")
        print(f"  - Subject: {data['subject']}")
        print(f"  - Student count: {data['student_count']}")
    
    def test_email_preview_rescheduled(self, admin_token, test_class_id):
        """Test email preview for rescheduled class"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        preview_data = {
            "class_id": test_class_id,
            "status": "rescheduled",
            "date": "Wednesday, March 12, 2026",
            "reason": "Venue change",
            "rescheduled_time": "8:00 PM - 10:00 PM"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/classes/email-preview",
            json=preview_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Email preview failed: {response.text}"
        data = response.json()
        
        # Verify HTML contains rescheduled elements
        html = data["html"]
        assert "RESCHEDULED" in html, "Email missing RESCHEDULED label"
        assert "8:00 PM - 10:00 PM" in html, "Email missing new time"
        assert "Venue change" in html, "Email missing reason"
        
        print(f"✓ Reschedule email preview generated")
        print(f"  - Subject: {data['subject']}")


class TestAdminClassSchedulePage:
    """Test admin class schedule management"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        return response.json().get("access_token")
    
    def test_get_admin_classes(self, admin_token):
        """Test GET /api/admin/classes returns classes"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/classes", headers=headers)
        
        assert response.status_code == 200
        classes = response.json()
        assert isinstance(classes, list)
        print(f"✓ GET /api/admin/classes returned {len(classes)} classes")
    
    def test_get_cancelled_classes(self, admin_token):
        """Test GET /api/admin/classes/cancelled"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/classes/cancelled", headers=headers)
        
        assert response.status_code == 200
        cancelled = response.json()
        assert isinstance(cancelled, list)
        print(f"✓ GET /api/admin/classes/cancelled returned {len(cancelled)} cancelled instances")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
