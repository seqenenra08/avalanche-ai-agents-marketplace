export async function POST(req: Request) {
  const body = await req.json()
  const res = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MY_API_KEY!,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return Response.json(data)
}
