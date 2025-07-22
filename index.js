const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

const SUPABASE_URL = "https://lvgrbxlopeaaqyehguuv.supabase.co"; // replace this
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Z3JieGxvcGVhYXF5ZWhndXV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjEzNjIyMCwiZXhwIjoyMDY3NzEyMjIwfQ.Nv6CzsZWv0PLx6xjzosZwgr4ZbAQqFh4CdVKTrFE48E";

app.post("/", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const parentId = req.body.queryResult.parameters.ParentID || "P001";
  let responseText = "No matching data found.";

  if (!req.body.queryResult.parameters.ParentID) {
  return res.json({
    fulfillmentText: "Can you please tell me your Parent ID?"
  });
}


  console.log("Received Parent ID:", parentId);
  const apiUrl = `${SUPABASE_URL}/rest/v1/student_data?parent_id=eq.${parentId}`;
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  try {
    const response = await fetch(apiUrl, { headers });
    const data = await response.json();

    if (data.length === 0) {
      responseText = `No data found for Parent ID: ${parentId}`;
    } else {
      if (intent === "show_marks") {
        const marks = data.map(d => `${d.subject}: ${d.marks}`).join(", ");
        responseText = `Marks for ${data[0].student_name}: ${marks}`;
      } else if (intent === "exam_schedule") {
        const exams = data.map(d => `${d.subject}: ${d.exam_date}`).join(", ");
        responseText = `Exam schedule: ${exams}`;
      } else if (intent === "syllabus_query") {
        const links = [...new Set(data.map(d => d.curriculum_url))];
        responseText = `Curriculum link(s): ${links.join(", ")}`;
      }
    }

    res.json({ fulfillmentText: responseText });

  } catch (err) {
    console.error(err);
    res.json({ fulfillmentText: "Something went wrong. Please try again later." });
  }
});

app.listen(3000, () => console.log("Webhook is live on port 3000"));
