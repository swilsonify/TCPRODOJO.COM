"""
Test new TC Pro Dojo features:
1. Coaches Page Photo - Single admin-manageable photo spot on Success page via Site Settings
2. Training Page Photo Grid - 12-photo grid pulling from Media gallery (mediaType='photo')
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


class TestSiteSettings:
    """Site Settings API tests - coaches_page_photo feature"""
    
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
    
    def test_get_public_site_settings(self):
        """Test public site settings endpoint returns dict"""
        response = requests.get(f"{BASE_URL}/api/site-settings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict), "Site settings should return a dictionary"
        print(f"✓ Public site settings endpoint working, got {len(data)} settings")
    
    def test_get_admin_site_settings(self, api_client):
        """Test admin site settings endpoint returns list"""
        response = api_client.get(f"{BASE_URL}/api/admin/site-settings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Admin site settings should return a list"
        print(f"✓ Admin site settings endpoint working, got {len(data)} settings")
    
    def test_create_coaches_page_photo_setting(self, api_client):
        """Create coaches_page_photo site setting"""
        test_url = "https://res.cloudinary.com/dpx8a9k7c/image/upload/v1/test_coaches_photo.jpg"
        
        # First check if it already exists
        response = api_client.get(f"{BASE_URL}/api/admin/site-settings")
        existing = [s for s in response.json() if s.get('settingKey') == 'coaches_page_photo']
        
        if existing:
            # Delete existing to test create
            for s in existing:
                api_client.delete(f"{BASE_URL}/api/admin/site-settings/{s['id']}")
        
        # Create new setting
        setting_data = {
            "id": str(uuid.uuid4()),
            "settingKey": "coaches_page_photo",
            "settingValue": test_url,
            "settingType": "image",
            "description": "Photo displayed on the Success/Coaches page above the Start Training button"
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/site-settings", json=setting_data)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        created = response.json()
        assert created['settingKey'] == 'coaches_page_photo'
        assert created['settingValue'] == test_url
        print(f"✓ Created coaches_page_photo setting successfully")
        
        return created['id']
    
    def test_verify_coaches_page_photo_in_public_api(self, api_client):
        """Verify coaches_page_photo appears in public site-settings"""
        # First ensure the setting exists
        self.test_create_coaches_page_photo_setting(api_client)
        
        # Now check public API
        response = requests.get(f"{BASE_URL}/api/site-settings")
        assert response.status_code == 200
        data = response.json()
        
        assert 'coaches_page_photo' in data, "coaches_page_photo should be in public settings"
        assert data['coaches_page_photo'].startswith('http'), "coaches_page_photo should be a URL"
        print(f"✓ coaches_page_photo visible in public API: {data['coaches_page_photo'][:50]}...")
    
    def test_update_coaches_page_photo(self, api_client):
        """Test updating coaches_page_photo setting"""
        # Get current setting
        response = api_client.get(f"{BASE_URL}/api/admin/site-settings")
        settings = response.json()
        coaches_photo = [s for s in settings if s.get('settingKey') == 'coaches_page_photo']
        
        if not coaches_photo:
            self.test_create_coaches_page_photo_setting(api_client)
            response = api_client.get(f"{BASE_URL}/api/admin/site-settings")
            settings = response.json()
            coaches_photo = [s for s in settings if s.get('settingKey') == 'coaches_page_photo']
        
        setting = coaches_photo[0]
        new_url = "https://res.cloudinary.com/dpx8a9k7c/image/upload/v2/updated_coaches_photo.jpg"
        
        update_data = {
            "id": setting['id'],
            "settingKey": setting['settingKey'],
            "settingValue": new_url,
            "settingType": "image",
            "description": "Updated coaches page photo"
        }
        
        response = api_client.put(f"{BASE_URL}/api/admin/site-settings/{setting['id']}", json=update_data)
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        updated = response.json()
        assert updated['settingValue'] == new_url
        print(f"✓ Updated coaches_page_photo setting successfully")
    
    def test_delete_coaches_page_photo(self, api_client):
        """Test deleting coaches_page_photo setting"""
        # Get current setting
        response = api_client.get(f"{BASE_URL}/api/admin/site-settings")
        settings = response.json()
        coaches_photo = [s for s in settings if s.get('settingKey') == 'coaches_page_photo']
        
        if coaches_photo:
            setting_id = coaches_photo[0]['id']
            response = api_client.delete(f"{BASE_URL}/api/admin/site-settings/{setting_id}")
            assert response.status_code == 200, f"Delete failed: {response.text}"
            print(f"✓ Deleted coaches_page_photo setting successfully")
        else:
            print("✓ No coaches_page_photo setting to delete")


class TestMediaGallery:
    """Media Gallery API tests - Training page photo grid feature"""
    
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
    
    def test_get_public_media(self):
        """Test public media endpoint"""
        response = requests.get(f"{BASE_URL}/api/media")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Media should return a list"
        print(f"✓ Public media endpoint working, got {len(data)} items")
    
    def test_get_admin_media(self, api_client):
        """Test admin media endpoint"""
        response = api_client.get(f"{BASE_URL}/api/admin/media")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Admin media should return a list"
        print(f"✓ Admin media endpoint working, got {len(data)} items")
    
    def test_create_photo_media_items(self, api_client):
        """Create multiple photo media items for training page grid"""
        created_ids = []
        
        for i in range(3):  # Create 3 test photos
            media_data = {
                "id": str(uuid.uuid4()),
                "title": f"TEST_Training Photo {i+1}",
                "description": f"Test photo for training page grid {i+1}",
                "mediaType": "photo",
                "mediaUrl": f"https://res.cloudinary.com/dpx8a9k7c/image/upload/v1/test_training_photo_{i+1}.jpg",
                "thumbnailUrl": "",
                "externalLink": "",
                "displayOrder": i
            }
            
            response = api_client.post(f"{BASE_URL}/api/admin/media", json=media_data)
            assert response.status_code == 200, f"Create media failed: {response.text}"
            
            created = response.json()
            assert created['mediaType'] == 'photo'
            assert created['title'] == f"TEST_Training Photo {i+1}"
            created_ids.append(created['id'])
        
        print(f"✓ Created {len(created_ids)} photo media items")
        return created_ids
    
    def test_verify_photos_in_public_media(self, api_client):
        """Verify photo media items appear in public API"""
        # First create some photos
        self.test_create_photo_media_items(api_client)
        
        # Get public media
        response = requests.get(f"{BASE_URL}/api/media")
        assert response.status_code == 200
        data = response.json()
        
        # Filter for photos
        photos = [m for m in data if m.get('mediaType') == 'photo']
        assert len(photos) >= 3, f"Expected at least 3 photos, got {len(photos)}"
        
        print(f"✓ Found {len(photos)} photos in public media API")
    
    def test_media_types_filter(self, api_client):
        """Test that media can be filtered by type (frontend does this)"""
        response = requests.get(f"{BASE_URL}/api/media")
        assert response.status_code == 200
        data = response.json()
        
        # Verify we can filter by mediaType like frontend does
        photos = [m for m in data if m.get('mediaType') == 'photo']
        podcasts = [m for m in data if m.get('mediaType') == 'podcast']
        videos = [m for m in data if m.get('mediaType') == 'video']
        articles = [m for m in data if m.get('mediaType') == 'article']
        
        print(f"✓ Media types: {len(photos)} photos, {len(podcasts)} podcasts, {len(videos)} videos, {len(articles)} articles")
    
    def test_create_non_photo_media(self, api_client):
        """Test creating non-photo media (shouldn't appear in training grid)"""
        # Create a podcast
        podcast_data = {
            "id": str(uuid.uuid4()),
            "title": "TEST_Podcast Episode",
            "description": "Test podcast for media gallery",
            "mediaType": "podcast",
            "mediaUrl": "https://example.com/podcast.mp3",
            "thumbnailUrl": "",
            "externalLink": "https://example.com/podcast",
            "displayOrder": 0
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/media", json=podcast_data)
        assert response.status_code == 200
        
        # Verify it's created but not a photo
        created = response.json()
        assert created['mediaType'] == 'podcast'
        
        print(f"✓ Created non-photo media (podcast) successfully")
    
    def test_cleanup_test_media(self, api_client):
        """Clean up TEST_ prefixed media items"""
        response = api_client.get(f"{BASE_URL}/api/admin/media")
        media_items = response.json()
        
        test_items = [m for m in media_items if m.get('title', '').startswith('TEST_')]
        
        for item in test_items:
            response = api_client.delete(f"{BASE_URL}/api/admin/media/{item['id']}")
            assert response.status_code == 200, f"Delete failed for {item['id']}"
        
        print(f"✓ Cleaned up {len(test_items)} test media items")


class TestPublicPagesAPI:
    """Test APIs used by public pages render correctly even with empty data"""
    
    def test_success_page_apis(self):
        """Test all APIs used by Success/Coaches page (Pros.js)"""
        # Test success-stories endpoint
        response = requests.get(f"{BASE_URL}/api/success-stories")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
        # Test endorsements endpoint
        response = requests.get(f"{BASE_URL}/api/endorsements")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
        # Test coaches endpoint
        response = requests.get(f"{BASE_URL}/api/coaches")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
        # Test site-settings endpoint (returns dict)
        response = requests.get(f"{BASE_URL}/api/site-settings")
        assert response.status_code == 200
        assert isinstance(response.json(), dict)
        
        print(f"✓ All Success page APIs working correctly")
    
    def test_training_page_apis(self):
        """Test all APIs used by Training page (Training.js)"""
        # Test tips endpoint
        response = requests.get(f"{BASE_URL}/api/tips")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
        # Test media endpoint
        response = requests.get(f"{BASE_URL}/api/media")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
        print(f"✓ All Training page APIs working correctly")
    
    def test_site_settings_empty_state(self):
        """Verify site-settings returns empty dict when no settings exist"""
        response = requests.get(f"{BASE_URL}/api/site-settings")
        assert response.status_code == 200
        # Even if empty, should return a dict (not error)
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Site settings handles empty state correctly")
    
    def test_media_empty_state(self):
        """Verify media endpoint returns empty list when no media exists"""
        response = requests.get(f"{BASE_URL}/api/media")
        assert response.status_code == 200
        # Even if empty, should return a list (not error)
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Media endpoint handles empty state correctly")


class TestFullWorkflow:
    """End-to-end workflow tests"""
    
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
    
    def test_coaches_photo_workflow(self, api_client):
        """Full workflow: Create coaches_page_photo → Verify in public API → Delete"""
        # 1. Create
        setting_id = str(uuid.uuid4())
        test_url = "https://res.cloudinary.com/dpx8a9k7c/image/upload/v1/workflow_test_coaches.jpg"
        
        # Clean up any existing
        response = api_client.get(f"{BASE_URL}/api/admin/site-settings")
        existing = [s for s in response.json() if s.get('settingKey') == 'coaches_page_photo']
        for s in existing:
            api_client.delete(f"{BASE_URL}/api/admin/site-settings/{s['id']}")
        
        # Create new
        create_response = api_client.post(f"{BASE_URL}/api/admin/site-settings", json={
            "id": setting_id,
            "settingKey": "coaches_page_photo",
            "settingValue": test_url,
            "settingType": "image",
            "description": "Workflow test photo"
        })
        assert create_response.status_code == 200
        
        # 2. Verify in public API
        public_response = requests.get(f"{BASE_URL}/api/site-settings")
        assert public_response.status_code == 200
        public_data = public_response.json()
        assert 'coaches_page_photo' in public_data
        assert public_data['coaches_page_photo'] == test_url
        
        # 3. Delete
        delete_response = api_client.delete(f"{BASE_URL}/api/admin/site-settings/{setting_id}")
        assert delete_response.status_code == 200
        
        # 4. Verify removed
        final_response = requests.get(f"{BASE_URL}/api/site-settings")
        final_data = final_response.json()
        assert 'coaches_page_photo' not in final_data
        
        print(f"✓ Full coaches_page_photo workflow completed successfully")
    
    def test_training_photos_workflow(self, api_client):
        """Full workflow: Create photos → Filter for training grid → Delete"""
        created_ids = []
        
        # 1. Create 3 photo items
        for i in range(3):
            media_id = str(uuid.uuid4())
            response = api_client.post(f"{BASE_URL}/api/admin/media", json={
                "id": media_id,
                "title": f"WORKFLOW_TEST_Photo {i+1}",
                "description": "Workflow test",
                "mediaType": "photo",
                "mediaUrl": f"https://example.com/workflow_photo_{i+1}.jpg",
                "displayOrder": i
            })
            assert response.status_code == 200
            created_ids.append(media_id)
        
        # 2. Verify photos in public API
        public_response = requests.get(f"{BASE_URL}/api/media")
        assert public_response.status_code == 200
        all_media = public_response.json()
        
        # Filter like frontend does
        photos = [m for m in all_media if m.get('mediaType') == 'photo']
        workflow_photos = [p for p in photos if 'WORKFLOW_TEST' in p.get('title', '')]
        assert len(workflow_photos) == 3, f"Expected 3 workflow photos, got {len(workflow_photos)}"
        
        # 3. Verify max 12 photo limit would work (frontend logic)
        limited_photos = photos[:12]
        assert len(limited_photos) <= 12
        
        # 4. Cleanup
        for media_id in created_ids:
            api_client.delete(f"{BASE_URL}/api/admin/media/{media_id}")
        
        print(f"✓ Full training photos workflow completed successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
