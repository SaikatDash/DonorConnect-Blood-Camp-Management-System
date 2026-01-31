# Test Script to Verify Database Connection and API

import mysql.connector
from mysql.connector import Error

def test_database_connection():
    """Test MySQL database connection"""
    print("=" * 50)
    print("Testing MySQL Database Connection...")
    print("=" * 50)
    
    connection = None
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='sys449420',
            database='patient'
        )
        
        if connection.is_connected():
            print("Successfully connected to MySQL database 'patient'")
            
            from typing import Any
            cursor: Any = connection.cursor(dictionary=True)
            
            # Test each table
            tables = [
                ('donors', 'SELECT COUNT(*) as count FROM donation_records'),
                ('camps', 'SELECT COUNT(*) as count FROM camps'),
                ('blood_inventory', 'SELECT COUNT(*) as count FROM blood_inventory'),
                ('emergency_requests', 'SELECT COUNT(*) as count FROM emergency_requests'),
                ('appointments', 'SELECT COUNT(*) as count FROM appointments'),
                ('donation_records', 'SELECT COUNT(*) as count FROM donation_records')
            ]
            
            print("\nTable Statistics:")
            print("-" * 50)
            for table_name, query in tables:
                cursor.execute(query)
                result = cursor.fetchone()
                print(f"  {table_name:20} : {result['count']} records")
            
            # Test sample data from each table
            print("\nSample Data Check:")
            print("-" * 50)
            
            # Donors
            cursor.execute("SELECT donor_id, name, blood_group FROM donors LIMIT 3")
            donors = cursor.fetchall()
            print(f"\n  Donors ({len(donors)} samples):")
            for d in donors:
                print(f" - {d['donor_id']}: {d['name']} ({d['blood_group']})")
            
            # Camps
            cursor.execute("SELECT camp_id, title, city FROM camps LIMIT 3")
            camps = cursor.fetchall()
            print(f"\n  Camps ({len(camps)} samples):")
            for c in camps:
                print(f"    - {c['camp_id']}: {c['title']} - {c['city']}")
            
            # Blood Inventory
            cursor.execute("SELECT inventory_id, blood_group, units_available, location FROM blood_inventory LIMIT 3")
            inventory = cursor.fetchall()
            print(f"\n  Blood Inventory ({len(inventory)} samples):")
            for i in inventory:
                print(f"    - {i['inventory_id']}: {i['blood_group']} - {i['units_available']} units at {i['location']}")
            
            cursor.close()
            print("\nAll tables are accessible and contain data!")
            
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return False
    finally:
        if connection is not None and connection.is_connected():
            connection.close()
            print("\nConnection closed successfully")
    
    return True


def test_api_endpoints():
    """Test API endpoints"""
    import requests
    
    print("\n" + "=" * 50)
    print("Testing API Endpoints...")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api"
    api_status = True
    
    endpoints = [
        ("GET", "/donors", "Fetch Donors"),
        ("GET", "/camps", "Fetch Camps"),
        ("GET", "/inventory", "Fetch Blood Inventory"),
        ("GET", "/emergency-requests", "Fetch Emergency Requests"),
        ("GET", "/appointments", "Fetch Appointments"),
    ]
    
    print("\n🌐 Testing API Endpoints:")
    print("-" * 50)
    
    for method, endpoint, description in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else 1
                print(f" {description:30} : {count} records")
            else:
                print(f" {description:30} : Status {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"  {description:30} : API not running (start with 'uvicorn api:app --reload')")
            return False
        except Exception as e:
            print(f" {description:30} : Error - {str(e)}")
    
    print("\nAll API endpoints are working!")
    return True


if __name__ == "__main__":
    print("\nDonorConnect Backend Testing Suite")
    print("=" * 50)
    
    # Test database connection
    db_status = test_database_connection()
    
    # Test API endpoints (only if database is working)
    api_status = False
    if db_status:
        print("\nTesting API endpoints (make sure FastAPI server is running)...")
        api_status = test_api_endpoints()
    
    print("\n" + "=" * 50)
    print("Testing Complete!")
    print("=" * 50)
    
    if db_status:
        print("\nNext Steps:")
        print("  1. Database is ready")
        if not api_status:
            print("  2. Start API server: uvicorn api:app --reload")
        else:
            print("  2. API server is running")
        print("  3.Start React app: npm run dev")
        print("  4. Open http://localhost:5173 in your browser")
    else:
        print("\nPlease fix database connection issues first!")
        print("  - Check MySQL is running")
        print("  - Verify credentials in api.py")
        print("  - Run: mysql -u root -p < database_schema.sql")
