// Email templates for automated notifications

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export interface OrderConfirmationEmailData {
  userName: string;
  userEmail: string;
  orderNumber: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  totalAmount: number;
  shippingAddress: string;
  shippingCost: number;
  expectedDelivery?: string;
}

export interface NewsletterSubscriptionEmailData {
  userName?: string;
  userEmail: string;
}

const baseEmailStyles = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background-color: #d6b25e; padding: 30px 20px; text-align: center; }
    .email-header h1 { color: #1f2937; font-size: 24px; font-weight: 600; }
    .email-body { padding: 30px 20px; }
    .email-footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 12px 24px; background-color: #d6b25e; color: #1f2937; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .button:hover { background-color: #c9a243; }
    .order-item { padding: 15px; border-bottom: 1px solid #e5e7eb; display: flex; gap: 15px; }
    .order-item:last-child { border-bottom: none; }
    .order-item-image { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
    .order-item-details { flex: 1; }
    .order-item-name { font-weight: 600; color: #1f2937; margin-bottom: 4px; }
    .order-item-meta { font-size: 14px; color: #6b7280; }
    .order-summary { background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .order-summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .order-summary-total { font-size: 18px; font-weight: 600; color: #1f2937; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 8px; }
    .address-box { background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .order-item { flex-direction: column; }
    }
  </style>
`;

export function getWelcomeEmailTemplate(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Welcome to Zoozu</title>
  ${baseEmailStyles}
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Welcome to Zoozu!</h1>
    </div>
    <div class="email-body">
      <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.userName},</p>
      
      <p style="margin-bottom: 15px;">
        Thank you for joining Zoozu! We're thrilled to have you as part of our community of style enthusiasts.
      </p>
      
      <p style="margin-bottom: 15px;">
        Your account has been successfully created. Here's what you can do on our platform:
      </p>
      
      <ul style="margin: 20px 0; padding-left: 20px; line-height: 2;">
        <li>Browse our exclusive collection of premium fashion pieces</li>
        <li>Save your favorite items to your wishlist</li>
        <li>Book custom orders and bespoke fittings</li>
        <li>Track your orders and manage your profile</li>
        <li>Enjoy seamless shopping with secure payment options</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://zoozu.ng'}/collections" class="button">
          Start Shopping
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        If you have any questions or need assistance, feel free to reach out to our support team.
      </p>
      
      <p style="margin-top: 20px;">
        Happy shopping!<br>
        <strong>The Zoozu Team</strong>
      </p>
    </div>
    <div class="email-footer">
      <p>© ${new Date().getFullYear()} Zoozu. All rights reserved.</p>
      <p style="margin-top: 10px;">
        <a href="${process.env.FRONTEND_URL || 'https://zoozu.ng'}" style="color: #d6b25e; text-decoration: none;">Visit our website</a> | 
        <a href="${process.env.FRONTEND_URL || 'https://zoozu.ng'}/contact" style="color: #d6b25e; text-decoration: none;">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getOrderConfirmationEmailTemplate(data: OrderConfirmationEmailData): string {
  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
  const subtotal = data.totalAmount - data.shippingCost;
  const expectedDelivery = data.expectedDelivery || '5-7 business days';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Order Confirmation - ${data.orderNumber}</title>
  ${baseEmailStyles}
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Order Confirmed!</h1>
    </div>
    <div class="email-body">
      <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.userName},</p>
      
      <p style="margin-bottom: 20px;">
        Thank you for your order! We've received your payment and your order is being processed.
      </p>
      
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="font-weight: 600; color: #166534; margin-bottom: 5px;">Order Number: ${data.orderNumber}</p>
        <p style="color: #166534; font-size: 14px;">Payment Status: Paid ✓</p>
      </div>
      
      <h2 style="font-size: 18px; margin: 30px 0 15px 0; color: #1f2937;">Order Items</h2>
      <div style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
        ${data.items.map(item => `
          <div class="order-item">
            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="order-item-image" />` : ''}
            <div class="order-item-details">
              <div class="order-item-name">${item.name}</div>
              <div class="order-item-meta">
                Quantity: ${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(item.quantity * item.price)}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="order-summary">
        <div class="order-summary-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="order-summary-row">
          <span>Shipping:</span>
          <span>${formatCurrency(data.shippingCost)}</span>
        </div>
        <div class="order-summary-row order-summary-total">
          <span>Total:</span>
          <span>${formatCurrency(data.totalAmount)}</span>
        </div>
      </div>
      
      <h2 style="font-size: 18px; margin: 30px 0 15px 0; color: #1f2937;">Shipping Address</h2>
      <div class="address-box">
        <p style="white-space: pre-line; line-height: 1.8;">${data.shippingAddress}</p>
      </div>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="font-weight: 600; color: #92400e; margin-bottom: 5px;">Expected Delivery</p>
        <p style="color: #92400e; font-size: 14px;">${expectedDelivery}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://zoozu.ng'}/profile/orders/${data.orderId}" class="button">
          View Order Details
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        We'll send you another email when your order ships. If you have any questions, please don't hesitate to contact us.
      </p>
      
      <p style="margin-top: 20px;">
        Thank you for shopping with us!<br>
        <strong>The Zoozu Team</strong>
      </p>
    </div>
    <div class="email-footer">
      <p>© ${new Date().getFullYear()} Zoozu. All rights reserved.</p>
      <p style="margin-top: 10px;">
        <a href="${process.env.FRONTEND_URL || 'https://zoozu.ng'}" style="color: #d6b25e; text-decoration: none;">Visit our website</a> | 
        <a href="${process.env.FRONTEND_URL || 'https://zoozu.ng'}/contact" style="color: #d6b25e; text-decoration: none;">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getNewsletterSubscriptionEmailTemplate(data: NewsletterSubscriptionEmailData): string {
  const displayName = data.userName || 'Valued Subscriber';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Welcome to the Inner Circle</title>
  ${baseEmailStyles}
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Welcome to the Inner Circle!</h1>
    </div>
    <div class="email-body">
      <p style="font-size: 16px; margin-bottom: 20px;">Hello ${displayName},</p>
      
      <p style="margin-bottom: 20px;">
        Thank you for joining the Inner Circle! We're thrilled to have you as part of our exclusive community.
      </p>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="font-weight: 600; color: #92400e; margin-bottom: 10px;">What's Next?</p>
        <p style="color: #92400e; font-size: 14px; line-height: 1.8;">
          As a member of the Inner Circle, you'll be the first to know about:<br>
          • New collection launches<br>
          • Exclusive private sales<br>
          • Special promotions and discounts<br>
          • Style tips and fashion inspiration<br>
          • Behind-the-scenes content
        </p>
      </div>
      
      <p style="margin-bottom: 15px;">
        We promise to only send you the most valuable updates and never spam your inbox. You can unsubscribe at any time if you change your mind.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://zoozu.ng'}/collections" class="button">
          Explore Our Collections
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        Stay tuned for exciting updates coming your way soon!
      </p>
      
      <p style="margin-top: 20px;">
        Welcome aboard!<br>
        <strong>The Zoozu Team</strong>
      </p>
    </div>
    <div class="email-footer">
      <p>© ${new Date().getFullYear()} Zoozu. All rights reserved.</p>
      <p style="margin-top: 10px;">
        <a href="${process.env.FRONTEND_URL || 'https://zoozu.ng'}" style="color: #d6b25e; text-decoration: none;">Visit our website</a> | 
        <a href="${process.env.FRONTEND_URL || 'https://zoozu.ng'}/contact" style="color: #d6b25e; text-decoration: none;">Contact Support</a>
      </p>
      <p style="margin-top: 10px; font-size: 11px; color: #9ca3af;">
        You're receiving this email because you subscribed to the Inner Circle newsletter. 
        <a href="${process.env.FRONTEND_URL || 'https://zoozu.ng'}/newsletter/unsubscribe?email=${encodeURIComponent(data.userEmail)}" style="color: #d6b25e; text-decoration: none;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

