const GHL_BASE = "https://rest.gohighlevel.com/v1";

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function updateOpportunityStage(opportunityId: string, stageId: string) {
  const res = await fetch(`${GHL_BASE}/opportunities/${opportunityId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ stageId }),
  });
  if (!res.ok) throw new Error(`GHL opportunity update failed: ${res.status}`);
  return res.json();
}

export async function addContactNote(contactId: string, body: string) {
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(`GHL note creation failed: ${res.status}`);
  return res.json();
}

export async function getContact(contactId: string) {
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`GHL contact fetch failed: ${res.status}`);
  return res.json();
}
