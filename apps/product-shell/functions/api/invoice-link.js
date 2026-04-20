/**
 * Cloudflare Pages Function — invoice payment link resolver.
 *
 * GET /api/invoice-link?inv=INV-...&amt=100&subj=...
 *
 * Returns JSON with the decoded invoice parameters so that any
 * consumer of a shared payment link can reconstruct the invoice
 * without re-parsing the URL on the client.
 */
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const inv  = url.searchParams.get("inv")  ?? "";
  const amt  = url.searchParams.get("amt")  ?? "";
  const subj = url.searchParams.get("subj") ?? "";

  if (!inv && !amt) {
    return new Response(JSON.stringify({ error: "Missing required params: inv, amt" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = {
    invoiceNumber: inv,
    amount: amt,
    subject: subj,
    resolvedAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
