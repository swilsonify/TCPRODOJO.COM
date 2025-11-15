#!/usr/bin/env python3
"""
Backend API Testing for TC Pro Dojo Gallery Management
Tests all Gallery Management API endpoints with proper authentication
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://wrestling-dojo.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test credentials
ADMIN_USERNAME = "elizabeth"
ADMIN_PASSWORD = "Kitch3n3r22"

class GalleryAPITester:
    def __init__(self):
        self.access_token: Optional[str] = None
        self.created_item_id: Optional[str] = None
        self.test_results = []
        
    def log_test(self, test_name: str, status: str, details: str = ""):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "details": details
        }
        self.test_results.append(result)
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers"""
        if not self.access_token:
            raise Exception("No access token available")
        return {"Authorization": f"Bearer {self.access_token}"}
    
    def test_admin_login(self) -> bool:
        """Test 1: Admin Login"""
        try:
            url = f"{API_BASE}/admin/login"
            payload = {
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    if data["token_type"] == "bearer":
                        self.access_token = data["access_token"]
                        self.log_test("Admin Login", "✅ PASSED", f"Token received successfully")
                        return True
                    else:
                        self.log_test("Admin Login", "❌ FAILED", f"Invalid token type: {data['token_type']}")
                        return False
                else:
                    self.log_test("Admin Login", "❌ FAILED", f"Missing token fields in response: {data}")
                    return False
            else:
                self.log_test("Admin Login", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_create_gallery_item(self) -> bool:
        """Test 2: Create Gallery Item"""
        try:
            url = f"{API_BASE}/admin/gallery"
            payload = {
                "title": "Test Hero Image",
                "section": "home-hero",
                "type": "image",
                "url": "https://i.imgur.com/test.jpg",
                "description": "Test description",
                "displayOrder": 1
            }
            
            response = requests.post(url, json=payload, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.created_item_id = data["id"]
                    # Verify all fields are present
                    required_fields = ["id", "title", "section", "type", "url", "description", "displayOrder"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_test("Create Gallery Item", "✅ PASSED", f"Item created with ID: {self.created_item_id}")
                        return True
                    else:
                        self.log_test("Create Gallery Item", "❌ FAILED", f"Missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Create Gallery Item", "❌ FAILED", f"No ID in response: {data}")
                    return False
            else:
                self.log_test("Create Gallery Item", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Gallery Item", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_list_gallery_items(self) -> bool:
        """Test 3: List Gallery Items"""
        try:
            url = f"{API_BASE}/admin/gallery"
            
            response = requests.get(url, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Find our created item
                    created_item = None
                    for item in data:
                        if item.get("id") == self.created_item_id:
                            created_item = item
                            break
                    
                    if created_item:
                        # Verify all fields are present
                        required_fields = ["id", "title", "section", "type", "url", "description", "displayOrder"]
                        missing_fields = [field for field in required_fields if field not in created_item]
                        
                        if not missing_fields:
                            self.log_test("List Gallery Items", "✅ PASSED", f"Found created item with all fields")
                            return True
                        else:
                            self.log_test("List Gallery Items", "❌ FAILED", f"Created item missing fields: {missing_fields}")
                            return False
                    else:
                        self.log_test("List Gallery Items", "❌ FAILED", f"Created item not found in list")
                        return False
                else:
                    self.log_test("List Gallery Items", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("List Gallery Items", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("List Gallery Items", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_update_gallery_item(self) -> bool:
        """Test 4: Update Gallery Item"""
        try:
            if not self.created_item_id:
                self.log_test("Update Gallery Item", "❌ FAILED", "No item ID available for update")
                return False
                
            url = f"{API_BASE}/admin/gallery/{self.created_item_id}"
            payload = {
                "id": self.created_item_id,
                "title": "Updated Hero Image",
                "section": "home-hero",
                "type": "image",
                "url": "https://i.imgur.com/updated.jpg",
                "description": "Updated description",
                "displayOrder": 2
            }
            
            response = requests.put(url, json=payload, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("title") == "Updated Hero Image" and data.get("displayOrder") == 2:
                    self.log_test("Update Gallery Item", "✅ PASSED", f"Item updated successfully")
                    return True
                else:
                    self.log_test("Update Gallery Item", "❌ FAILED", f"Update not reflected in response: {data}")
                    return False
            else:
                self.log_test("Update Gallery Item", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Update Gallery Item", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_verify_update(self) -> bool:
        """Test 5: Verify Update"""
        try:
            url = f"{API_BASE}/admin/gallery"
            
            response = requests.get(url, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Find our updated item
                    updated_item = None
                    for item in data:
                        if item.get("id") == self.created_item_id:
                            updated_item = item
                            break
                    
                    if updated_item:
                        if (updated_item.get("title") == "Updated Hero Image" and 
                            updated_item.get("displayOrder") == 2):
                            self.log_test("Verify Update", "✅ PASSED", f"Update verified in list")
                            return True
                        else:
                            self.log_test("Verify Update", "❌ FAILED", f"Update not reflected: title={updated_item.get('title')}, displayOrder={updated_item.get('displayOrder')}")
                            return False
                    else:
                        self.log_test("Verify Update", "❌ FAILED", f"Updated item not found in list")
                        return False
                else:
                    self.log_test("Verify Update", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("Verify Update", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Verify Update", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_delete_gallery_item(self) -> bool:
        """Test 6: Delete Gallery Item"""
        try:
            if not self.created_item_id:
                self.log_test("Delete Gallery Item", "❌ FAILED", "No item ID available for deletion")
                return False
                
            url = f"{API_BASE}/admin/gallery/{self.created_item_id}"
            
            response = requests.delete(url, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "success" in data["message"].lower():
                    self.log_test("Delete Gallery Item", "✅ PASSED", f"Item deleted successfully")
                    return True
                else:
                    self.log_test("Delete Gallery Item", "❌ FAILED", f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Delete Gallery Item", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Delete Gallery Item", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_verify_deletion(self) -> bool:
        """Test 7: Verify Deletion"""
        try:
            url = f"{API_BASE}/admin/gallery"
            
            response = requests.get(url, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check that our item is not in the list
                    deleted_item = None
                    for item in data:
                        if item.get("id") == self.created_item_id:
                            deleted_item = item
                            break
                    
                    if not deleted_item:
                        self.log_test("Verify Deletion", "✅ PASSED", f"Item successfully removed from list")
                        return True
                    else:
                        self.log_test("Verify Deletion", "❌ FAILED", f"Deleted item still found in list: {deleted_item}")
                        return False
                else:
                    self.log_test("Verify Deletion", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("Verify Deletion", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Verify Deletion", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all gallery API tests in sequence"""
        print(f"Starting Gallery API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_admin_login,
            self.test_create_gallery_item,
            self.test_list_gallery_items,
            self.test_update_gallery_item,
            self.test_verify_update,
            self.test_delete_gallery_item,
            self.test_verify_deletion
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAILED {test.__name__}: Exception: {str(e)}")
                failed += 1
            print()  # Empty line between tests
        
        # Summary
        print("=" * 60)
        print(f"TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print("=" * 60)
        
        return passed, failed, self.test_results

def main():
    """Main test runner"""
    tester = GalleryAPITester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()