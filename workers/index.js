addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const entity = url.searchParams.get('entity') || 'us'
  const timeframe = url.searchParams.get('timeframe') || '1d'

  const html = generateHTML(entity, timeframe)
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}

function generateHTML(entity, timeframe) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cloudflare Radar Outage Overview</title>
    </head>
    <body>
      <h1>Cloudflare Radar Outage Overview</h1>
      <form id="inputForm">
        <label for="entity">Entity:</label>
        <input type="text" id="entity" name="entity" value="${entity}" required>
        <label for="timeframe">Timeframe:</label>
        <input type="text" id="timeframe" name="timeframe" value="${timeframe}" required>
        <button type="submit">Submit</button>
      </form>
      <h2>Traffic Graph for ${entity.toUpperCase()}</h2>
      <h3>Timeframe: ${timeframe}</h3>
      <iframe id="radarFrame" class="cf-radar-embed" width="800" height="450" src="https://radar.cloudflare.com/embed/TrafficTrendsXY?dateRange=${timeframe}&location=${entity}&chartState=%7B%22showAnnotations%22%3Atrue%2C%22xy.hiddenSeries%22%3A%5B%5D%2C%22xy.highlightedSeries%22%3Anull%2C%22xy.hoveredSeries%22%3Anull%2C%22xy.previousVisible%22%3Atrue%7D" title="Cloudflare Radar - Traffic trends" loading="lazy" style="border:0;max-width:100%;"></iframe>

      <script>
        document.getElementById('inputForm').addEventListener('submit', function(event) {
          event.preventDefault();
          const entity = document.getElementById('entity').value;
          const timeframe = document.getElementById('timeframe').value;
          const newUrl = \`\${location.pathname}?entity=\${entity}&timeframe=\${timeframe}\`;
          window.history.pushState({}, '', newUrl);
          document.getElementById('radarFrame').src = \`https://radar.cloudflare.com/embed/TrafficTrendsXY?dateRange=${timeframe}&location=${entity}&chartState=%7B%22showAnnotations%22%3Atrue%2C%22xy.hiddenSeries%22%3A%5B%5D%2C%22xy.highlightedSeries%22%3Anull%2C%22xy.hoveredSeries%22%3Anull%2C%22xy.previousVisible%22%3Atrue%7D\`;
        });
      </script>
    </body>
    </html>
  `
}