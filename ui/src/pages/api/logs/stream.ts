const apiPort = process.env.API_PORT || 3001

export const config = {
  runtime: 'edge',
}

export default async function handler() {
  const { body } = await fetch(`http://localhost:${apiPort}/api/logs/stream`, {
    cache: 'no-cache',
  })

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
