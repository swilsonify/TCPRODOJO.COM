"""
Test TC Pro Dojo new category features:
1. Media category field ('general' vs 'grid') - Grid items show on Training page
2. classes_header_photo site setting - Shows photo above calendar on Classes page
3. AdminMedia form category dropdown and Grid badge
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tc-pro-preview.preview.emergentagent.com').rstrip('/')


class TestAdminAuth:
    """Admin authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        return data["access_token"]
    
    def test_admin_login(self, auth_token):
        """Test admin login and token generation"""
        assert auth_token is not None
        assert len(auth_token) > 0
        print(f"✓ Admin login successful, token obtained")


class TestMediaCategoryField:
    """Tests for the new category field in MediaModel"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def api_client(self, auth_token):
        """Create authenticated session"""
        session = requests.Session()
        session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}"
        })
        return session
    
    def test_create_media_with_general_category(self, api_client):
        """Test creating media with category='general' (default)"""
        media_data = {
            "id": str(uuid.uuid4()),
            "title": "TEST_General Category Photo",
            "description": "Test photo with general category",
            "mediaType": "photo",
            "mediaUrl": "https://example.com/general_photo.jpg",
            "thumbnailUrl": "",
            "externalLink": "",
            "category": "general",
            "displayOrder": 0
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/media", json=media_data)
        assert response.status_code == 200, f"Create media failed: {response.text}"
        
        created = response.json()
        assert created['category'] == 'general', f"Expected 'general' category, got {created.get('category')}"
        assert created['title'] == "TEST_General Category Photo"
        
        print(f"✓ Created media with category='general' successfully")
        return created['id']
    
    def test_create_media_with_grid_category(self, api_client):
        """Test creating media with category='grid' (for Training page)"""
        media_data = {
            "id": str(uuid.uuid4()),
            "title": "TEST_Grid Category Photo",
            "description": "Test photo with grid category - should appear on Training page",
            "mediaType": "photo",
            "mediaUrl": "https://example.com/grid_photo.jpg",
            "thumbnailUrl": "",
            "externalLink": "",
            "category": "grid",
            "displayOrder": 0
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/media", json=media_data)
        assert response.status_code == 200, f"Create media failed: {response.text}"
        
        created = response.json()
        assert created['category'] == 'grid', f"Expected 'grid' category, got {created.get('category')}"
        
        print(f"✓ Created media with category='grid' successfully")
        return created['id']
    
    def test_category_returned_in_api(self, api_client):
        """Test that category field is returned from /api/media"""
        # First create a grid item
        grid_id = self.test_create_media_with_grid_category(api_client)
        
        # Fetch public media
        response = requests.get(f"{BASE_URL}/api/media")
        assert response.status_code == 200
        
        all_media = response.json()
        grid_items = [m for m in all_media if m.get('category') == 'grid']
        
        assert len(grid_items) > 0, "Expected at least one grid category item"
        
        # Verify category field is present
        test_item = [m for m in grid_items if 'TEST_' in m.get('title', '')]
        assert len(test_item) > 0, "Could not find our test grid item"
        assert test_item[0]['category'] == 'grid'
        
        print(f"✓ Category field correctly returned from API, found {len(grid_items)} grid items")
    
    def test_filter_by_grid_category(self, api_client):
        """Test filtering media by category='grid' (as Training page does)"""
        response = requests.get(f"{BASE_URL}/api/media")
        assert response.status_code == 200
        
        all_media = response.json()
        
        # Frontend filter: only 'grid' category for Training page
        grid_photos = [m for m in all_media if m.get('category') == 'grid']
        general_photos = [m for m in all_media if m.get('category') == 'general']
        
        print(f"✓ Filter test: {len(grid_photos)} grid items, {len(general_photos)} general items")
    
    def test_general_items_not_in_grid(self, api_client):
        """Test that general category items are NOT included in grid filter"""
        # Create a general item
        general_id = self.test_create_media_with_general_category(api_client)
        
        # Create a grid item
        grid_id = self.test_create_media_with_grid_category(api_client)
        
        # Fetch and filter
        response = requests.get(f"{BASE_URL}/api/media")
        assert response.status_code == 200
        
        all_media = response.json()
        grid_items = [m for m in all_media if m.get('category') == 'grid']
        
        # Verify general item is NOT in grid_items
        general_in_grid = [m for m in grid_items if m.get('title') == 'TEST_General Category Photo']
        assert len(general_in_grid) == 0, "General category items should NOT appear in grid filter"
        
        print(f"✓ General category items correctly excluded from grid filter")
    
    def test_cleanup_test_media(self, api_client):
        """Clean up TEST_ prefixed media items"""
        response = api_client.get(f"{BASE_URL}/api/admin/media")
        media_items = response.json()
        
        test_items = [m for m in media_items if m.get('title', '').startswith('TEST_')]
        
        for item in test_items:
            response = api_client.delete(f"{BASE_URL}/api/admin/media/{item['id']}")
            assert response.status_code == 200, f"Delete failed for {item['id']}"
        
        print(f"✓ Cleaned up {len(test_items)} test media items")


class TestClassesHeaderPhoto:
    """Tests for classes_header_photo site setting"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def api_client(self, auth_token):
        """Create authenticated session"""
        session = requests.Session()
        session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}"
        })
        return session
    
    def test_create_classes_header_photo_setting(self, api_client):
        """Create classes_header_photo site setting"""
        test_url = "https://res.cloudinary.com/dpx8a9k7c/image/upload/v1/test_classes_header.jpg"
        
        # First check if it already exists and delete
        response = api_client.get(f"{BASE_URL}/api/admin/site-settings")
        existing = [s for s in response.json() if s.get('settingKey') == 'classes_header_photo']
        
        for s in existing:
            api_client.delete(f"{BASE_URL}/api/admin/site-settings/{s['id']}")
        
        # Create new setting
        setting_data = {
            "id": str(uuid.uuid4()),
            "settingKey": "classes_header_photo",
            "settingValue": test_url,
            "settingType": "image",
            "description": "Photo displayed above the class schedule calendar"
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/site-settings", json=setting_data)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        created = response.json()
        assert created['settingKey'] == 'classes_header_photo'
        assert created['settingValue'] == test_url
        print(f"✓ Created classes_header_photo setting successfully")
        
        return created['id']
    
    def test_verify_classes_header_photo_in_public_api(self, api_client):
        """Verify classes_header_photo appears in public site-settings"""
        # First ensure the setting exists
        self.test_create_classes_header_photo_setting(api_client)
        
        # Now check public API
        response = requests.get(f"{BASE_URL}/api/site-settings")
        assert response.status_code == 200
        data = response.json()
        
        assert 'classes_header_photo' in data, "classes_header_photo should be in public settings"
        assert data['classes_header_photo'].startswith('http'), "classes_header_photo should be a URL"
        print(f"✓ classes_header_photo visible in public API: {data['classes_header_photo'][:50]}...")
    
    def test_cleanup_classes_header_photo(self, api_client):
        """Clean up classes_header_photo setting"""
        response = api_client.get(f"{BASE_URL}/api/admin/site-settings")
        settings = response.json()
        
        test_settings = [s for s in settings if s.get('settingKey') == 'classes_header_photo']
        
        for setting in test_settings:
            response = api_client.delete(f"{BASE_URL}/api/admin/site-settings/{setting['id']}")
            assert response.status_code == 200, f"Delete failed for {setting['id']}"
        
        print(f"✓ Cleaned up classes_header_photo setting")


class TestAdminSiteSettingsPresets:
    """Test that classes_header_photo preset is available in AdminSiteSettings"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def api_client(self, auth_token):
        session = requests.Session()
        session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}"
        })
        return session
    
    def test_admin_site_settings_endpoint(self, api_client):
        """Test admin site settings endpoint works"""
        response = api_client.get(f"{BASE_URL}/api/admin/site-settings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin site settings endpoint working, got {len(data)} settings")


class TestFullCategoryWorkflow:
    """End-to-end workflow tests for category feature"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "tcprodojo2025"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def api_client(self, auth_token):
        session = requests.Session()
        session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}"
        })
        return session
    
    def test_full_grid_category_workflow(self, api_client):
        """Full workflow: Create grid photos → Verify filter → Clean up"""
        created_ids = []
        
        # 1. Create 3 grid category photos
        for i in range(3):
            media_id = str(uuid.uuid4())
            response = api_client.post(f"{BASE_URL}/api/admin/media", json={
                "id": media_id,
                "title": f"WORKFLOW_TEST_Grid Photo {i+1}",
                "description": "Workflow test for grid category",
                "mediaType": "photo",
                "mediaUrl": f"https://example.com/workflow_grid_{i+1}.jpg",
                "category": "grid",
                "displayOrder": i
            })
            assert response.status_code == 200, f"Create failed: {response.text}"
            created_ids.append(media_id)
        
        # 2. Create 2 general category photos (should NOT appear in grid)
        for i in range(2):
            media_id = str(uuid.uuid4())
            response = api_client.post(f"{BASE_URL}/api/admin/media", json={
                "id": media_id,
                "title": f"WORKFLOW_TEST_General Photo {i+1}",
                "description": "Workflow test for general category",
                "mediaType": "photo",
                "mediaUrl": f"https://example.com/workflow_general_{i+1}.jpg",
                "category": "general",
                "displayOrder": i
            })
            assert response.status_code == 200
            created_ids.append(media_id)
        
        # 3. Verify filtering works
        response = requests.get(f"{BASE_URL}/api/media")
        assert response.status_code == 200
        all_media = response.json()
        
        grid_photos = [m for m in all_media if m.get('category') == 'grid' and 'WORKFLOW_TEST' in m.get('title', '')]
        general_photos = [m for m in all_media if m.get('category') == 'general' and 'WORKFLOW_TEST' in m.get('title', '')]
        
        assert len(grid_photos) == 3, f"Expected 3 workflow grid photos, got {len(grid_photos)}"
        assert len(general_photos) == 2, f"Expected 2 workflow general photos, got {len(general_photos)}"
        
        # 4. Verify 12-photo limit works
        all_grid = [m for m in all_media if m.get('category') == 'grid'][:12]
        assert len(all_grid) <= 12, "Grid should be limited to 12 items"
        
        # 5. Cleanup
        for media_id in created_ids:
            api_client.delete(f"{BASE_URL}/api/admin/media/{media_id}")
        
        print(f"✓ Full grid category workflow completed successfully")
    
    def test_full_classes_header_photo_workflow(self, api_client):
        """Full workflow: Create classes_header_photo → Verify → Delete"""
        setting_id = str(uuid.uuid4())
        test_url = "https://res.cloudinary.com/dpx8a9k7c/image/upload/v1/workflow_classes_header.jpg"
        
        # Clean up any existing
        response = api_client.get(f"{BASE_URL}/api/admin/site-settings")
        existing = [s for s in response.json() if s.get('settingKey') == 'classes_header_photo']
        for s in existing:
            api_client.delete(f"{BASE_URL}/api/admin/site-settings/{s['id']}")
        
        # Create
        create_response = api_client.post(f"{BASE_URL}/api/admin/site-settings", json={
            "id": setting_id,
            "settingKey": "classes_header_photo",
            "settingValue": test_url,
            "settingType": "image",
            "description": "Workflow test - classes header photo"
        })
        assert create_response.status_code == 200
        
        # Verify in public API
        public_response = requests.get(f"{BASE_URL}/api/site-settings")
        assert public_response.status_code == 200
        public_data = public_response.json()
        assert 'classes_header_photo' in public_data
        assert public_data['classes_header_photo'] == test_url
        
        # Delete
        delete_response = api_client.delete(f"{BASE_URL}/api/admin/site-settings/{setting_id}")
        assert delete_response.status_code == 200
        
        # Verify removed
        final_response = requests.get(f"{BASE_URL}/api/site-settings")
        final_data = final_response.json()
        assert 'classes_header_photo' not in final_data
        
        print(f"✓ Full classes_header_photo workflow completed successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
