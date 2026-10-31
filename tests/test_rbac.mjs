async function login(email, password) {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const cookie = res.headers.get('set-cookie');
  return cookie ? cookie.split(';')[0] : '';
}

async function runRBACSuite() {
  console.log('=== LOGGING IN PERSONAS ===');
  const adminCookie = await login('admin@brightloopsoftware.com', 'BrightloopAdmin#2026');
  const staffCookie = await login('staff@brightloopsoftware.com', 'BrightloopStaff#2026');
  const customerCookie = await login('billing@ssntechlabs.com', 'BrightloopClient#2026');

  console.log('Admin cookie obtained:', Boolean(adminCookie));
  console.log('Staff cookie obtained:', Boolean(staffCookie));
  console.log('Customer cookie obtained:', Boolean(customerCookie));

  const testCases = [
    // [Actor, Cookie, Route, ExpectedStatus, ExpectedLocation]
    ['ANONYMOUS', '', '/admin/dashboard', 307, '/login?returnTo=%2Fadmin%2Fdashboard'],
    ['ANONYMOUS', '', '/api/admin/dashboard', 401, null],
    ['ANONYMOUS', '', '/customer/dashboard', 307, '/login?returnTo=%2Fcustomer%2Fdashboard'],
    ['ANONYMOUS', '', '/api/customer/portal', 401, null],
    ['ANONYMOUS', '', '/', 200, null],
    ['ANONYMOUS', '', '/login', 200, null],

    // ADMIN actor
    ['ADMIN', adminCookie, '/admin/dashboard', 200, null],
    ['ADMIN', adminCookie, '/api/admin/dashboard', 200, null],
    ['ADMIN', adminCookie, '/staff/dashboard', 200, null],
    ['ADMIN', adminCookie, '/customer/dashboard', 200, null],
    ['ADMIN', adminCookie, '/api/customer/portal', 200, null],

    // STAFF actor
    ['STAFF', staffCookie, '/staff/dashboard', 200, null],
    ['STAFF', staffCookie, '/admin/dashboard', 307, '/unauthorized'],
    ['STAFF', staffCookie, '/api/admin/dashboard', 403, null],

    // CUSTOMER actor
    ['CUSTOMER', customerCookie, '/customer/dashboard', 200, null],
    ['CUSTOMER', customerCookie, '/api/customer/portal', 200, null],
    ['CUSTOMER', customerCookie, '/admin/dashboard', 307, '/unauthorized'],
    ['CUSTOMER', customerCookie, '/api/admin/dashboard', 403, null],
    ['CUSTOMER', customerCookie, '/staff/dashboard', 307, '/unauthorized'],
  ];

  console.log('\n=== RUNNING RBAC MATRIX VERIFICATION ===');
  let passed = 0;
  let failed = 0;

  for (const [actor, cookie, route, expStatus, expLocation] of testCases) {
    const headers = cookie ? { Cookie: cookie } : {};
    const res = await fetch('http://localhost:3000' + route, { headers, redirect: 'manual' });
    const location = res.headers.get('location');
    const isStatusMatch = res.status === expStatus;
    const isLocMatch = expLocation ? location === expLocation : true;

    if (isStatusMatch && isLocMatch) {
      console.log(`✔ PASS [${actor}] ${route} -> ${res.status}` + (location ? ` (${location})` : ''));
      passed++;
    } else {
      console.error(`✖ FAIL [${actor}] ${route} -> Got ${res.status} (${location}), Expected ${expStatus} (${expLocation})`);
      failed++;
    }
  }

  console.log(`\nRBAC RESULTS: ${passed} Passed, ${failed} Failed`);
}

runRBACSuite();
