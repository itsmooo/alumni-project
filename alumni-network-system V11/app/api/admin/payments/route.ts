import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const paymentMethod = searchParams.get('paymentMethod');
    const search = searchParams.get('search');

    // For now, return mock data to test if the route works
    const mockPayments = [
      {
        _id: '1',
        user: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        },
        type: 'event_ticket',
        purpose: 'Test Payment',
        amount: 10.00,
        currency: 'USD',
        paymentMethod: 'hormuud',
        status: 'completed',
        createdAt: new Date().toISOString(),
        paymentDetails: {
          phoneNumber: '1234567890',
          transactionId: 'TEST_123'
        }
      }
    ];

    const mockResponse = {
      payments: mockPayments,
      pagination: {
        page,
        limit,
        total: 1,
        pages: 1,
      },
    };

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('Admin payments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 