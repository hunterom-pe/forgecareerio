
const SERPAPI_KEY = process.env.SERPAPI_KEY || "";

async function testSearch() {
  const title = "Production Manager";
  const location = "USA";

  // Test: No ltype, but keyword in Q
  console.log("--- TEST: No ltype, keyword in Q ---");
  const params = new URLSearchParams({
    engine: "google_jobs",
    q: title + " Remote",
    location: location,
    gl: "us",
    hl: "en",
    api_key: SERPAPI_KEY
  });
  const url = `https://serpapi.com/search.json?${params.toString()}`;
  console.log("URL:", url);
  const res = await fetch(url);
  const data = await res.json();
  console.log("Results:", data.jobs_results?.length || 0);
}

testSearch();
