import { NextResponse } from 'next/server';
import { TripResults } from '@/types';

export async function POST(request: Request) {
  try {
    const results: TripResults = await request.json();

    // Helper functions
    const parsePrice = (priceStr: string | number | undefined): number => {
      if (!priceStr) return 0;
      if (typeof priceStr === 'number') return priceStr;
      const num = parseFloat(String(priceStr).replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : num;
    };

    const getTotalPieces = (): number => {
      const pieceIds = new Set<string>();
      results.days.forEach((day) => {
        day.daytimeOutfit?.pieces?.forEach((p) => pieceIds.add(p.id));
        day.eveningOutfit?.pieces?.forEach((p) => pieceIds.add(p.id));
      });
      return pieceIds.size;
    };

    const getTotalOutfits = (): number => {
      return results.days.reduce((sum, day) => {
        let count = 0;
        if (day.daytimeOutfit) count++;
        if (day.eveningOutfit) count++;
        return sum + count;
      }, 0);
    };

    const getDayTotal = (day: any): number => {
      let total = 0;
      if (day.daytimeOutfit?.pieces) {
        total += day.daytimeOutfit.pieces.reduce((sum: number, p: any) => sum + parsePrice(p.priceNum || p.price), 0);
      }
      if (day.eveningOutfit?.pieces) {
        total += day.eveningOutfit.pieces.reduce((sum: number, p: any) => sum + parsePrice(p.priceNum || p.price), 0);
      }
      return total;
    };

    const getTripTotal = (): number => {
      return results.days.reduce((sum, day) => sum + getDayTotal(day), 0);
    };

    const formatDate = (dateStr: string): string => {
      try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const getAllUniquePieces = () => {
      const pieceMap = new Map<string, any>();
      results.days.forEach((day) => {
        [...(day.daytimeOutfit?.pieces || []), ...(day.eveningOutfit?.pieces || [])].forEach((piece) => {
          if (!pieceMap.has(piece.id)) {
            pieceMap.set(piece.id, piece);
          }
        });
      });
      return Array.from(pieceMap.values());
    };

    // Generate HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${results.destination} Trip Lookbook</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
    }

    .container {
      max-width: 850px;
      margin: 0 auto;
      padding: 40px 30px;
    }

    /* Typography */
    h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #1a1a1a;
    }

    h2 {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12px;
      margin-top: 40px;
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #534AB7;
      margin-bottom: 16px;
      margin-top: 24px;
    }

    h4 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      margin-bottom: 12px;
      margin-top: 16px;
    }

    p {
      margin-bottom: 12px;
      color: #555;
    }

    .subtitle {
      color: #999;
      font-size: 14px;
    }

    /* Cover Section */
    .cover {
      text-align: center;
      padding-bottom: 60px;
      border-bottom: 1px solid #eee;
      margin-bottom: 60px;
    }

    .brand-logo {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #534AB7;
      margin-bottom: 24px;
    }

    .destination-title {
      font-size: 56px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 16px;
    }

    .trip-dates {
      font-size: 16px;
      color: #999;
      margin-bottom: 40px;
    }

    .capsule-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-top: 40px;
      padding-top: 40px;
      border-top: 1px solid #eee;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #534AB7;
      margin-bottom: 6px;
    }

    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #999;
    }

    /* Day Section */
    .day-section {
      page-break-before: always;
      padding-bottom: 40px;
      margin-bottom: 40px;
    }

    .day-header {
      margin-bottom: 20px;
    }

    .day-number {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #534AB7;
      margin-bottom: 8px;
    }

    .day-title {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    .day-activity {
      color: #666;
      font-size: 14px;
    }

    /* Weather Banner */
    .weather-box {
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 20px;
      align-items: start;
    }

    .weather-icon {
      font-size: 40px;
    }

    .weather-info {
      display: flex;
      flex-direction: column;
    }

    .weather-temp {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .weather-desc {
      color: #666;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .weather-rec {
      color: #534AB7;
      font-size: 13px;
      font-style: italic;
      font-weight: 500;
    }

    /* Outfit Section */
    .outfit {
      margin: 32px 0;
    }

    .outfit-header {
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 12px 12px 0 0;
      padding: 20px;
      margin-bottom: 0;
    }

    .outfit-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #534AB7;
      margin-bottom: 6px;
    }

    .outfit-name {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    .outfit-note {
      font-size: 13px;
      color: #666;
      font-style: italic;
      margin-bottom: 12px;
    }

    .color-palette {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .outfit-content {
      border: 1px solid #e0e0e0;
      border-top: none;
      padding: 20px;
    }

    .pieces-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .piece {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 12px;
      break-inside: avoid;
    }

    .piece-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 6px;
      border: 1px solid #ddd;
    }

    .piece-name {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
      margin-top: 8px;
    }

    .piece-brand {
      font-size: 11px;
      color: #999;
      margin-bottom: 2px;
    }

    .piece-material {
      font-size: 11px;
      color: #aaa;
      font-style: italic;
      margin-bottom: 6px;
    }

    .piece-price {
      font-size: 13px;
      font-weight: 700;
      color: #534AB7;
    }

    .outfit-total {
      text-align: right;
      font-size: 14px;
      font-weight: 600;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
    }

    .outfit-total-label {
      color: #999;
    }

    .outfit-total-price {
      color: #534AB7;
      font-size: 18px;
    }

    /* Day Total */
    .day-total {
      background: #f0ecff;
      border: 1px solid #d4c5f9;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 20px 0;
    }

    .day-total-label {
      font-weight: 600;
      color: #1a1a1a;
    }

    .day-total-price {
      font-size: 24px;
      font-weight: 700;
      color: #534AB7;
    }

    /* Packing Checklist */
    .packing-section {
      page-break-before: always;
      margin-bottom: 40px;
    }

    .checklist {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .checklist-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13px;
      color: #555;
    }

    .checkbox {
      width: 16px;
      height: 16px;
      border: 1px solid #ccc;
      border-radius: 3px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    /* Tips Section */
    .tips-section {
      margin: 32px 0;
    }

    .tips-list {
      list-style: none;
      padding-left: 0;
    }

    .tips-list li {
      margin-bottom: 12px;
      padding-left: 24px;
      position: relative;
      font-size: 13px;
      color: #555;
    }

    .tips-list li:before {
      content: '→';
      position: absolute;
      left: 0;
      color: #534AB7;
      font-weight: 700;
    }

    /* Print Styles */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }

      .container {
        padding: 30px;
        margin: 0;
      }

      .day-section {
        page-break-before: always;
        padding-top: 30px;
      }

      .packing-section {
        page-break-before: always;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .pieces-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @page {
      margin: 0.5in;
      size: letter;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Cover Section -->
    <div class="cover">
      <div class="brand-logo">StylePacker AI</div>
      <h1 class="destination-title">${results.destination}</h1>
      <p class="trip-dates">${formatDate(results.startDate)} – ${formatDate(results.endDate)}</p>

      <div class="capsule-stats">
        <div class="stat">
          <div class="stat-value">${results.totalDays}</div>
          <div class="stat-label">Days</div>
        </div>
        <div class="stat">
          <div class="stat-value">${getTotalPieces()}</div>
          <div class="stat-label">Unique Pieces</div>
        </div>
        <div class="stat">
          <div class="stat-value">${getTotalOutfits()}</div>
          <div class="stat-label">Outfits</div>
        </div>
        <div class="stat">
          <div class="stat-value">$${getTripTotal().toFixed(0)}</div>
          <div class="stat-label">Total Cost</div>
        </div>
      </div>
    </div>

    <!-- Day Plans -->
    ${results.days
      .map(
        (day) => `
      <div class="day-section">
        <div class="day-header">
          <div class="day-number">Day ${day.dayNumber}</div>
          <h2 class="day-title">${day.title}</h2>
          <p class="day-activity">${day.activitySummary}</p>
        </div>

        ${
          day.weather
            ? `
          <div class="weather-box">
            <div class="weather-icon">
              ${
                day.weather.conditions.toLowerCase().includes('rain')
                  ? '🌧️'
                  : day.weather.conditions.toLowerCase().includes('cloud') ||
                      day.weather.conditions.toLowerCase().includes('overcast')
                    ? '☁️'
                    : day.weather.conditions.toLowerCase().includes('sun') ||
                        day.weather.conditions.toLowerCase().includes('clear')
                      ? '☀️'
                      : day.weather.conditions.toLowerCase().includes('snow')
                        ? '❄️'
                        : '🌤️'
              }
            </div>
            <div class="weather-info">
              <div class="weather-temp">${day.weather.tempHigh}°F</div>
              <div class="weather-desc">${day.weather.conditions}</div>
              <div class="weather-rec">${day.weather.recommendation}</div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Daytime Outfit -->
        ${
          day.daytimeOutfit
            ? `
          <div class="outfit">
            <div class="outfit-header">
              <div class="outfit-label">☀️ Daytime Look</div>
              <h3 class="outfit-name">${day.daytimeOutfit.lookName}</h3>
              ${day.daytimeOutfit.styleNote ? `<p class="outfit-note">${day.daytimeOutfit.styleNote}</p>` : ''}
              <div class="color-palette">
                ${
                  day.daytimeOutfit.colorPalette
                    ?.filter((c) => c)
                    .map((color) => `<div class="color-swatch" style="background-color: ${color}"></div>`)
                    .join('')
                }
              </div>
            </div>
            <div class="outfit-content">
              <div class="pieces-grid">
                ${day.daytimeOutfit.pieces
                  .map(
                    (piece) => `
                  <div class="piece">
                    <div class="piece-color" style="background-color: ${piece.colorHex || '#f0f0f0'}"></div>
                    <span style="font-size: 11px; color: #999;">${piece.color}</span>
                    <p class="piece-name">${piece.name}</p>
                    ${piece.brand ? `<p class="piece-brand">${piece.brand}</p>` : ''}
                    ${piece.material ? `<p class="piece-material">${piece.material}</p>` : ''}
                    <p class="piece-price">$${parsePrice(piece.priceNum || piece.price).toFixed(0)}</p>
                  </div>
                `
                  )
                  .join('')}
              </div>
              <div class="outfit-total">
                <span class="outfit-total-label">This look: </span>
                <span class="outfit-total-price">$${day.daytimeOutfit.pieces
                  .reduce((sum, p) => sum + parsePrice(p.priceNum || p.price), 0)
                  .toFixed(2)}</span>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Evening Outfit -->
        ${
          day.eveningOutfit
            ? `
          <div class="outfit">
            <div class="outfit-header">
              <div class="outfit-label">🌙 Evening Look</div>
              <h3 class="outfit-name">${day.eveningOutfit.lookName}</h3>
              ${day.eveningOutfit.styleNote ? `<p class="outfit-note">${day.eveningOutfit.styleNote}</p>` : ''}
              <div class="color-palette">
                ${
                  day.eveningOutfit.colorPalette
                    ?.filter((c) => c)
                    .map((color) => `<div class="color-swatch" style="background-color: ${color}"></div>`)
                    .join('')
                }
              </div>
            </div>
            <div class="outfit-content">
              <div class="pieces-grid">
                ${day.eveningOutfit.pieces
                  .map(
                    (piece) => `
                  <div class="piece">
                    <div class="piece-color" style="background-color: ${piece.colorHex || '#f0f0f0'}"></div>
                    <span style="font-size: 11px; color: #999;">${piece.color}</span>
                    <p class="piece-name">${piece.name}</p>
                    ${piece.brand ? `<p class="piece-brand">${piece.brand}</p>` : ''}
                    ${piece.material ? `<p class="piece-material">${piece.material}</p>` : ''}
                    <p class="piece-price">$${parsePrice(piece.priceNum || piece.price).toFixed(0)}</p>
                  </div>
                `
                  )
                  .join('')}
              </div>
              <div class="outfit-total">
                <span class="outfit-total-label">This look: </span>
                <span class="outfit-total-price">$${day.eveningOutfit.pieces
                  .reduce((sum, p) => sum + parsePrice(p.priceNum || p.price), 0)
                  .toFixed(2)}</span>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Day Total -->
        <div class="day-total">
          <span class="day-total-label">Day ${day.dayNumber} Total</span>
          <span class="day-total-price">$${getDayTotal(day).toFixed(2)}</span>
        </div>
      </div>
    `
      )
      .join('')}

    <!-- Packing Checklist -->
    <div class="packing-section">
      <h2>Packing Checklist</h2>
      <p class="subtitle">All unique pieces for your trip</p>

      <div class="checklist">
        ${getAllUniquePieces()
          .map(
            (piece) => `
          <div class="checklist-item">
            <div class="checkbox"></div>
            <span>${piece.name}</span>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="day-total" style="margin-top: 32px;">
        <span class="day-total-label">Total Wardrobe Value</span>
        <span class="day-total-price">$${getTripTotal().toFixed(2)}</span>
      </div>
    </div>

    <!-- Don't Forget & Tips -->
    ${
      results.dontForgetItems && results.dontForgetItems.length > 0
        ? `
      <div class="tips-section">
        <h2>Don't Forget</h2>
        <ul class="tips-list">
          ${results.dontForgetItems.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `
        : ''
    }

    ${
      results.mixMatchTips && results.mixMatchTips.length > 0
        ? `
      <div class="tips-section">
        <h2>Mix & Match Tips</h2>
        <ul class="tips-list">
          ${results.mixMatchTips.map((tip) => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
    `
        : ''
    }
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline; filename="lookbook.html"',
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}
