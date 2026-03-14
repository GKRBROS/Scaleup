import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

const PIXEL_ID = process.env.FB_PIXEL_ID || process.env.FB_DATASET_ID;
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

const hashData = (data: string) => {
  if (!data) return '';
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

const safeParseResponse = async (response: Response) => {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

export async function POST(req: Request) {
  try {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing FB_PIXEL_ID/FB_DATASET_ID or FB_ACCESS_TOKEN environment variables.',
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { eventName, email, phone, name, eventId, eventSourceUrl } = body;

    const firstName = typeof name === 'string' ? name.trim().split(/\s+/)[0] : '';
    const normalizedPhone = typeof phone === 'string' ? normalizePhone(phone) : '';
    const clientIpAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const clientUserAgent = req.headers.get('user-agent') || undefined;

    const payload = {
      data: [
        {
          event_name: eventName || 'CompleteRegistration',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: eventId,
          event_source_url: eventSourceUrl,
          user_data: {
            em: email ? [hashData(email)] : undefined,
            ph: normalizedPhone ? [hashData(normalizedPhone)] : undefined,
            fn: firstName ? [hashData(firstName)] : undefined,
            client_ip_address: clientIpAddress,
            client_user_agent: clientUserAgent,
          },
        }
      ]
    };

    const query = new URLSearchParams({ access_token: ACCESS_TOKEN });
    const testEventCode = process.env.FB_TEST_EVENT_CODE;

    if (testEventCode) {
      query.set('test_event_code', testEventCode);
    }

    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?${query.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await safeParseResponse(response);

    if (!response.ok) {
      console.error("FB Conversion API Error Response:", result);
      return NextResponse.json({ success: false, error: result }, { status: response.status });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("FB Conversion API internal error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
