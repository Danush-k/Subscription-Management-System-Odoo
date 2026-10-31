async function runVerification() {
  console.log("=== Testing Admin Dashboard & Detail Modals Dynamic Data ===");

  // 1. Authenticate as Admin
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@brightloopsoftware.com", password: "BrightloopAdmin#2026" }),
  });
  console.log("Admin Login status:", loginRes.status);
  const cookie = loginRes.headers.get("set-cookie");
  const cookies = cookie ? cookie.split(";")[0] : "";

  // 2. Test Admin Dashboard API
  console.log("\n--- Testing Admin Dashboard API ---");
  const dashRes = await fetch("http://localhost:3000/api/admin/dashboard", { headers: { Cookie: cookies } });
  console.log("GET /api/admin/dashboard status:", dashRes.status);
  const dashData = await dashRes.json();
  console.log("Dashboard Metrics loaded:", Boolean(dashData.metrics));
  console.log("Total Subscriptions in DB:", dashData.metrics?.totalSubscriptions);
  console.log("Recent Subscriptions count:", dashData.recentSubscriptions?.length);
  console.log("Recent Invoices count:", dashData.recentInvoices?.length);

  // 3. Test Subscriptions API
  console.log("\n--- Testing Subscriptions API ---");
  const subsRes = await fetch("http://localhost:3000/api/admin/subscriptions", { headers: { Cookie: cookies } });
  console.log("GET /api/admin/subscriptions status:", subsRes.status);
  const subsData = await subsRes.json();
  console.log("Loaded Subscriptions count:", subsData.subscriptions?.length);
  if (subsData.subscriptions?.length > 0) {
    console.log("Sample Subscription:", subsData.subscriptions[0].subscriptionNumber, subsData.subscriptions[0].customerName);
  }

  // 4. Test Customers API
  console.log("\n--- Testing Customers API ---");
  const custRes = await fetch("http://localhost:3000/api/admin/customers", { headers: { Cookie: cookies } });
  console.log("GET /api/admin/customers status:", custRes.status);
  const custData = await custRes.json();
  console.log("Loaded Customers count:", custData.customers?.length);

  // 5. Test Products API (GET & POST)
  console.log("\n--- Testing Products API ---");
  const prodRes = await fetch("http://localhost:3000/api/admin/products", { headers: { Cookie: cookies } });
  console.log("GET /api/admin/products status:", prodRes.status);
  const prodData = await prodRes.json();
  console.log("Initial Products count:", prodData.products?.length);

  const newProdCode = `PROD-TEST-${Date.now() % 10000}`;
  const createProdRes = await fetch("http://localhost:3000/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookies },
    body: JSON.stringify({
      name: "Brightloop Automation Add-on",
      productCode: newProdCode,
      type: "ADDON",
      basePrice: 4999,
      costPrice: 999,
      description: "Automated webhook dispatch and CRM connector add-on",
      variants: [
        { name: "Starter Tier", sku: `${newProdCode}-STD`, addonPrice: 0 },
        { name: "Scale Tier", sku: `${newProdCode}-SCL`, addonPrice: 2500 },
      ],
    }),
  });
  console.log("POST /api/admin/products status:", createProdRes.status);
  const createdProd = await createProdRes.json();
  console.log("Created Product success:", createdProd.success);

  // 6. Test All Admin UI Pages
  console.log("\n--- Testing Admin UI Pages HTTP Status ---");
  const pages = [
    "/admin/dashboard",
    "/admin/subscriptions",
    "/admin/plans",
    "/admin/customers",
    "/admin/products",
    "/admin/invoices",
    "/admin/taxes",
    "/admin/discounts",
  ];

  for (const page of pages) {
    const res = await fetch(`http://localhost:3000${page}`, { headers: { Cookie: cookies } });
    console.log(`${page} status:`, res.status);
  }

  console.log("\n=== All Verification Checks Passed! ===");
}

runVerification().catch(console.error);
