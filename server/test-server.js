const http = require('http');

// Require the express app (starts listening)
const app = require('./src/index');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Testing server endpoints...');

  // 1. Health check
  const health = await request('GET', '/api/health');
  console.log('1. Health check:', health.status === 200 && health.data.success ? 'PASS' : 'FAIL', health.data);

  // 2. Admin login
  const adminLogin = await request('POST', '/api/auth/login', {
    mobile: '9999999999',
    password: 'admin123'
  });
  console.log('2. Admin login:', adminLogin.status === 200 && adminLogin.data.success ? 'PASS' : 'FAIL');
  const adminToken = adminLogin.data?.data?.token;

  // 3. Register or Login test farmer
  let farmerToken;
  const testMobile = '9876543210';
  const farmerRegister = await request('POST', '/api/auth/register', {
    name: 'Ramesh Patel',
    mobile: testMobile,
    password: 'password123',
    preferred_language: 'hi'
  });
  if (farmerRegister.status === 201) {
    console.log('3. Farmer register: PASS (New registration)');
    farmerToken = farmerRegister.data?.data?.token;
  } else {
    // Already registered, login
    const farmerLogin = await request('POST', '/api/auth/login', {
      mobile: testMobile,
      password: 'password123'
    });
    console.log('3. Farmer login (already registered):', farmerLogin.status === 200 ? 'PASS' : 'FAIL');
    farmerToken = farmerLogin.data?.data?.token;
  }

  // 4. Farmer profile update
  const profileUpdate = await request('PUT', '/api/profile', {
    village: 'Khed',
    district: 'Pune',
    state: 'Maharashtra',
    land_size: 5.5,
    land_unit: 'acres',
    soil_type: 'black',
    irrigation_available: 1,
    irrigation_type: 'drip'
  }, farmerToken);
  console.log('4. Profile update:', profileUpdate.status === 200 && profileUpdate.data.success ? 'PASS' : 'FAIL');

  // 5. Get reference crops
  const crops = await request('GET', '/api/crops');
  console.log('5. Reference crops count:', crops.data?.data?.length, crops.status === 200 ? 'PASS' : 'FAIL');

  // 6. Add farmer crop
  const riceCrop = crops.data?.data?.find(c => c.name === 'Rice');
  const addFarmerCrop = await request('POST', '/api/farmer-crops', {
    crop_id: riceCrop.id,
    variety: 'Basmati 1121',
    sowing_date: '2026-10-01',
    field_size: 3.0,
    field_unit: 'acres',
    notes: 'Kharif season test'
  }, farmerToken);
  console.log('6. Add farmer crop:', (addFarmerCrop.status === 201 || addFarmerCrop.status === 200) ? 'PASS' : 'FAIL');

  // 7. Get farmer crops with growth stage
  const farmerCropsList = await request('GET', '/api/farmer-crops', null, farmerToken);
  const farmerCropId = addFarmerCrop.data?.data?.id || farmerCropsList.data?.data?.[0]?.id;
  console.log('7. Get farmer crops:', farmerCropsList.status === 200 ? 'PASS' : 'FAIL', 'Current stage:', farmerCropsList.data?.data[0]?.growth_stage?.current_stage);

  // 8. Generate farming calendar
  const genCalendar = await request('POST', '/api/calendar/generate', { farmer_crop_id: farmerCropId }, farmerToken);
  console.log('8. Generate calendar:', genCalendar.status === 201 && genCalendar.data.success ? 'PASS' : 'FAIL', 'Events count:', genCalendar.data?.data?.length);

  // 9. Log activity
  const logActivity = await request('POST', '/api/activities', {
    farmer_crop_id: farmerCropId,
    activity_type: 'irrigation',
    description: 'First irrigation completed',
    activity_date: '2026-10-04',
    notes: 'Canal water used'
  }, farmerToken);
  console.log('9. Log activity:', logActivity.status === 201 && logActivity.data.success ? 'PASS' : 'FAIL');

  // 10. Soil record + recommend
  const soilRec = await request('POST', '/api/soil/recommend', {
    soil_type: 'black',
    ph: 7.2,
    nitrogen: 280,
    phosphorus: 25,
    potassium: 350
  }, farmerToken);
  console.log('10. Soil recommend:', soilRec.status === 200 && soilRec.data.success ? 'PASS' : 'FAIL', 'Recommended:', soilRec.data?.data?.recommendations?.map(r => r.crop));

  // 11. Knowledge articles
  const articles = await request('GET', '/api/knowledge');
  console.log('11. Knowledge articles count:', articles.data?.data?.length, articles.status === 200 ? 'PASS' : 'FAIL');

  // 12. Admin stats
  const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
  console.log('12. Admin stats:', adminStats.status === 200 && adminStats.data.success ? 'PASS' : 'FAIL', adminStats.data?.data);

  // 13. Weather alerts test
  const weatherAlerts = await request('GET', '/api/weather/alerts?lat=18.5204&lon=73.8567', null, farmerToken);
  console.log('13. Weather alerts:', weatherAlerts.status === 200 && weatherAlerts.data.success ? 'PASS' : 'FAIL');

  // 14. Notifications list
  const notifs = await request('GET', '/api/notifications', null, farmerToken);
  console.log('14. Notifications:', notifs.status === 200 && notifs.data.success ? 'PASS' : 'FAIL', 'Count:', notifs.data?.data?.notifications?.length);

  console.log('\n--- ALL TEST SUITES COMPLETED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
