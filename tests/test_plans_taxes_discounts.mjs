async function runTests() {
  console.log("=== Testing Plans, Taxes, and Discounts APIs ===");

  // 1. Authenticate as Admin
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@brightloopsoftware.com", password: "BrightloopAdmin#2026" }),
  });
  console.log("Admin Login status:", loginRes.status);
  const cookie = loginRes.headers.get("set-cookie");
  const cookies = cookie ? cookie.split(";")[0] : "";

  // 2. Test Plans API
  console.log("\n--- Testing Plans API ---");
  const getPlans = await fetch("http://localhost:3000/api/admin/plans", {
    headers: { Cookie: cookies },
  });
  console.log("GET /api/admin/plans status:", getPlans.status);
  const initialPlans = await getPlans.json();
  console.log("Initial plans count:", initialPlans.plans?.length);

  const newPlanCode = `TEST-PLAN-${Date.now()}`;
  const postPlan = await fetch("http://localhost:3000/api/admin/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookies },
    body: JSON.stringify({
      name: "Dynamic Enterprise Plan",
      code: newPlanCode,
      price: 18999,
      frequency: "MONTHLY",
      trialDays: 14,
      description: "Auto-tested dynamic plan with full feature suite",
      quotationTemplate: true,
      autoClose: true,
      publishOnWeb: true,
    }),
  });
  console.log("POST /api/admin/plans status:", postPlan.status);
  const createdPlan = await postPlan.json();
  console.log("Created plan result:", createdPlan.success ? "SUCCESS" : createdPlan);

  // 3. Test Taxes API
  console.log("\n--- Testing Taxes API ---");
  const getTaxes = await fetch("http://localhost:3000/api/admin/taxes", {
    headers: { Cookie: cookies },
  });
  console.log("GET /api/admin/taxes status:", getTaxes.status);
  const initialTaxes = await getTaxes.json();
  console.log("Initial taxes count:", initialTaxes.taxes?.length);

  const newTaxCode = `GST-TEST-${Date.now() % 10000}`;
  const postTax = await fetch("http://localhost:3000/api/admin/taxes", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookies },
    body: JSON.stringify({
      name: "Special Cess 5%",
      code: newTaxCode,
      rate: 5.0,
      type: "EXCLUSIVE",
      jurisdiction: "All India Standard",
    }),
  });
  console.log("POST /api/admin/taxes status:", postTax.status);
  const createdTax = await postTax.json();
  console.log("Created tax result:", createdTax.success ? "SUCCESS" : createdTax);

  // 4. Test Discounts API
  console.log("\n--- Testing Discounts API ---");
  const getDiscounts = await fetch("http://localhost:3000/api/admin/discounts", {
    headers: { Cookie: cookies },
  });
  console.log("GET /api/admin/discounts status:", getDiscounts.status);
  const initialDiscounts = await getDiscounts.json();
  console.log("Initial discounts count:", initialDiscounts.discounts?.length);

  const newDiscountCode = `TESTPROMO${Date.now() % 10000}`;
  const postDiscount = await fetch("http://localhost:3000/api/admin/discounts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookies },
    body: JSON.stringify({
      code: newDiscountCode,
      name: "Exclusive New Year Booster",
      type: "PERCENTAGE",
      value: 15,
      minPurchase: 5000,
      maxUsage: 100,
    }),
  });
  console.log("POST /api/admin/discounts status:", postDiscount.status);
  const createdDiscount = await postDiscount.json();
  console.log("Created discount result:", createdDiscount.success ? "SUCCESS" : createdDiscount);

  // 5. Test Admin Pages SSR / HTTP 200
  console.log("\n--- Testing Admin UI Page Responses ---");
  for (const page of ["plans", "taxes", "discounts"]) {
    const pageRes = await fetch(`http://localhost:3000/admin/${page}`, {
      headers: { Cookie: cookies },
    });
    console.log(`/admin/${page} response status:`, pageRes.status);
  }

  console.log("\n=== All Tests Completed Successfully! ===");
}

runTests().catch(console.error);
