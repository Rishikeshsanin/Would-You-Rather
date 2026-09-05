module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(503).json({ error: 'Vote service is not configured yet' });
  }

  const { questionId, choice, voterToken } = req.body || {};
  if (!/^q\d{3}$/.test(String(questionId || '')) || !['red', 'blue'].includes(choice)) {
    return res.status(400).json({ error: 'Invalid vote' });
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(voterToken || ''))) {
    return res.status(400).json({ error: 'Invalid voter token' });
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  const insert = await fetch(`${supabaseUrl}/rest/v1/wyr_votes`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ question_id: questionId, voter_token: voterToken, choice })
  });

  let duplicate = false;
  if (!insert.ok) {
    const text = await insert.text();
    if (insert.status === 409 || text.includes('23505')) {
      duplicate = true;
    } else {
      console.error('vote insert failed', insert.status, text);
      return res.status(502).json({ error: 'Could not record vote' });
    }
  }

  const result = await fetch(`${supabaseUrl}/rest/v1/rpc/get_wyr_results`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_question_id: questionId })
  });

  if (!result.ok) {
    console.error('result query failed', result.status, await result.text());
    return res.status(502).json({ error: 'Could not load results' });
  }

  const rows = await result.json();
  const row = Array.isArray(rows) ? rows[0] : rows;
  return res.status(200).json({
    red: Number(row?.red_count || 0),
    blue: Number(row?.blue_count || 0),
    duplicate,
    mode: 'global'
  });
};
