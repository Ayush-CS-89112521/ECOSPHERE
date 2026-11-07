import { NextResponse } from 'next/server';
import { getDelhiAirQuality } from '@/lib/aqi/service.js';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getDelhiAirQuality();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Failed to compute Delhi air quality in Next.js route:', err);
    return NextResponse.json(
      { error: 'Unable to compute air quality right now.' },
      { status: 500 }
    );
  }
}
